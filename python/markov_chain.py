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


def compute_stationary_distribution(matrix_csv: str, output_csv: str, replacement_map: dict[str, str]) -> None:
    """遷移行列CSVから定常分布を計算し、検証して保存する"""
    # トポロジー行列の読み込み
    df_topology = pd.read_csv(matrix_csv, index_col=0)
    similarity_matrix = df_topology.to_numpy()

    # 遷移確率行列の構築
    N = similarity_matrix.shape[1]  # ノード数
    row_sums = similarity_matrix.sum(axis=1, keepdims=True)
    P = np.zeros_like(similarity_matrix, dtype=float)

    # 行和が0でない行：正規化して遷移確率を計算
    non_zero_rows = (row_sums != 0).flatten()
    P[non_zero_rows, :] = similarity_matrix[non_zero_rows, :] / row_sums[non_zero_rows]

    # 行和が0の行：一様分布を設定
    zero_rows = ~non_zero_rows
    P[zero_rows, :] = 1 / N

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
        raise RuntimeError(
            f"定常分布の検証に失敗しました（np.allcloseで不一致）。matrix={matrix_csv}"
        )

    # 結果の整形と保存
    indices = sorted_indices(stationary_dist)
    stationary_df = pd.DataFrame({
        "node": [df_topology.columns[i] for i in indices],
        "prob": stationary_dist[indices].round(3)
    })

    # クラス名をファイル名に置換
    stationary_df["node"] = stationary_df["node"].replace(replacement_map)

    # CSV出力
    stationary_df.set_index("node").to_csv(output_csv, encoding="utf-8")
    print(f"定常分布を保存しました: {output_csv}\n")


if __name__ == "__main__":
    replacement_map = {
        "Book": "book.py",
        "Member": "member.py",
        "Library": "library.py",
        "main": "main.py",
    }

    compute_stationary_distribution(
        "topology_matrix.csv", "data/stationary_distribution_topology.csv", replacement_map
    )
    compute_stationary_distribution(
        "topology_matrix_duplicate.csv", "data/stationary_distribution_duplicate.csv", replacement_map
    )
    compute_stationary_distribution(
        "topology_matrix_exceed.csv", "data/stationary_distribution_exceed.csv", replacement_map
    )

    print("全ての定常分布計算が完了しました。")