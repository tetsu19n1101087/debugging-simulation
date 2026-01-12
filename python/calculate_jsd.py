"""
2つの分布のJensen-Shannon Divergence を計算するスクリプト
実験データの平均訪問割合とモデルの定常分布を比較
"""

import pandas as pd
import numpy as np
from scipy.spatial.distance import jensenshannon


def load_distributions():
    """CSVから分布データを読み込む"""
    print("分布データを読み込み中...")

    # 実験データの平均訪問割合
    mean_prob_duplicate = pd.read_csv("data/mean_probability_duplicate.csv", index_col=0)
    mean_prob_exceed = pd.read_csv("data/mean_probability_exceed.csv", index_col=0)
    mean_prob_dup_true = pd.read_csv("data/mean_probability_duplicate_correct_true.csv", index_col=0)
    mean_prob_dup_false = pd.read_csv("data/mean_probability_duplicate_correct_false.csv", index_col=0)
    mean_prob_exc_true = pd.read_csv("data/mean_probability_exceed_correct_true.csv", index_col=0)
    mean_prob_exc_false = pd.read_csv("data/mean_probability_exceed_correct_false.csv", index_col=0)

    # モデルの定常分布
    stat_duplicate = pd.read_csv("data/stationary_distribution_cosine_duplicate.csv", index_col=0)
    stat_exceed = pd.read_csv("data/stationary_distribution_cosine_exceed.csv", index_col=0)
    stat_topology = pd.read_csv("data/stationary_distribution_topology.csv", index_col=0)
    stat_chunk = pd.read_csv("data/stationary_distribution_chunk_weighted.csv", index_col=0)

    # ノードのチャンク数（正規化）
    node_chunks = pd.read_csv("node_chunk_counts.csv", index_col=0)

    # ノードのコサイン類似度
    node_similarity = pd.read_csv("node_similarity.csv", index_col=0)

    return {
        "mean_prob": {
            "duplicate": mean_prob_duplicate.squeeze(),
            "exceed": mean_prob_exceed.squeeze(),
            "dup_true": mean_prob_dup_true.squeeze(),
            "dup_false": mean_prob_dup_false.squeeze(),
            "exc_true": mean_prob_exc_true.squeeze(),
            "exc_false": mean_prob_exc_false.squeeze(),
        },
        "stat_dist": {
            "cosine_duplicate": stat_duplicate.squeeze(),
            "cosine_exceed": stat_exceed.squeeze(),
            "topology": stat_topology.squeeze(),
            "chunk": stat_chunk.squeeze(),
        },
        "node_chunks": node_chunks["normalized_chunk_count"],
        "node_similarity": {
            "duplicate": node_similarity["Duplicate_Similarity"],
            "exceed": node_similarity["Exceed_Similarity"],
        },
    }


def align_and_normalize(dist1, dist2):
    """2つの分布をアラインして正規化"""
    # インデックスを統合
    all_idx = list(set(dist1.index) | set(dist2.index))
    d1 = dist1.reindex(all_idx, fill_value=0)
    d2 = dist2.reindex(all_idx, fill_value=0)

    # 正規化
    d1 = d1 / d1.sum()
    d2 = d2 / d2.sum()

    return d1, d2


def calculate_jsd(dist1, dist2):
    """Jensen-Shannon Divergenceを計算"""
    d1, d2 = align_and_normalize(dist1, dist2)
    jsd_value = jensenshannon(d1, d2, base=2) ** 2
    return jsd_value


def main():
    distributions = load_distributions()
    mean_prob = distributions["mean_prob"]
    stat_dist = distributions["stat_dist"]
    node_chunks = distributions["node_chunks"]
    node_similarity = distributions["node_similarity"]

    results = []

    print("\n" + "=" * 70)
    print("全てのモデルと全てのタスク、全ての条件のJensen-Shannon Divergence")
    print("=" * 70)

    # 全てのモデルについて計算
    for model_name, model_dist in stat_dist.items():
        print(f"\n--- {model_name} モデル ---")

        # Duplicateタスク（model が cosine_exceed でない場合）
        if model_name != "cosine_exceed":
            jsd_dup_all = calculate_jsd(mean_prob["duplicate"], model_dist)
            results.append(["duplicate", model_name, "all", jsd_dup_all])
            print(f"mean_prob_duplicate vs stat_{model_name}: {jsd_dup_all:.6f}")

            jsd_dup_true = calculate_jsd(mean_prob["dup_true"], model_dist)
            results.append(["duplicate", model_name, "true", jsd_dup_true])
            print(f"mean_prob_duplicate_correct_true vs stat_{model_name}: {jsd_dup_true:.6f}")

            jsd_dup_false = calculate_jsd(mean_prob["dup_false"], model_dist)
            results.append(["duplicate", model_name, "false", jsd_dup_false])
            print(f"mean_prob_duplicate_correct_false vs stat_{model_name}: {jsd_dup_false:.6f}")

        # Exceedタスク（model が cosine_duplicate でない場合）
        if model_name != "cosine_duplicate":
            jsd_exc_all = calculate_jsd(mean_prob["exceed"], model_dist)
            results.append(["exceed", model_name, "all", jsd_exc_all])
            print(f"mean_prob_exceed vs stat_{model_name}: {jsd_exc_all:.6f}")

            jsd_exc_true = calculate_jsd(mean_prob["exc_true"], model_dist)
            results.append(["exceed", model_name, "true", jsd_exc_true])
            print(f"mean_prob_exceed_correct_true vs stat_{model_name}: {jsd_exc_true:.6f}")

            jsd_exc_false = calculate_jsd(mean_prob["exc_false"], model_dist)
            results.append(["exceed", model_name, "false", jsd_exc_false])
            print(f"mean_prob_exceed_correct_false vs stat_{model_name}: {jsd_exc_false:.6f}")

    # ノードのチャンク数との比較
    print(f"\n--- node_chunks ---")
    jsd_chunks_dup_all = calculate_jsd(node_chunks, mean_prob["duplicate"])
    results.append(["duplicate", "node_chunks", "all", jsd_chunks_dup_all])
    print(f"node_chunks vs mean_prob_duplicate: {jsd_chunks_dup_all:.6f}")

    jsd_chunks_dup_true = calculate_jsd(node_chunks, mean_prob["dup_true"])
    results.append(["duplicate", "node_chunks", "true", jsd_chunks_dup_true])
    print(f"node_chunks vs mean_prob_duplicate_correct_true: {jsd_chunks_dup_true:.6f}")

    jsd_chunks_dup_false = calculate_jsd(node_chunks, mean_prob["dup_false"])
    results.append(["duplicate", "node_chunks", "false", jsd_chunks_dup_false])
    print(f"node_chunks vs mean_prob_duplicate_correct_false: {jsd_chunks_dup_false:.6f}")

    jsd_chunks_exc_all = calculate_jsd(node_chunks, mean_prob["exceed"])
    results.append(["exceed", "node_chunks", "all", jsd_chunks_exc_all])
    print(f"node_chunks vs mean_prob_exceed: {jsd_chunks_exc_all:.6f}")

    jsd_chunks_exc_true = calculate_jsd(node_chunks, mean_prob["exc_true"])
    results.append(["exceed", "node_chunks", "true", jsd_chunks_exc_true])
    print(f"node_chunks vs mean_prob_exceed_correct_true: {jsd_chunks_exc_true:.6f}")

    jsd_chunks_exc_false = calculate_jsd(node_chunks, mean_prob["exc_false"])
    results.append(["exceed", "node_chunks", "false", jsd_chunks_exc_false])
    print(f"node_chunks vs mean_prob_exceed_correct_false: {jsd_chunks_exc_false:.6f}")

    # ノードのコサイン類似度との比較（同じタスク同士のみ）
    print(f"\n--- node_similarity ---")
    jsd_sim_dup_all = calculate_jsd(node_similarity["duplicate"], mean_prob["duplicate"])
    results.append(["duplicate", "node_similarity", "all", jsd_sim_dup_all])
    print(f"node_similarity_duplicate vs mean_prob_duplicate: {jsd_sim_dup_all:.6f}")

    jsd_sim_dup_true = calculate_jsd(node_similarity["duplicate"], mean_prob["dup_true"])
    results.append(["duplicate", "node_similarity", "true", jsd_sim_dup_true])
    print(f"node_similarity_duplicate vs mean_prob_duplicate_correct_true: {jsd_sim_dup_true:.6f}")

    jsd_sim_dup_false = calculate_jsd(node_similarity["duplicate"], mean_prob["dup_false"])
    results.append(["duplicate", "node_similarity", "false", jsd_sim_dup_false])
    print(f"node_similarity_duplicate vs mean_prob_duplicate_correct_false: {jsd_sim_dup_false:.6f}")

    jsd_sim_exc_all = calculate_jsd(node_similarity["exceed"], mean_prob["exceed"])
    results.append(["exceed", "node_similarity", "all", jsd_sim_exc_all])
    print(f"node_similarity_exceed vs mean_prob_exceed: {jsd_sim_exc_all:.6f}")

    jsd_sim_exc_true = calculate_jsd(node_similarity["exceed"], mean_prob["exc_true"])
    results.append(["exceed", "node_similarity", "true", jsd_sim_exc_true])
    print(f"node_similarity_exceed vs mean_prob_exceed_correct_true: {jsd_sim_exc_true:.6f}")

    jsd_sim_exc_false = calculate_jsd(node_similarity["exceed"], mean_prob["exc_false"])
    results.append(["exceed", "node_similarity", "false", jsd_sim_exc_false])
    print(f"node_similarity_exceed vs mean_prob_exceed_correct_false: {jsd_sim_exc_false:.6f}")

    # 結果をCSVに保存
    results_df = pd.DataFrame(results, columns=["task", "model", "condition", "jsd"])

    # モデル名を統一（cosine_duplicate と cosine_exceed を cosine に統一）
    results_df["model"] = results_df["model"].replace(["cosine_duplicate", "cosine_exceed"], "cosine")

    # カラムの順序を変更（model を一番左に）
    results_df = results_df[["model", "task", "condition", "jsd"]]

    # モデルの順番を指定（topology→cosine→chunk→node_similarity→node_chunks）
    model_order = {
        "topology": 0,
        "cosine": 1,
        "chunk": 2,
        "node_similarity": 3,
        "node_chunks": 4,
    }
    results_df["model_order"] = results_df["model"].map(model_order)

    # conditionの順番を指定（all→true→false）
    condition_order = {"all": 0, "true": 1, "false": 2}
    results_df["condition_order"] = results_df["condition"].map(condition_order)

    results_df = results_df.sort_values(by=["model_order", "task", "condition_order"]).drop(
        ["model_order", "condition_order"], axis=1
    )
    results_df = results_df.reset_index(drop=True)

    output_file = "data/jsd_results.csv"
    results_df.to_csv(output_file, index=False)

    print("\n" + "=" * 70)
    print(f"結果を保存しました: {output_file}")
    print("=" * 70)
    print(results_df.to_string(index=False))


if __name__ == "__main__":
    main()
