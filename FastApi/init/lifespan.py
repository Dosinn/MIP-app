import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from sentence_transformers import SentenceTransformer

from init.db import async_session

from config import Config
from nlp.store import CategoryStore, NicheAnchorStore
from similarity.store import EmbeddingStore

model: dict = {"model": None}

embedding_store = EmbeddingStore()
categories_store = CategoryStore()
niche_anchor_store = NicheAnchorStore()

@asynccontextmanager
async def lifespan(app: FastAPI):
    model["model"] = SentenceTransformer(Config.MODEL_NAME)
    await niche_anchor_store.load(model["model"])
    async with async_session() as session:
        await embedding_store.load(session)
        await categories_store.load(session)

    yield
    model.clear()

def get_model() -> SentenceTransformer:
    return model["model"]

async def encode_async(model_instance: SentenceTransformer, texts: list[str]):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None, lambda: model_instance.encode(texts, normalize_embeddings=True)
    )

