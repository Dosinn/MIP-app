from fastapi import APIRouter, Depends, HTTPException

from init.db import get_session
from init.lifespan import get_model
from project.schemas import ProjectDetail, ProjectDraft, UpdateEmbeddingsSchema
from project.services import ProjectService
from similarity.schemas import DraftPositionResponse, PointResponse, UniquenessResponse
from similarity.services import SimilarityService

similarity_router = APIRouter()

similarity_services = SimilarityService()
project_services = ProjectService()

@similarity_router.get("/map", response_model=list[PointResponse])
async def get_points(
    session=Depends(get_session),
):
    points = await similarity_services.get_points(session)

    if not points:
        return []

    return points

@similarity_router.post("/preview", response_model=DraftPositionResponse)
async def get_draft_position(
        payload: ProjectDraft,
        model=Depends(get_model),
):
    return await similarity_services.get_draft_position(payload.title, payload.description, model)


@similarity_router.post("/compare", response_model=UniquenessResponse)
async def compare_uniqueness(
    payload: ProjectDraft,
    session=Depends(get_session),
    model=Depends(get_model),
):
    return await similarity_services.get_uniqueness(
        session=session,
        model=model,
        title=payload.title,
        description=payload.description,
        problem=payload.problem,
        target_audience=payload.target_audience,
        improves_project_id=payload.improves_project_id,
    )

@similarity_router.post("/check-similarity", response_model=list[ProjectDetail])
async def check_similarity(
    payload: ProjectDraft,
    model=Depends(get_model),
    session=Depends(get_session),
):
    similarities = await similarity_services.check_similarity(payload.title, payload.description, model, payload.top_n)
    if not similarities:
        return []

    return await project_services.get_projects_by_ids(session, similarities)


@similarity_router.post("/update-embeddings", status_code=201)
async def update_embeddings_alias(
    project: UpdateEmbeddingsSchema,
    model=Depends(get_model),
    session=Depends(get_session),
) -> None:
    new_project = await project_services.set_project_embeddings(session, model, project.project_id)
    if new_project is None:
        raise HTTPException(status_code=404, detail="Project not found")