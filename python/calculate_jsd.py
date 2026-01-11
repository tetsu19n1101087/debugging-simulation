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
    stat_duplicate = pd.read_csv("data/stationary_distribution_duplicate.csv", index_col=0)
    stat_exceed = pd.read_csv("data/stationary_distribution_exceed.csv", index_col=0)
    stat_topology = pd.read_csv("data/stationary_distribution_topology.csv", index_col=0)
    stat_pattern_dup = pd.read_csv("data/stationary_distribution_pattern_weighted_duplicate.csv", index_col=0)
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
            "duplicate": stat_duplicate.squeeze(),
            "exceed": stat_exceed.squeeze(),
            "topology": stat_topology.squeeze(),
            "pattern_dup": stat_pattern_dup.squeeze(),
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
    print("全データでのJensen-Shannon Divergence")
    print("=" * 70)

    # Duplicateタスク
    jsd_dup = calculate_jsd(mean_prob["duplicate"], stat_dist["duplicate"])
    results.append(["duplicate", "stationary_distribution_duplicate", "all_data", jsd_dup])
    print(f"mean_prob_duplicate vs stat_duplicate: {jsd_dup:.6f}")

    # Exceedタスク
    jsd_exc = calculate_jsd(mean_prob["exceed"], stat_dist["exceed"])
    results.append(["exceed", "stationary_distribution_exceed", "all_data", jsd_exc])
    print(f"mean_prob_exceed vs stat_exceed: {jsd_exc:.6f}")

    print("\n" + "=" * 70)
    print("トポロジーモデルとの比較")
    print("=" * 70)

    # Topology との比較
    jsd_dup_topo = calculate_jsd(mean_prob["duplicate"], stat_dist["topology"])
    results.append(["duplicate", "topology", "all_data", jsd_dup_topo])
    print(f"mean_prob_duplicate vs stat_topology: {jsd_dup_topo:.6f}")

    jsd_exc_topo = calculate_jsd(mean_prob["exceed"], stat_dist["topology"])
    results.append(["exceed", "topology", "all_data", jsd_exc_topo])
    print(f"mean_prob_exceed vs stat_topology: {jsd_exc_topo:.6f}")

    print("\n" + "=" * 70)
    print("パターン重み付けモデルとの比較")
    print("=" * 70)

    # Pattern weighted との比較
    jsd_dup_pattern = calculate_jsd(mean_prob["duplicate"], stat_dist["pattern_dup"])
    results.append(["duplicate", "pattern_weighted", "all_data", jsd_dup_pattern])
    print(f"mean_prob_duplicate vs stat_pattern_weighted: {jsd_dup_pattern:.6f}")

    print("\n" + "=" * 70)
    print("チャンク重み付けモデルとの比較")
    print("=" * 70)

    # Chunk weighted との比較
    jsd_dup_chunk = calculate_jsd(mean_prob["duplicate"], stat_dist["chunk"])
    results.append(["duplicate", "chunk_weighted", "all_data", jsd_dup_chunk])
    print(f"mean_prob_duplicate vs stat_chunk_weighted: {jsd_dup_chunk:.6f}")

    jsd_exc_chunk = calculate_jsd(mean_prob["exceed"], stat_dist["chunk"])
    results.append(["exceed", "chunk_weighted", "all_data", jsd_exc_chunk])
    print(f"mean_prob_exceed vs stat_chunk_weighted: {jsd_exc_chunk:.6f}")

    print("\n" + "=" * 70)
    print("正誤ごとのJensen-Shannon Divergence (Duplicate)")
    print("=" * 70)

    # Duplicate の正誤ごと
    jsd_dup_true = calculate_jsd(mean_prob["dup_true"], stat_dist["duplicate"])
    results.append(["duplicate", "stationary_distribution_duplicate", "correct_true", jsd_dup_true])
    print(f"mean_prob_duplicate_correct_true vs stat_duplicate: {jsd_dup_true:.6f}")

    jsd_dup_false = calculate_jsd(mean_prob["dup_false"], stat_dist["duplicate"])
    results.append(["duplicate", "stationary_distribution_duplicate", "correct_false", jsd_dup_false])
    print(f"mean_prob_duplicate_correct_false vs stat_duplicate: {jsd_dup_false:.6f}")

    print("\n" + "=" * 70)
    print("正誤ごとのJensen-Shannon Divergence (Exceed)")
    print("=" * 70)

    # Exceed の正誤ごと
    jsd_exc_true = calculate_jsd(mean_prob["exc_true"], stat_dist["exceed"])
    results.append(["exceed", "stationary_distribution_exceed", "correct_true", jsd_exc_true])
    print(f"mean_prob_exceed_correct_true vs stat_exceed: {jsd_exc_true:.6f}")

    jsd_exc_false = calculate_jsd(mean_prob["exc_false"], stat_dist["exceed"])
    results.append(["exceed", "stationary_distribution_exceed", "correct_false", jsd_exc_false])
    print(f"mean_prob_exceed_correct_false vs stat_exceed: {jsd_exc_false:.6f}")

    print("\n" + "=" * 70)
    print("ノードのチャンク数との比較")
    print("=" * 70)

    # ノードのチャンク数 vs mean_probability_duplicate
    jsd_chunks_dup = calculate_jsd(node_chunks, mean_prob["duplicate"])
    print(f"node_chunk_counts vs mean_probability_duplicate: {jsd_chunks_dup:.6f}")

    # ノードのチャンク数 vs mean_probability_exceed
    jsd_chunks_exc = calculate_jsd(node_chunks, mean_prob["exceed"])
    print(f"node_chunk_counts vs mean_probability_exceed: {jsd_chunks_exc:.6f}")

    print("\n" + "=" * 70)
    print("ノードのコサイン類似度との比較")
    print("=" * 70)

    # node_similarity (duplicate) vs mean_probability_duplicate
    jsd_sim_dup = calculate_jsd(node_similarity["duplicate"], mean_prob["duplicate"])
    print(f"node_similarity_duplicate vs mean_probability_duplicate: {jsd_sim_dup:.6f}")

    # node_similarity (exceed) vs mean_probability_exceed
    jsd_sim_exc = calculate_jsd(node_similarity["exceed"], mean_prob["exceed"])
    print(f"node_similarity_exceed vs mean_probability_exceed: {jsd_sim_exc:.6f}")

    # 結果をCSVに保存
    results_df = pd.DataFrame(results, columns=["task", "model", "condition", "jsd"])
    output_file = "jsd_results.csv"
    results_df.to_csv(output_file, index=False)

    print("\n" + "=" * 70)
    print(f"結果を保存しました: {output_file}")
    print("=" * 70)
    print(results_df.to_string(index=False))


if __name__ == "__main__":
    main()
