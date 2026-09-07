from typing import Optional
from pydantic import BaseModel, Field

class TextAnalysisRequest(BaseModel):
    text: str

class SentenceDeviation(BaseModel):
    sentence: str
    similarity_to_centroid: float

class ProblemCohesionResponse(BaseModel):
    n_sentences: int
    score: Optional[float] = None
    outlier: Optional[SentenceDeviation] = None
    per_sentence: list[SentenceDeviation] = []

class AudienceSegment(BaseModel):
    label: str
    precision: Optional[float]

class AudienceResponse(BaseModel):
    overall_precision: Optional[float]
    lowest_segment: Optional[AudienceSegment]

class ClassifyRequest(BaseModel):
    title: str = ""
    description: str = ""
    top_n: int = 4

class CategoryTag(BaseModel):
    id: int
    label: str
    score: float
    is_confident: bool

class ClassifyResponse(BaseModel):
    tags: list[CategoryTag]
    top_category: Optional[str] = None
    is_confident: bool

class AlignmentRequest(BaseModel):
    problem: str
    solution: str

class AlignmentResponse(BaseModel):
    score: float
    is_aligned: bool
    status: str
