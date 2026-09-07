import asyncio

from sentence_transformers import SentenceTransformer
from sqlmodel import select

from init.db import async_session
from project.models import Project

MODEL_NAME = "kinit/slovakbert-sts-stsb"
BATCH_SIZE = 32


def needs_embedding(project: Project) -> bool:
    return not project.title_emb or not project.desc_emb


async def backfill():
    model = SentenceTransformer(MODEL_NAME)

    async with async_session() as session:
        result = await session.execute(select(Category))
        all_projects = result.scalars().all()

        to_process = [p for p in all_projects if needs_embedding(p)]

        if not to_process:
            print("Усі проекти вже мають embeddings, нічого робити.")
            return

        print(f"Знайдено {len(to_process)} проектів без embeddings з {len(all_projects)} загалом.")

        for i in range(0, len(to_process), BATCH_SIZE):
            batch = to_process[i : i + BATCH_SIZE]

            titles = [p.title for p in batch]
            descriptions = [p.description for p in batch]

            title_embs = model.encode(titles, normalize_embeddings=True)
            desc_embs = model.encode(descriptions, normalize_embeddings=True)

            for project, title_emb, desc_emb in zip(batch, title_embs, desc_embs):
                project.title_emb = title_emb.tolist()
                project.desc_emb = desc_emb.tolist()
                session.add(project)

            await session.commit()
            print(f"Оброблено {min(i + BATCH_SIZE, len(to_process))}/{len(to_process)}")

        print("Готово.")


if __name__ == "__main__":
    asyncio.run(backfill())