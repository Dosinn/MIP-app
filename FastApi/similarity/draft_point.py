import numpy as np

from similarity.schemas import DraftPoint


def project_draft_point(embedding_store, draft_weighted_embedding: np.ndarray) -> DraftPoint:
    if embedding_store.is_empty:
        return DraftPoint(x=0, y=0)

    weighted_store = embedding_store.weighted()
    sims_to_landmarks = weighted_store @ draft_weighted_embedding

    distances_to_existing = 1 - sims_to_landmarks
    pos = embedding_store.mds.project_new_point(distances_to_existing)

    return DraftPoint(x=float(pos[0]), y=float(pos[1]))