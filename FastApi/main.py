import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from init.lifespan import lifespan
from nlp.routes import nlp_router
from project.routes import project_router
from similarity.routes import similarity_router


app = FastAPI(lifespan=lifespan)

# In production, Nginx sits in front and handles routing; CORS is only relevant
# for local development (Vite dev-server on :5173).
_extra_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
allow_origins = ["http://localhost:5173", "https://protrude-graffiti-cotton.ngrok-free.dev"] + _extra_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router=project_router, prefix="/project")
app.include_router(router=similarity_router, prefix="/similarity")
app.include_router(router=nlp_router, prefix="/nlp")