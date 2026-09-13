from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field
from sqlalchemy import Column, ARRAY, Float


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str
    name: str

class TeamMember(SQLModel, table=True):
    __tablename__ = "team_memberships"

    team_id: int = Field(foreign_key="teams.id", primary_key=True)
    user_id: int = Field(foreign_key="users.id", primary_key=True)


class Team(SQLModel, table=True):
    __tablename__ = "teams"

    id: Optional[int] = Field(default=None, primary_key=True)
    year: int


class Project(SQLModel, table=True):
    __tablename__ = "projects"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    archived: bool = Field(default=False)

    title: str
    description: Optional[str] = None
    problem: Optional[str] = None
    target_audience: Optional[str] = None

    rating: Optional[float] = None
    alignment_score: Optional[float] = None
    audience_precision: Optional[float] = None
    problem_cohesion: Optional[float] = None
    uniqueness: Optional[str] = None
    uniqueness_score: Optional[float] = None
    has_contrastive_markers: bool = Field(default=False)

    title_emb: list[float] = Field(sa_column=Column(ARRAY(Float)), default_factory=list)
    desc_emb: list[float] = Field(sa_column=Column(ARRAY(Float)), default_factory=list)

    team_id: int = Field(foreign_key="teams.id")
    improves_project_id: Optional[int] = Field(default=None, foreign_key="projects.id")
    category_id: Optional[int] = Field(default=None, foreign_key="project_categories.id")

class Category(SQLModel, table=True):
    __tablename__ = "project_categories"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    color: Optional[str] = None
    description: Optional[str] = None
    embedding: list[float] = Field(sa_column=Column(ARRAY(Float)), default_factory=list)

class ProjectReview(SQLModel, table=True):
    __tablename__ = "project_reviews"

    id: Optional[int] = Field(default=None, primary_key=True)
    status: str
    project_id: int = Field(foreign_key="projects.id")
    lesson_id: int
