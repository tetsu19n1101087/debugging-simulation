from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import re
import tokenize
from io import StringIO
import keyword
import json

bug_report = "This error allows a member to borrow more books than the defined borrowing limit."


# 1. 識別子を camelCase / snake_case で分割
def split_identifier(identifier):
    parts = identifier.split("_")
    split_parts = []
    for part in parts:
        sub_parts = re.findall(r"[A-Z]?[a-z]+|[A-Z]+(?=[A-Z]|$)", part)
        split_parts.extend([s.lower() for s in sub_parts if s])
    return split_parts


def tokenize_with_operator_and_split(code):
    tokens = []
    reader = StringIO(code).readline
    for toknum, tokval, *_ in tokenize.generate_tokens(reader):
        if toknum == tokenize.NAME:
            # Pythonキーワードかどうかをチェック
            if tokval in keyword.kwlist:
                tokens.append(tokval)  # そのまま追加（例: def, return, import）
            else:
                # ドットケースの分割を追加
                dot_split_parts = tokval.split(".")
                for part in dot_split_parts:
                    tokens.extend(split_identifier(part))  # 分割して追加
        elif toknum == tokenize.STRING:
            # 文字列トークンからクォーテーションを取り除き、split_identifierに渡す
            # cleaned_string = tokval.strip('"\'')
            tokens.extend(split_identifier(tokval))
        elif toknum in [tokenize.OP, tokenize.NUMBER]:
            tokens.append(tokval)
        # 改行、インデント、デデント、コメントなどは無視またはそのまま追加
        elif toknum in [tokenize.NEWLINE, tokenize.NL, tokenize.INDENT, tokenize.DEDENT, tokenize.COMMENT]:
            pass  # これらのトークンは処理に含めない
        # else:
        #     tokens.append(tokval) # その他のトークン（例: ENCODING, ENDMARKERなど）は保持

    return tokens


# topology_edges.json を読み込み

with open("topology_edges.json", "r", encoding="utf-8") as f:
    edges = json.load(f)

# ラベルを抽出してフラット化
edge_labels = []
edge_names = []  # エッジ識別子

for source, target, label in edges:
    edge_id = f"{source} → {target}"

    # ラベルが配列の場合、各要素を個別に処理
    if isinstance(label, list):
        for single_label in label:
            edge_labels.append(single_label)
            edge_names.append(f"{edge_id} | {single_label[:50]}...")  # 識別用（表示名）
    else:
        edge_labels.append(label)
        edge_names.append(edge_id)

# bug_report を最初に追加
edge_labels_with_bug = [bug_report] + edge_labels
edge_names_with_bug = ["bug_report"] + edge_names

print(f"エッジラベル数（bug_report含む）: {len(edge_labels_with_bug)}")

"""### ベクトル化"""

# analyzer を指定
vectorizer = TfidfVectorizer(analyzer=tokenize_with_operator_and_split)

# edge_labels_with_bug をベクトル化
tfidf_matrix_edges = vectorizer.fit_transform(edge_labels_with_bug)

# 特徴語（列名）を取得
feature_names = vectorizer.get_feature_names_out()

# 行列をDataFrameに変換（各行がドキュメント、各列が単語）
df_edge_labels = pd.DataFrame(tfidf_matrix_edges.toarray(), columns=feature_names, index=edge_names_with_bug)

# エッジラベル間のコサイン類似度行列を計算
similarity_matrix_edges = cosine_similarity(tfidf_matrix_edges)

# DataFrameに変換
similarity_df_edges = pd.DataFrame(similarity_matrix_edges, index=edge_names_with_bug, columns=edge_names_with_bug)

# 類似度行列をCSVで保存
similarity_df_edges.to_csv("edge_label_similarity_matrix.csv", encoding="utf-8")

# bug_report との類似度を抽出
bug_similarity = similarity_df_edges.loc["bug_report"].drop("bug_report")

# main→* は同じ参照先ごとに平均を計算
aggregated_main_list: dict[str, list[float]] = {}
for label, score in bug_similarity.items():
    if label.startswith("main → "):
        # "main → Library | ..." から "main → Library" を抽出
        parts = label.split(" | ")
        target_label = parts[0].strip()  # "main → Library"
        if target_label not in aggregated_main_list:
            aggregated_main_list[target_label] = []
        aggregated_main_list[target_label].append(float(score))

# 平均を計算
aggregated_main = {k: sum(v) / len(v) for k, v in aggregated_main_list.items()}

# main 以外はそのまま
non_main = {label: float(score) for label, score in bug_similarity.items() if not label.startswith("main → ")}

# 合算結果をまとめる
combined = aggregated_main.copy()
combined.update(non_main)

bug_similarity_df = pd.DataFrame(
    {"Edge Label": list(combined.keys()), "Cosine Similarity": list(combined.values())}
).sort_values(by="Cosine Similarity", ascending=False)

bug_similarity_df.to_csv("bug_report_similarity.csv", index=False, encoding="utf-8")
print("CSVを保存しました: bug_report_similarity.csv (main→* は平均計算)")

# ===== トポロジーをJSONから構築してコサイン類似度を当てはめる =====
# ノード一覧の読み込み（analyze_topology.py の出力を利用）
with open("topology_nodes.json", "r", encoding="utf-8") as f_nodes:
    sorted_nodes = json.load(f_nodes)

# 0で初期化した行列を作成
size = len(sorted_nodes)
topo_matrix = pd.DataFrame(0.0, index=sorted_nodes, columns=sorted_nodes)

# エッジを読み込み、存在する source→target を 1.0 に設定
with open("topology_edges.json", "r", encoding="utf-8") as f_edges:
    edges_for_matrix = json.load(f_edges)

for source, target, _label in edges_for_matrix:
    if source in topo_matrix.index and target in topo_matrix.columns:
        topo_matrix.loc[source, target] = 1.0

# bug_report 類似度で 1.0 のセルを置き換え
for _idx, row in bug_similarity_df.iterrows():
    edge_label = row["Edge Label"]
    similarity = float(row["Cosine Similarity"])

    parts = edge_label.split(" → ")
    source = parts[0].strip()
    target = parts[1].split(" | ")[0].strip()

    if source in topo_matrix.index and target in topo_matrix.columns:
        if topo_matrix.loc[source, target] == 1.0:
            topo_matrix.loc[source, target] = similarity

# コサイン類似度が 0 のセルを 1e-10 に置き換え
for _idx, row in bug_similarity_df.iterrows():
    edge_label = row["Edge Label"]
    similarity = float(row["Cosine Similarity"])

    if similarity == 0.0:
        parts = edge_label.split(" → ")
        source = parts[0].strip()
        target = parts[1].split(" | ")[0].strip()

        if source in topo_matrix.index and target in topo_matrix.columns:
            topo_matrix.loc[source, target] = 1e-10

topo_matrix.to_csv("topology_matrix.csv", encoding="utf-8")
print("JSONからトポロジーを構築し、類似度を反映しました: topology_matrix.csv")
