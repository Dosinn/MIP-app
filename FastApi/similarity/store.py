import numpy as np
from sqlmodel import select, func

from config import Config
from project.models import Project
from .smacof import WeightedSMACOF
from .mds import MDSModel

class EmbeddingStore:

    def __init__(self):
        self.ids: list[int] = []
        self.title_embs: np.ndarray | None = None
        self.desc_embs: np.ndarray | None = None
        self.positions: dict[int, np.ndarray] = {}
        self.mds_classical = MDSModel() 
        self.mds = WeightedSMACOF()  

    async def load(self, session):
        result = await session.exec(
            select(Project.id, Project.title_emb, Project.desc_emb)
            .where(
                Project.title_emb.isnot(None),
                Project.desc_emb.isnot(None),
                func.cardinality(Project.title_emb) > 0,
                func.cardinality(Project.desc_emb) > 0,
            )
        )
        projects = result.all()

        self.ids = [p.id for p in projects]
        self.title_embs = np.array([p.title_emb for p in projects])
        self.desc_embs = np.array([p.desc_emb for p in projects])

        self.relayout()


    def add(self, project_id: int, title_emb, desc_emb):
        self.ids.append(project_id)

        if self.title_embs is None:
            self.title_embs = np.vstack([title_emb])
            self.desc_embs = np.vstack([desc_emb])
        else:
            self.title_embs = np.vstack([self.title_embs, title_emb])
            self.desc_embs = np.vstack([self.desc_embs, desc_emb])

    def add_and_place(self, project_id: int, title_emb, desc_emb):
        self.add(project_id, title_emb, desc_emb)

        weighted_new = self.weighted(title_embs=title_emb, desc_embs=desc_emb)
        weighted_existing = self.weighted()[:-1]

        sims = weighted_existing @ weighted_new
        distances = 1 - sims

        new_pos = self.mds.project_new_point(distances)

        self.positions[project_id] = new_pos
        self.mds.positions = np.vstack([self.mds.positions, new_pos])
        self.mds.ids.append(project_id)

    def remove(self, project_id: int):
        if project_id not in self.ids:
            return
        idx = self.ids.index(project_id)
        self.ids.pop(idx)
        self.title_embs = np.delete(self.title_embs, idx, axis=0)
        self.desc_embs = np.delete(self.desc_embs, idx, axis=0)
        self.positions.pop(project_id, None)

        if project_id in self.mds.ids:
            mds_idx = self.mds.ids.index(project_id)
            self.mds.ids.pop(mds_idx)
            self.mds.positions = np.delete(self.mds.positions, mds_idx, axis=0)

    def set_positions(self, positions: dict[int, np.ndarray]):
        self.positions = positions

    def weighted(self, title_embs=None, desc_embs=None) -> np.ndarray:
        t = self.title_embs if title_embs is None else title_embs
        d = self.desc_embs if desc_embs is None else desc_embs
        combined = Config.TITLE_WEIGHT * t + Config.DESC_WEIGHT * d
        return combined / np.clip(np.linalg.norm(combined, axis=-1, keepdims=True), 1e-9, None)

    def relayout(self):
        if self.is_empty:
            self.set_positions({})
            return

        if len(self.ids) == 1:
            self.set_positions({self.ids[0]: np.zeros(2)})
            self.mds.positions = np.zeros((1, 2))
            self.mds.ids = list(self.ids)
            return

        weighted = self.weighted()
        sim_matrix = weighted @ weighted.T
        distance_matrix = 1 - sim_matrix
        np.fill_diagonal(distance_matrix, 0)

        # fast calculation of initial positions using classical MDS
        classical_positions = self.mds_classical.fit(distance_matrix, self.ids)
        init = np.array([classical_positions[pid] for pid in self.ids])

        # SMACOF
        positions = self.mds.fit(distance_matrix, self.ids, init_positions=init)

        self.set_positions(positions)

    @property
    def is_empty(self) -> bool:
        return not self.ids


