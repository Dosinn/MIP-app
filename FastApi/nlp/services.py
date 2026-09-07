from __future__ import annotations

import asyncio
from typing import Optional
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.cluster import AgglomerativeClustering

from init.lifespan import categories_store, niche_anchor_store
from .split_sentences import split_sentences
from .schemas import SentenceDeviation, ProblemCohesionResponse, AudienceSegment, AudienceResponse, CategoryTag, ClassifyResponse, AlignmentResponse
from .constants import (
    PROBLEM_OUTLIER_GAP,
    AUDIENCE_DISTANCE_THRESHOLD,
    ALIGNMENT_DECISION_BOUNDARY,
    ALIGNMENT_NORM_MIN,
    ALIGNMENT_NORM_MAX,
    CATEGORY_CONFIDENT_THRESHOLD,
)


class NLPServices:

    def __init__(self):
        self.MIN_CONFIDENT_SCORE = CATEGORY_CONFIDENT_THRESHOLD


    def analyze_problem_centroid(self, text: str, model: SentenceTransformer, outlier_gap: float = PROBLEM_OUTLIER_GAP) -> ProblemCohesionResponse:

        sentences = split_sentences(text, min_words=1)
        n = len(sentences)

        if n < 2:
            return ProblemCohesionResponse(
                n_sentences=n,
                score=None,
                outlier=None,
                per_sentence=[],
            )

        embeddings = model.encode(sentences, convert_to_numpy=True, normalize_embeddings=True)

        centroid = embeddings.mean(axis=0)
        centroid_norm = centroid / (np.linalg.norm(centroid) + 1e-12)

        sims = embeddings @ centroid_norm

        per_sentence = [
            SentenceDeviation(sentence=s, similarity_to_centroid=round(float(sim), 3))
            for s, sim in zip(sentences, sims)
        ]
        per_sentence_sorted = sorted(per_sentence, key=lambda x: x.similarity_to_centroid)

        score = round(float(sims.mean()), 3)

        outlier = None

        lowest = per_sentence_sorted[0]
        second_lowest = per_sentence_sorted[1]

        if (second_lowest.similarity_to_centroid - lowest.similarity_to_centroid) >= outlier_gap:
            outlier = lowest
        elif lowest.similarity_to_centroid < (score - outlier_gap):
            outlier = lowest

        return ProblemCohesionResponse(
            n_sentences=n,
            score=score,
            outlier=outlier,
            per_sentence=per_sentence,
        )

    def niche_precision_score(self, text: str, model: SentenceTransformer, min_words: int = 3) -> Optional[float]:
        if len((text or "").split()) < min_words or niche_anchor_store.is_empty:
            return None

        text_vec = model.encode(text, convert_to_numpy=True, normalize_embeddings=True)
        diff = float(text_vec @ niche_anchor_store.specific - text_vec @ niche_anchor_store.generic)

        span = niche_anchor_store.hi - niche_anchor_store.lo
        margin = span * 0.15
        score = (diff - (niche_anchor_store.lo - margin)) / (span + 2 * margin + 1e-12)

        return round(float(np.clip(score, 0.0, 1.0)), 3)

    def analyze_audience_segments(self, text: str, model: SentenceTransformer, distance_threshold: float = AUDIENCE_DISTANCE_THRESHOLD) -> AudienceResponse:
        sentences = split_sentences(text, min_words=1)
        n = len(sentences)

        if n == 0:
            return AudienceResponse(overall_precision=None, lowest_segment=None)

        overall_prec = self.niche_precision_score(text, model)

        if n == 1:
            return AudienceResponse(
                overall_precision=overall_prec,
                lowest_segment=AudienceSegment(label=sentences[0], precision=overall_prec),
            )

        embeddings = model.encode(sentences, convert_to_numpy=True, normalize_embeddings=True)

        clustering = AgglomerativeClustering(
            n_clusters=None,
            distance_threshold=distance_threshold,
            metric="cosine",
            linkage="average",
        )
        labels = clustering.fit_predict(embeddings)

        lowest_segment: Optional[AudienceSegment] = None
        lowest_precision: Optional[float] = None

        for cluster_id in sorted(set(labels)):
            idx = np.where(labels == cluster_id)[0]
            cluster_embeddings = embeddings[idx]
            cluster_sentences = [sentences[i] for i in idx]

            centroid = cluster_embeddings.mean(axis=0)
            centroid_norm = centroid / (np.linalg.norm(centroid) + 1e-12)
            sims = cluster_embeddings @ centroid_norm
            representative = cluster_sentences[int(np.argmax(sims))]

            seg_text = " ".join(cluster_sentences)
            seg_prec = self.niche_precision_score(seg_text, model)

            if lowest_precision is None or (seg_prec is not None and seg_prec < lowest_precision):
                lowest_precision = seg_prec
                lowest_segment = AudienceSegment(label=representative, precision=seg_prec)

        return AudienceResponse(overall_precision=overall_prec, lowest_segment=lowest_segment)

    def analyze_alignment(self,problem: str,solution: str, model) -> AlignmentResponse:

        prob_text = (problem or "").strip()
        sol_text = (solution or "").strip()
        if not prob_text or not sol_text:
            return AlignmentResponse(score=0.5, is_aligned=True, status="insufficient_data")

        embeddings = model.encode([prob_text, sol_text], normalize_embeddings=True)
        prob_emb = embeddings[0]
        sol_emb = embeddings[1]

        sim = float(prob_emb @ sol_emb)
        norm_span = ALIGNMENT_NORM_MAX - ALIGNMENT_NORM_MIN
        score = round(float(np.clip((sim - ALIGNMENT_NORM_MIN) / norm_span, 0.0, 1.0)), 3)
        is_aligned = sim >= ALIGNMENT_DECISION_BOUNDARY
        status = "aligned" if is_aligned else "misaligned"

        return AlignmentResponse(
            score=score,
            is_aligned=is_aligned,
            status=status,
        )

    def classify_categories(self, title: str, description: str, model: SentenceTransformer, top_n: int = 4) -> ClassifyResponse:
        text = f"{title}. {description}".strip()
        if not text or categories_store.is_empty:
            return ClassifyResponse(tags=[], top_category=None, is_confident=False)

        project_embedding = model.encode([text], normalize_embeddings=True)[0]
        results = categories_store.classify(project_embedding, top_n=top_n)

        tags = [
            CategoryTag(id=pid, label=name, score=round(score, 3), is_confident=score >= self.MIN_CONFIDENT_SCORE)
            for pid, name, score in results
        ]
        top_cat, is_conf = (tags[0].label, tags[0].is_confident) if tags else (None, False)
        return ClassifyResponse(tags=tags, top_category=top_cat, is_confident=is_conf)


    async def analyze_problem_async(self, text: str, model: SentenceTransformer) -> ProblemCohesionResponse:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, lambda: self.analyze_problem_centroid(text, model))

    async def analyze_audience_async(self, text: str, model: SentenceTransformer) -> AudienceResponse:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, lambda: self.analyze_audience_segments(text, model))

    async def classify_categories_async(self, title: str, description: str, model: SentenceTransformer, top_n: int = 4) -> ClassifyResponse:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, lambda: self.classify_categories(title, description, model, top_n))

    async def analyze_alignment_async(self, problem: str, solution: str, model: SentenceTransformer) -> AlignmentResponse:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, lambda: self.analyze_alignment(problem, solution, model))
