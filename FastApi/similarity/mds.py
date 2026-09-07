import numpy as np

class MDSModel:

    def __init__(self):
        self.V: np.ndarray | None = None
        self.eigvals: np.ndarray | None = None
        self.mean_sq_dist: np.ndarray | None = None
        self.ids: list[int] = []

    def fit(self, distance_matrix: np.ndarray, ids: list[int]) -> dict[int, np.ndarray]:
        n = distance_matrix.shape[0]
        D2 = distance_matrix ** 2

        J = np.eye(n) - np.ones((n, n)) / n
        B = -0.5 * J @ D2 @ J

        eigvals, eigvecs = np.linalg.eigh(B)
        order = np.argsort(-eigvals)[:2]
        eigvals_top = eigvals[order]
        eigvecs_top = eigvecs[:, order]

        eigvals_top = np.clip(eigvals_top, a_min=1e-9, a_max=None)

        self.V = eigvecs_top
        self.eigvals = eigvals_top
        self.mean_sq_dist = D2.mean(axis=0)
        self.ids = ids

        coords = eigvecs_top * np.sqrt(eigvals_top)  # (N, 2)
        return {pid: coords[i] for i, pid in enumerate(ids)}

    def project(self, sq_distances_to_landmarks: np.ndarray) -> np.ndarray:
        centered = sq_distances_to_landmarks - self.mean_sq_dist
        coords = -0.5 * (self.V.T @ centered) / np.sqrt(self.eigvals)
        return coords