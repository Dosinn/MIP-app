from typing import Optional

from pydantic import BaseModel

class UserSchema(BaseModel):
    id: int
    name: str
    email: str

class TeamSchema(BaseModel):
    id: int
    members: list[UserSchema]
    year: Optional[int] = None

class ProjectDraft(BaseModel):
    title: str
    description: str
    problem: Optional[str] = None
    target_audience: Optional[str] = None
    improves_project_id: Optional[int] = None
    top_n: Optional[int] = None

class ProjectDetail(BaseModel):
    id: int
    title: str
    description: str
    team: Optional[TeamSchema] = None
    rating: Optional[float] = None
    weighted_sim: Optional[float] = None

class UpdateEmbeddingsSchema(BaseModel):
    project_id: int




