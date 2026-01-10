import os
import ast
import json
import pandas as pd
import re
from collections import defaultdict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

bug_report_duplicate = "It is possible to add another book with the same ISBN to your library, which may overwrite existing data or result in duplicate registrations of the same book."
bug_report_exceed = "This error allows a member to borrow more books than the defined borrowing limit."

# =====================================
# コードパターン抽出
# =====================================


def extract_code_patterns(code_str):
    """
    コードから以下のパターンを抽出：
    1. 条件分岐（if文）の有無
    2. ループ（for/while）の有無
    3. 返り値の代入
    4. メソッド呼び出し
    5. 辞書操作
    """
    patterns = []

    try:
        tree = ast.parse(code_str)
    except:
        return patterns

    # AST を走査
    for node in ast.walk(tree):
        # if 文の検出
        if isinstance(node, ast.If):
            patterns.append("conditional_branch")

        # ループの検出
        if isinstance(node, (ast.For, ast.While)):
            patterns.append("loop")

        # 代入の検出（特に返り値の代入）
        if isinstance(node, ast.Assign):
            if isinstance(node.value, ast.Call):
                patterns.append("assignment_from_call")

        # メソッド呼び出しの検出
        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Attribute):
                patterns.append("method_call")

        # 辞書操作の検出
        if isinstance(node, ast.Subscript):
            if isinstance(node.value, ast.Name) or isinstance(node.value, ast.Attribute):
                patterns.append("dict_access")

    return patterns


def extract_patterns_from_ast_node(node):
    """
    ASTノード配下からコードパターンを抽出（メソッド／クラス単位）
    """
    patterns = []
    for n in ast.walk(node):
        if isinstance(n, ast.If):
            patterns.append("conditional_branch")
        if isinstance(n, (ast.For, ast.While)):
            patterns.append("loop")
        if isinstance(n, ast.Assign):
            if isinstance(n.value, ast.Call):
                patterns.append("assignment_from_call")
        if isinstance(n, ast.Call):
            if isinstance(n.func, ast.Attribute):
                patterns.append("method_call")
        if isinstance(n, ast.Subscript):
            if isinstance(n.value, (ast.Name, ast.Attribute)):
                patterns.append("dict_access")
    return patterns


def analyze_source_code_patterns(debug_dir):
    """
    debug_experiment ディレクトリ内の全てのPythonファイルを解析し、
    パターンの出現頻度を計算
    """
    pattern_counts = defaultdict(int)
    file_patterns = {}
    symbol_patterns = {}
    class_patterns = {}

    for filename in os.listdir(debug_dir):
        if filename.endswith(".py"):
            filepath = os.path.join(debug_dir, filename)
            with open(filepath, "r", encoding="utf-8") as f:
                code = f.read()

            patterns = extract_code_patterns(code)
            file_patterns[filename] = patterns

            # AST解析：クラス／メソッド単位のパターン
            try:
                tree = ast.parse(code)
                for node in ast.walk(tree):
                    if isinstance(node, ast.ClassDef):
                        class_name = node.name
                        # クラス全体のパターン
                        class_patterns[class_name] = extract_patterns_from_ast_node(node)
                        # メソッド単位
                        for child in node.body:
                            if isinstance(child, ast.FunctionDef):
                                symbol = f"{class_name}.{child.name}"
                                symbol_patterns[symbol] = extract_patterns_from_ast_node(child)
            except Exception:
                pass

            # デバッグ出力（ファイル単位の集計）
            print(f"\n{filename} のパターン:")
            pattern_summary = defaultdict(int)
            for pattern in patterns:
                pattern_summary[pattern] += 1
            for pattern, count in pattern_summary.items():
                print(f"  {pattern}: {count}回")

            for pattern in patterns:
                pattern_counts[pattern] += 1

    return pattern_counts, file_patterns, symbol_patterns, class_patterns


# =====================================
# バグレポート関連度スコア計算
# =====================================


def get_pattern_bug_associations():
    """
    各パターンがどのバグタイプと関連するかを定義
    バグタイプごとに異なる重みを設定
    """
    return {
        "duplicate": {
            "conditional_branch": 1.0,  # 重複チェックに必要な条件分岐
            "dict_access": 2.0,  # 辞書アクセスは重複チェックの中核なので重み大
            "loop": 0.0,  # 重複とは無関係
            "assignment_from_call": 0.0,
            "method_call": 0.0,
        },
        "exceed": {
            "conditional_branch": 1.0,  # 借出制限チェックに必要な条件分岐
            "dict_access": 0.0,  # 辞書アクセスは借出制限とは無関係
            "loop": 2.0,  # ループ内でのカウント処理は中核なので重み大
            "assignment_from_call": 0.0,
            "method_call": 0.0,
        },
    }


def compute_node_weighted_score(node_name, symbol_patterns, class_patterns, bug_type="duplicate"):
    """
    各ノード（メソッド/関数）に対して、バグタイプに関連するパターンの重み付きスコア（未正規化）を計算
    """
    pattern_weights = get_pattern_bug_associations()

    # ノード名からメソッド／クラスを特定
    node_patterns = []
    # 1) メソッド名で一致
    if node_name in symbol_patterns:
        node_patterns = symbol_patterns[node_name]
    else:
        # 2) クラス名で一致
        # 例: "Library" や "Book" など
        if node_name in class_patterns:
            node_patterns = class_patterns[node_name]
        else:
            # 3) "Class.method" の場合、念のため分割して探索
            if "." in node_name:
                cls = node_name.split(".")[0]
                if cls in class_patterns:
                    node_patterns = class_patterns[cls]

    # バグタイプに関連するパターンの重み付きスコアを計算
    weighted_score = 0.0
    pattern_detail = defaultdict(int)

    for pattern in node_patterns:
        weight = pattern_weights.get(bug_type, {}).get(pattern, 0.0)
        if weight > 0:
            weighted_score += weight
            pattern_detail[pattern] += 1

    # デバッグ出力
    if weighted_score > 0:
        print(f"  {node_name} ({bug_type}): スコア={weighted_score:.1f} ", end="")
        for p, cnt in pattern_detail.items():
            w = pattern_weights[bug_type][p]
            print(f"[{p}×{cnt}={w*cnt:.1f}]", end=" ")
        print()

    return weighted_score


# =====================================
# トポロジーの重み付け
# =====================================


def weight_topology_by_patterns(topology_matrix_path, debug_dir, output_path_duplicate, output_path_exceed):
    """
    コードパターンの出現数に基づいてトポロジーマトリックスを重み付け
    duplicateとexceedで異なるスコアを使用して2つのCSVを生成
    """
    # トポロジーマトリックスを読み込み
    topo_df = pd.read_csv(topology_matrix_path, index_col=0)

    # パターン情報を取得（ファイル／クラス／メソッド単位）
    pattern_counts, file_patterns, symbol_patterns, class_patterns = analyze_source_code_patterns(debug_dir)

    # duplicate 用の未正規化スコア計算（メソッド単位）
    raw_scores_duplicate = {}
    for node in topo_df.index:
        raw_scores_duplicate[node] = compute_node_weighted_score(
            node, symbol_patterns, class_patterns, bug_type="duplicate"
        )

    # exceed 用の未正規化スコア計算（メソッド単位）
    raw_scores_exceed = {}
    for node in topo_df.index:
        raw_scores_exceed[node] = compute_node_weighted_score(node, symbol_patterns, class_patterns, bug_type="exceed")

    # バグタイプ別に最大スコアで正規化（base 0.5 に + 0.5 * 比率）
    base = 0.5
    max_dup = max(raw_scores_duplicate.values()) if raw_scores_duplicate else 1.0
    max_exc = max(raw_scores_exceed.values()) if raw_scores_exceed else 1.0

    node_scores_duplicate = {}
    node_scores_exceed = {}
    for node in topo_df.index:
        dup_raw = raw_scores_duplicate.get(node, 0.0)
        exc_raw = raw_scores_exceed.get(node, 0.0)
        node_scores_duplicate[node] = base + (dup_raw / max_dup) * 0.5 if max_dup > 0 else base
        node_scores_exceed[node] = base + (exc_raw / max_exc) * 0.5 if max_exc > 0 else base

    # duplicate用のトポロジーマトリックスを重み付け（自己ループかつメソッドのみ）
    weighted_matrix_duplicate = topo_df.copy().astype(float)
    for source in weighted_matrix_duplicate.index:
        for target in weighted_matrix_duplicate.columns:
            if source != target:
                continue  # 自己ループのみ対象
            if source not in symbol_patterns:
                continue  # メソッドのみ対象
            if weighted_matrix_duplicate.loc[source, target] > 0:
                score = node_scores_duplicate.get(source, 0.5)
                multiplier = 1.0 + score  # デフォルト1より高くする
                weighted_matrix_duplicate.loc[source, target] *= multiplier

    # exceed用のトポロジーマトリックスを重み付け（自己ループかつメソッドのみ）
    weighted_matrix_exceed = topo_df.copy().astype(float)
    for source in weighted_matrix_exceed.index:
        for target in weighted_matrix_exceed.columns:
            if source != target:
                continue  # 自己ループのみ対象
            if source not in symbol_patterns:
                continue  # メソッドのみ対象
            if weighted_matrix_exceed.loc[source, target] > 0:
                score = node_scores_exceed.get(source, 0.5)
                multiplier = 1.0 + score  # デフォルト1より高くする
                weighted_matrix_exceed.loc[source, target] *= multiplier

    # 結果を保存
    weighted_matrix_duplicate.to_csv(output_path_duplicate, encoding="utf-8")
    weighted_matrix_exceed.to_csv(output_path_exceed, encoding="utf-8")

    print(f"\n=== パターンベースの重み付け完了 ===")
    print(f"入力: {topology_matrix_path}")
    print(f"出力 (duplicate): {output_path_duplicate}")
    print(f"出力 (exceed): {output_path_exceed}")

    print(f"\nノードのパターンスコア（duplicate関連）:")
    for node, score in sorted(node_scores_duplicate.items(), key=lambda x: x[1], reverse=True):
        print(f"  {node}: {score:.3f}")
    print(f"最大スコア（duplicate 未正規化）: {max_dup:.1f}")

    print(f"\nノードのパターンスコア（exceed関連）:")
    for node, score in sorted(node_scores_exceed.items(), key=lambda x: x[1], reverse=True):
        print(f"  {node}: {score:.3f}")
    print(f"最大スコア（exceed 未正規化）: {max_exc:.1f}")

    return weighted_matrix_duplicate, weighted_matrix_exceed, node_scores_duplicate, node_scores_exceed


# =====================================
# メイン処理
# =====================================

if __name__ == "__main__":
    debug_dir = "debug_experiment"

    # duplicate と exceed 用の重み付けを生成
    weight_topology_by_patterns(
        "topology_matrix.csv",
        debug_dir,
        "topology_matrix_pattern_weighted_duplicate.csv",
        "topology_matrix_pattern_weighted_exceed.csv",
    )

    print("\n=== 処理完了 ===")
    print("生成ファイル:")
    print("  - topology_matrix_pattern_weighted_duplicate.csv")
    print("  - topology_matrix_pattern_weighted_exceed.csv")
