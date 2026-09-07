import numpy as np


class WeightedSMACOF:

    def __init__(self):
        self.positions: np.ndarray | None = None
        self.ids: list[int] = []

    def fit(
            self,
            distance_matrix: np.ndarray,
            ids: list[int],
            init_positions: np.ndarray | None = None,
            n_iter: int = 500,
            seed: int = 42,
            eps: float = 1e-9,
            tol: float = 1e-7,
    ) -> dict[int, np.ndarray]:
        n = distance_matrix.shape[0]
        if n == 0:
            return {}
        if n == 1:
            self.positions = np.zeros((1, 2))
            self.ids = ids
            return {ids[0]: self.positions[0]}

        D = np.clip(distance_matrix, eps, None)
        np.fill_diagonal(D, 0)

        W = 1.0 / (D ** 2 + eps)
        np.fill_diagonal(W, 0)

        rng = np.random.default_rng(seed)
        if init_positions is not None:
            X = np.array(init_positions, dtype=np.float64).copy()
        else:
            X = rng.normal(scale=0.1, size=(n, 2))

        V = np.diag(W.sum(axis=1)) - W
        V_pinv = np.linalg.pinv(V)

        prev_stress = np.inf

        for it in range(n_iter):
            diff = X[:, None, :] - X[None, :, :]
            d_hat = np.sqrt((diff ** 2).sum(axis=-1))

            ratio = np.divide(D, d_hat, out=np.zeros_like(D), where=(d_hat > eps))

            B = -W * ratio
            np.fill_diagonal(B, 0)
            B[np.diag_indices(n)] = -B.sum(axis=1)

            X = V_pinv @ B @ X

            stress = np.sum(
                W[np.triu_indices(n, k=1)]
                * (D[np.triu_indices(n, k=1)] - d_hat[np.triu_indices(n, k=1)]) ** 2
            )
            if abs(prev_stress - stress) < tol:
                break
            prev_stress = stress

        self.positions = X
        self.ids = ids
        return {pid: X[i] for i, pid in enumerate(ids)}

    def project_new_point(
            self,
            distances_to_existing: np.ndarray,
            n_iter: int = 300,
            eps: float = 1e-9,
            step: float = 0.02,
    ) -> np.ndarray:
        if self.positions is None or len(self.positions) == 0:
            return np.array([0.0, 0.0])

        D = np.clip(distances_to_existing, eps, None)
        W = 1.0 / (D ** 2 + eps)
        w_sum = W.sum()

        if w_sum < eps:
            return self.positions.mean(axis=0)

        weights_norm = W / w_sum
        pos = (weights_norm[:, None] * self.positions).sum(axis=0)

        for _ in range(n_iter):
            diff = self.positions - pos  # (N, 2)
            d_hat = np.sqrt((diff ** 2).sum(axis=1))

            ratio = np.divide(D, d_hat, out=np.zeros_like(D), where=(d_hat > eps))

            grad = (2 * W * (1 - ratio))[:, None] * (-diff)
            grad = grad.sum(axis=0)

            pos = pos - step * grad / w_sum

        return pos
