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

    # 実験データの平均訪問割合（フル）
    mean_prob_full = {
        "duplicate": pd.read_csv("data/mean_probability_duplicate.csv", index_col=0).squeeze(),
        "exceed": pd.read_csv("data/mean_probability_exceed.csv", index_col=0).squeeze(),
        "dup_true": pd.read_csv("data/mean_probability_duplicate_correct_true.csv", index_col=0).squeeze(),
        "dup_false": pd.read_csv("data/mean_probability_duplicate_correct_false.csv", index_col=0).squeeze(),
        "exc_true": pd.read_csv("data/mean_probability_exceed_correct_true.csv", index_col=0).squeeze(),
        "exc_false": pd.read_csv("data/mean_probability_exceed_correct_false.csv", index_col=0).squeeze(),
    }

    # 実験データの平均訪問割合（先頭10行トリム済み）
    mean_prob_trimmed = {
        "duplicate": pd.read_csv("data/mean_probability_duplicate_trimmed.csv", index_col=0).squeeze(),
        "exceed": pd.read_csv("data/mean_probability_exceed_trimmed.csv", index_col=0).squeeze(),
        "dup_true": pd.read_csv("data/mean_probability_duplicate_correct_true_trimmed.csv", index_col=0).squeeze(),
        "dup_false": pd.read_csv("data/mean_probability_duplicate_correct_false_trimmed.csv", index_col=0).squeeze(),
        "exc_true": pd.read_csv("data/mean_probability_exceed_correct_true_trimmed.csv", index_col=0).squeeze(),
        "exc_false": pd.read_csv("data/mean_probability_exceed_correct_false_trimmed.csv", index_col=0).squeeze(),
    }

    # 実験データの平均訪問割合（stay_time >= 4秒）
    mean_prob_stay4s = {
        "duplicate": pd.read_csv("data/mean_probability_duplicate_stay4s.csv", index_col=0).squeeze(),
        "exceed": pd.read_csv("data/mean_probability_exceed_stay4s.csv", index_col=0).squeeze(),
        "dup_true": pd.read_csv("data/mean_probability_duplicate_correct_true_stay4s.csv", index_col=0).squeeze(),
        "dup_false": pd.read_csv("data/mean_probability_duplicate_correct_false_stay4s.csv", index_col=0).squeeze(),
        "exc_true": pd.read_csv("data/mean_probability_exceed_correct_true_stay4s.csv", index_col=0).squeeze(),
        "exc_false": pd.read_csv("data/mean_probability_exceed_correct_false_stay4s.csv", index_col=0).squeeze(),
    }

    # 実験データの平均訪問割合（連続遷移除去後）
    mean_prob_cleaned = {
        "duplicate": pd.read_csv("data/mean_probability_duplicate_cleaned.csv", index_col=0).squeeze(),
        "exceed": pd.read_csv("data/mean_probability_exceed_cleaned.csv", index_col=0).squeeze(),
    }

    # 実験データの平均訪問割合（最後の main.py 以降）
    mean_prob_post_main = {
        "duplicate": pd.read_csv("data/mean_probability_post_main_duplicate.csv", index_col=0).squeeze(),
        "exceed": pd.read_csv("data/mean_probability_post_main_exceed.csv", index_col=0).squeeze(),
    }

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
            "full": mean_prob_full,
            "trimmed": mean_prob_trimmed,
            "stay4s": mean_prob_stay4s,
            "cleaned": mean_prob_cleaned,
            "post_main": mean_prob_post_main,
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
    mean_prob_by_dataset = distributions["mean_prob"]
    stat_dist = distributions["stat_dist"]
    node_chunks = distributions["node_chunks"]
    node_similarity = distributions["node_similarity"]

    results = []

    print("\n" + "=" * 70)
    print("全てのモデルと全てのタスク、全ての条件のJensen-Shannon Divergence")
    print("=" * 70)

    for dataset_label, mean_prob in mean_prob_by_dataset.items():
        print(f"\n===== データセット: {dataset_label} =====")

        # 全てのモデルについて計算
        for model_name, model_dist in stat_dist.items():
            print(f"\n--- {model_name} モデル ---")

            # Duplicateタスク（model が cosine_exceed でない場合）
            if model_name != "cosine_exceed" and "duplicate" in mean_prob:
                jsd_dup_all = calculate_jsd(mean_prob["duplicate"], model_dist)
                results.append([dataset_label, model_name, "duplicate", "all", jsd_dup_all])
                print(f"mean_prob_duplicate ({dataset_label}) vs stat_{model_name}: {jsd_dup_all:.6f}")

                if "dup_true" in mean_prob:
                    jsd_dup_true = calculate_jsd(mean_prob["dup_true"], model_dist)
                    results.append([dataset_label, model_name, "duplicate", "true", jsd_dup_true])
                    print(f"mean_prob_duplicate_correct_true ({dataset_label}) vs stat_{model_name}: {jsd_dup_true:.6f}")

                if "dup_false" in mean_prob:
                    jsd_dup_false = calculate_jsd(mean_prob["dup_false"], model_dist)
                    results.append([dataset_label, model_name, "duplicate", "false", jsd_dup_false])
                    print(f"mean_prob_duplicate_correct_false ({dataset_label}) vs stat_{model_name}: {jsd_dup_false:.6f}")

            # Exceedタスク（model が cosine_duplicate でない場合）
            if model_name != "cosine_duplicate" and "exceed" in mean_prob:
                jsd_exc_all = calculate_jsd(mean_prob["exceed"], model_dist)
                results.append([dataset_label, model_name, "exceed", "all", jsd_exc_all])
                print(f"mean_prob_exceed ({dataset_label}) vs stat_{model_name}: {jsd_exc_all:.6f}")

                if "exc_true" in mean_prob:
                    jsd_exc_true = calculate_jsd(mean_prob["exc_true"], model_dist)
                    results.append([dataset_label, model_name, "exceed", "true", jsd_exc_true])
                    print(f"mean_prob_exceed_correct_true ({dataset_label}) vs stat_{model_name}: {jsd_exc_true:.6f}")

                if "exc_false" in mean_prob:
                    jsd_exc_false = calculate_jsd(mean_prob["exc_false"], model_dist)
                    results.append([dataset_label, model_name, "exceed", "false", jsd_exc_false])
                    print(f"mean_prob_exceed_correct_false ({dataset_label}) vs stat_{model_name}: {jsd_exc_false:.6f}")

        # ノードのチャンク数との比較
        print(f"\n--- node_chunks ({dataset_label}) ---")
        if "duplicate" in mean_prob:
            jsd_chunks_dup_all = calculate_jsd(node_chunks, mean_prob["duplicate"])
            results.append([dataset_label, "node_chunks", "duplicate", "all", jsd_chunks_dup_all])
            print(f"node_chunks vs mean_prob_duplicate ({dataset_label}): {jsd_chunks_dup_all:.6f}")

            if "dup_true" in mean_prob:
                jsd_chunks_dup_true = calculate_jsd(node_chunks, mean_prob["dup_true"])
                results.append([dataset_label, "node_chunks", "duplicate", "true", jsd_chunks_dup_true])
                print(f"node_chunks vs mean_prob_duplicate_correct_true ({dataset_label}): {jsd_chunks_dup_true:.6f}")

            if "dup_false" in mean_prob:
                jsd_chunks_dup_false = calculate_jsd(node_chunks, mean_prob["dup_false"])
                results.append([dataset_label, "node_chunks", "duplicate", "false", jsd_chunks_dup_false])
                print(f"node_chunks vs mean_prob_duplicate_correct_false ({dataset_label}): {jsd_chunks_dup_false:.6f}")

        if "exceed" in mean_prob:
            jsd_chunks_exc_all = calculate_jsd(node_chunks, mean_prob["exceed"])
            results.append([dataset_label, "node_chunks", "exceed", "all", jsd_chunks_exc_all])
            print(f"node_chunks vs mean_prob_exceed ({dataset_label}): {jsd_chunks_exc_all:.6f}")

            if "exc_true" in mean_prob:
                jsd_chunks_exc_true = calculate_jsd(node_chunks, mean_prob["exc_true"])
                results.append([dataset_label, "node_chunks", "exceed", "true", jsd_chunks_exc_true])
                print(f"node_chunks vs mean_prob_exceed_correct_true ({dataset_label}): {jsd_chunks_exc_true:.6f}")

            if "exc_false" in mean_prob:
                jsd_chunks_exc_false = calculate_jsd(node_chunks, mean_prob["exc_false"])
                results.append([dataset_label, "node_chunks", "exceed", "false", jsd_chunks_exc_false])
                print(f"node_chunks vs mean_prob_exceed_correct_false ({dataset_label}): {jsd_chunks_exc_false:.6f}")

        # ノードのコサイン類似度との比較（同じタスク同士のみ）
        print(f"\n--- node_similarity ({dataset_label}) ---")
        if "duplicate" in mean_prob:
            jsd_sim_dup_all = calculate_jsd(node_similarity["duplicate"], mean_prob["duplicate"])
            results.append([dataset_label, "node_similarity", "duplicate", "all", jsd_sim_dup_all])
            print(f"node_similarity_duplicate vs mean_prob_duplicate ({dataset_label}): {jsd_sim_dup_all:.6f}")

            if "dup_true" in mean_prob:
                jsd_sim_dup_true = calculate_jsd(node_similarity["duplicate"], mean_prob["dup_true"])
                results.append([dataset_label, "node_similarity", "duplicate", "true", jsd_sim_dup_true])
                print(f"node_similarity_duplicate vs mean_prob_duplicate_correct_true ({dataset_label}): {jsd_sim_dup_true:.6f}")

            if "dup_false" in mean_prob:
                jsd_sim_dup_false = calculate_jsd(node_similarity["duplicate"], mean_prob["dup_false"])
                results.append([dataset_label, "node_similarity", "duplicate", "false", jsd_sim_dup_false])
                print(f"node_similarity_duplicate vs mean_prob_duplicate_correct_false ({dataset_label}): {jsd_sim_dup_false:.6f}")

        if "exceed" in mean_prob:
            jsd_sim_exc_all = calculate_jsd(node_similarity["exceed"], mean_prob["exceed"])
            results.append([dataset_label, "node_similarity", "exceed", "all", jsd_sim_exc_all])
            print(f"node_similarity_exceed vs mean_prob_exceed ({dataset_label}): {jsd_sim_exc_all:.6f}")

            if "exc_true" in mean_prob:
                jsd_sim_exc_true = calculate_jsd(node_similarity["exceed"], mean_prob["exc_true"])
                results.append([dataset_label, "node_similarity", "exceed", "true", jsd_sim_exc_true])
                print(f"node_similarity_exceed vs mean_prob_exceed_correct_true ({dataset_label}): {jsd_sim_exc_true:.6f}")

            if "exc_false" in mean_prob:
                jsd_sim_exc_false = calculate_jsd(node_similarity["exceed"], mean_prob["exc_false"])
                results.append([dataset_label, "node_similarity", "exceed", "false", jsd_sim_exc_false])
                print(f"node_similarity_exceed vs mean_prob_exceed_correct_false ({dataset_label}): {jsd_sim_exc_false:.6f}")

    # 結果をCSVに保存
    results_df = pd.DataFrame(results, columns=["dataset", "model", "task", "condition", "jsd"])

    # モデル名を統一（cosine_duplicate と cosine_exceed を cosine に統一）
    results_df["model"] = results_df["model"].replace(["cosine_duplicate", "cosine_exceed"], "cosine")

    # 並び順を指定
    dataset_order = {"full": 0, "trimmed": 1, "stay4s": 2, "cleaned": 3, "post_main": 4}
    model_order = {
        "topology": 0,
        "cosine": 1,
        "chunk": 2,
        "node_similarity": 3,
        "node_chunks": 4,
    }
    condition_order = {"all": 0, "true": 1, "false": 2}

    results_df["dataset_order"] = results_df["dataset"].map(dataset_order)
    results_df["model_order"] = results_df["model"].map(model_order)
    results_df["condition_order"] = results_df["condition"].map(condition_order)

    results_df = results_df.sort_values(by=["dataset_order", "model_order", "task", "condition_order"]).drop(
        ["dataset_order", "model_order", "condition_order"], axis=1
    )
    results_df = results_df.reset_index(drop=True)

    # jsdを小数点第3位まで四捨五入
    results_df["jsd"] = results_df["jsd"].round(3)

    # jsdを文字列に変換し、先頭の "0" を削除（".266" 形式にする）
    results_df["jsd"] = results_df["jsd"].apply(lambda x: f"{x:.3f}".lstrip("0") if x < 1 else f"{x:.3f}")

    output_file = "data/jsd_results.csv"
    results_df.to_csv(output_file, index=False)

    print("\n" + "=" * 70)
    print(f"結果を保存しました: {output_file}")
    print("=" * 70)
    print(results_df.to_string(index=False))


if __name__ == "__main__":
    main()
