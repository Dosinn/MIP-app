from fastapi import APIRouter, Depends, status, HTTPException

from init.db import get_session
from init.lifespan import get_model
from project.schemas import UpdateEmbeddingsSchema
from project.services import ProjectService

project_router = APIRouter()

@project_router.get("/health")
async def health():
    return {"status": "ok"}

project_services = ProjectService()


@project_router.post("/update-embeddings", status_code=status.HTTP_201_CREATED)
async def create_project(
        project: UpdateEmbeddingsSchema,
        model=Depends(get_model),
        session=Depends(get_session),
)->None:
    new_project = await project_services.set_project_embeddings(session, model, project.project_id)

    if new_project is None:
        raise HTTPException(status_code=404, detail="Project not found")



