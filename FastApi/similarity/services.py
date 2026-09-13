from typing import Optional

import numpy as np
from sentence_transformers import SentenceTransformer
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

from config import Config
from init.lifespan import encode_async, embedding_store
from nlp.constants import (
    SIMILARITY_RETRIEVAL_THRESHOLD,
    UNIQUENESS_PROBLEM_WEIGHT,
    UNIQUENESS_AUDIENCE_WEIGHT,
)
from project.models import Project
from .draft_point import project_draft_point
from .schemas import DraftPositionResponse, DraftPoint, UniquenessResponse, PointResponse, DraftNeighbor, SimilarityResult

class SimilarityService:

    def __init__(self):
        self.THRESHOLD = SIMILARITY_RETRIEVAL_THRESHOLD

        self.RETRIEVAL_K = 5
        self.RERANK_K = 2

        self.PROBLEM_WEIGHT = UNIQUENESS_PROBLEM_WEIGHT
        self.AUDIENCE_WEIGHT = UNIQUENESS_AUDIENCE_WEIGHT

    async def get_points(self, session: AsyncSession) -> list[PointResponse]:

        ids = list(embedding_store.positions.keys())
        if not ids:
            return []

        statement = select(Project.id, Project.title, Project.description, Project.improves_project_id).where(Project.id.in_(ids))
        result = await session.exec(statement)

        info = {pid: {"title": title, "description": description, "improves_project_id": improves_project_id} for pid, title, description, improves_project_id in result.all()}

        return [
            PointResponse(
                id=pid,
                title=info.get(pid, {}).get("title", ""),
                description=info.get(pid, {}).get("description", ""),
                x=float(pos[0]),
                y=float(pos[1]),
                improves_project_id=info.get(pid, {}).get("improves_project_id", None),
            ) for pid, pos in embedding_store.positions.items()
        ]

    async def get_draft_position(self, title: str, description: str, model, k: int = 3) -> DraftPositionResponse:

        if embedding_store.is_empty:
            return DraftPositionResponse(point=DraftPoint(x=0.0, y=0.0), neighbors=[])

        title_emb, desc_emb = await encode_async(model, [title, description])
        weighted_draft = embedding_store.weighted(title_embs=title_emb, desc_embs=desc_emb)
        weighted_store = embedding_store.weighted()

        sims = weighted_store @ weighted_draft

        top_idx = np.argsort(-sims)[:k]
        top_idx = [i for i in top_idx if sims[i] > self.THRESHOLD]
        display_neighbors = [
            DraftNeighbor(
                targetId=embedding_store.ids[i],
                strength=round(float(sims[i]) * 100, 1)
            ) for i in top_idx
        ]

        draft_point = project_draft_point(embedding_store, weighted_draft)

        return DraftPositionResponse(point=draft_point, neighbors=display_neighbors)

    async def check_similarity(self, title: str, description: str, model: SentenceTransformer, top_n: Optional[int] = 5,) -> list[SimilarityResult]:


        title_emb, desc_emb = await encode_async(model, [title, description])

        title_sims = embedding_store.title_embs @ title_emb
        desc_sims = embedding_store.desc_embs @ desc_emb
        weighted = Config.TITLE_WEIGHT * title_sims + Config.DESC_WEIGHT * desc_sims

        top_idx = np.argsort(-weighted)[:top_n]
        top_idx = [i for i in top_idx if weighted[i] > self.THRESHOLD]

        if not top_idx:
            return []

        return [
            SimilarityResult(id=embedding_store.ids[i], weighted_sim=round(float(weighted[i]) * 100, 1))
            for i in top_idx
        ]

    async def get_uniqueness(self, session: AsyncSession,
                             model: SentenceTransformer,
                             title: str, description: str,
                             problem: Optional[str] = '',
                             target_audience: Optional[str] = '',
                             improves_project_id: Optional[int] = None) -> UniquenessResponse:

        if embedding_store.is_empty:
            return UniquenessResponse(candidates=[])

        title_emb, desc_emb = await encode_async(model, [title, description])
        weighted_draft = embedding_store.weighted(title_embs=title_emb, desc_embs=desc_emb)
        weighted_store = embedding_store.weighted()
        coarse_sims = weighted_store @ weighted_draft

        if improves_project_id is not None and improves_project_id in embedding_store.ids:
            candidate_ids = [improves_project_id]
        else:
            top_idx = np.argsort(-coarse_sims)[:self.RETRIEVAL_K]
            candidate_ids = [embedding_store.ids[i] for i in top_idx]

        statement = select(Project.id, Project.title, Project.problem, Project.target_audience).where(Project.id.in_(candidate_ids))

        result = await session.exec(statement)
        rows = {pid: (title, prob or "", aud or "") for pid, title, prob, aud in result.all()}

        texts_to_encode: list[str] = [problem, target_audience]
        for pid in candidate_ids:
            tit, prob, aud = rows.get(pid, ("", "", ""))
            texts_to_encode.extend([prob, aud])

        embeddings = await encode_async(model, texts_to_encode)
        draft_prob_emb, draft_aud_emb = embeddings[0], embeddings[1]

        results = []
        for i, pid in enumerate(candidate_ids):
            prob_emb = embeddings[2 + i * 2]
            aud_emb = embeddings[2 + i * 2 + 1]

            prob_sim = float(draft_prob_emb @ prob_emb) if rows[pid][1] else None
            aud_sim = float(draft_aud_emb @ aud_emb) if rows[pid][2] else None

            if prob_sim is None and aud_sim is None:
                continue

            if prob_sim is None:
                weighted_sim = aud_sim
            elif aud_sim is None:
                weighted_sim = prob_sim
            else:
                weighted_sim = self.PROBLEM_WEIGHT * prob_sim + self.AUDIENCE_WEIGHT * aud_sim

            results.append({
                "project_id": pid,
                "title": rows[pid][0],
                "problem_similarity": round(prob_sim * 100, 1) if prob_sim is not None else None,
                "audience_similarity": round(aud_sim * 100, 1) if aud_sim is not None else None,
                "overall_similarity": round(weighted_sim * 100, 1),
            })

        results.sort(key=lambda r: r["overall_similarity"], reverse=True)
        return UniquenessResponse(candidates=results[:self.RERANK_K])