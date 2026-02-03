import pandas as pd
import numpy as np


def google_matrix(P, alpha=0.85):
    """
    Google行列を計算（PageRankアルゴリズム用）

    Args:
        P: 遷移確率行列
        alpha: ダンピングファクター（デフォルト: 0.85）

    Returns:
        Google行列
    """
    N = P.shape[0]
    uniform = np.ones((N, N)) / N
    G = alpha * P + (1 - alpha) * uniform
    return G


def sorted_indices(arr):
    """降順でソートされたインデックスを返す"""
    return np.argsort(-arr)


def build_transition_matrix(similarity_matrix: np.ndarray) -> np.ndarray:
    """類似度行列から遷移確率行列を構築する（行正規化）。"""
    N = similarity_matrix.shape[1]
    row_sums = similarity_matrix.sum(axis=1, keepdims=True)
    P = np.zeros_like(similarity_matrix, dtype=float)

    non_zero_rows = (row_sums != 0).flatten()
    P[non_zero_rows, :] = similarity_matrix[non_zero_rows, :] / row_sums[non_zero_rows]

    zero_rows = ~non_zero_rows
    P[zero_rows, :] = 1 / N

    return P


def compute_stationary_distribution(matrix_csv: str, output_csv: str, replacement_map: dict[str, str]) -> None:
    """遷移行列CSVから定常分布を計算し、検証して保存する"""
    # トポロジー行列の読み込み
    df_topology = pd.read_csv(matrix_csv, index_col=0)
    similarity_matrix = df_topology.to_numpy()

    # 遷移確率行列の構築
    P = build_transition_matrix(similarity_matrix)

    # Google行列の計算
    GP = google_matrix(P)

    # 定常分布の計算（固有値1に対応する固有ベクトル）
    eigvals, eigvecs = np.linalg.eig(GP.T)
    index = np.argmin(np.abs(eigvals - 1))
    stationary = np.real(eigvecs[:, index])
    stationary_dist = stationary / stationary.sum()

    # 検証：定常分布が不変かチェック
    result = stationary_dist @ GP
    match = np.allclose(stationary_dist, result)
    print(f"[{matrix_csv}] 定常分布:", stationary_dist, "\n")
    print(f"[{matrix_csv}] 定常分布 @ Google行列:", result, "\n")
    print(f"[{matrix_csv}] 一致するか:", match, "\n")

    if not match:
        raise RuntimeError(f"定常分布の検証に失敗しました（np.allcloseで不一致）。matrix={matrix_csv}")

    # 結果の整形と保存
    indices = sorted_indices(stationary_dist)
    stationary_df = pd.DataFrame(
        {"node": [df_topology.columns[i] for i in indices], "prob": stationary_dist[indices].round(3)}
    )

    # クラス名をファイル名に置換
    stationary_df["node"] = stationary_df["node"].replace(replacement_map)

    # CSV出力
    stationary_df.set_index("node").to_csv(output_csv, encoding="utf-8")
    print(f"定常分布を保存しました: {output_csv}\n")


def compute_stationary_distribution_from_matrices(
    matrix_csv_a: str,
    matrix_csv_b: str,
    output_csv: str,
    replacement_map: dict[str, str],
) -> None:
    """2つの行列を正規化して平均し、定常分布を計算して保存する"""
    df_a = pd.read_csv(matrix_csv_a, index_col=0)
    df_b = pd.read_csv(matrix_csv_b, index_col=0)

    if list(df_a.columns) != list(df_b.columns) or list(df_a.index) != list(df_b.index):
        raise ValueError("行列の行・列ラベルが一致しません。")

    P_a = build_transition_matrix(df_a.to_numpy())
    P_b = build_transition_matrix(df_b.to_numpy())
    P = (P_a + P_b) / 2

    GP = google_matrix(P)

    eigvals, eigvecs = np.linalg.eig(GP.T)
    index = np.argmin(np.abs(eigvals - 1))
    stationary = np.real(eigvecs[:, index])
    stationary_dist = stationary / stationary.sum()

    result = stationary_dist @ GP
    match = np.allclose(stationary_dist, result)
    print(f"[{matrix_csv_a} + {matrix_csv_b}] 定常分布:", stationary_dist, "\n")
    print(f"[{matrix_csv_a} + {matrix_csv_b}] 定常分布 @ Google行列:", result, "\n")
    print(f"[{matrix_csv_a} + {matrix_csv_b}] 一致するか:", match, "\n")

    if not match:
        raise RuntimeError(
            "定常分布の検証に失敗しました（np.allcloseで不一致）。"
            f"matrix_a={matrix_csv_a}, matrix_b={matrix_csv_b}"
        )

    indices = sorted_indices(stationary_dist)
    stationary_df = pd.DataFrame(
        {"node": [df_a.columns[i] for i in indices], "prob": stationary_dist[indices].round(3)}
    )
    stationary_df["node"] = stationary_df["node"].replace(replacement_map)
    stationary_df.set_index("node").to_csv(output_csv, encoding="utf-8")
    print(f"定常分布を保存しました: {output_csv}\n")


if __name__ == "__main__":
    replacement_map = {
        "Book": "book.py",
        "Member": "member.py",
        "Library": "library.py",
        "main": "main.py",
    }

    # トポロジーのみ
    compute_stationary_distribution("topology_matrix.csv", "data/stationary_distribution_topology.csv", replacement_map)
    
    # コサイン類似度
    compute_stationary_distribution(
        "topology_matrix_duplicate.csv", "data/stationary_distribution_cosine_duplicate.csv", replacement_map
    )
    compute_stationary_distribution(
        "topology_matrix_exceed.csv", "data/stationary_distribution_cosine_exceed.csv", replacement_map
    )

    # コードパターン
    compute_stationary_distribution(
        "topology_matrix_pattern_weighted_duplicate.csv",
        "data/stationary_distribution_pattern_weighted_duplicate.csv",
        replacement_map,
    )
    compute_stationary_distribution(
        "topology_matrix_pattern_weighted_exceed.csv",
        "data/stationary_distribution_pattern_weighted_exceed.csv",
        replacement_map,
    )

    # チャンク
    compute_stationary_distribution(
        "topology_matrix_chunk_weighted.csv", "data/stationary_distribution_chunk_weighted.csv", replacement_map
    )

    # コサイン + チャンク（正規化して平均）
    compute_stationary_distribution_from_matrices(
        "topology_matrix_duplicate.csv",
        "topology_matrix_chunk_weighted.csv",
        "data/stationary_distribution_cosine_chunk_weighted_avg_duplicate.csv",
        replacement_map,
    )

    compute_stationary_distribution_from_matrices(
        "topology_matrix_exceed.csv",
        "topology_matrix_chunk_weighted.csv",
        "data/stationary_distribution_cosine_chunk_weighted_avg_exceed.csv",
        replacement_map,
    )

    print("全ての定常分布計算が完了しました。")
