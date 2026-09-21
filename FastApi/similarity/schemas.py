from typing import Optional
from pydantic import BaseModel

class DraftPoint(BaseModel):
    x: float
    y: float

class PointResponse(BaseModel):
    id: int
    title: str
    description: str
    x: float
    y: float
    improves_project_id: Optional[int] = None
    category: Optional[str] = None
    category_color: Optional[str] = None

class DraftNeighbor(BaseModel):
    targetId: int
    strength: float

class DraftPositionResponse(BaseModel):
    point: DraftPoint
    neighbors: list[DraftNeighbor]

class ProjectCandidate(BaseModel):
    project_id: int
    title: str
    problem_similarity: Optional[float] = None
    audience_similarity: Optional[float] = None
    overall_similarity: float


class SimilarityResult(BaseModel):
    id: int
    weighted_sim: float

class UniquenessResponse(BaseModel):
    candidates: list[ProjectCandidate] = []