from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from init.lifespan import lifespan
from nlp.routes import nlp_router
from project.routes import project_router
from similarity.routes import similarity_router


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://protrude-graffiti-cotton.ngrok-free.dev"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router=project_router, prefix="/project")
app.include_router(router=similarity_router, prefix="/similarity")
app.include_router(router=nlp_router, prefix="/nlp")