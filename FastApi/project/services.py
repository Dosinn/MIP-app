from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from init.lifespan import encode_async
from project.models import Project, Team, TeamMember, User
from project.schemas import ProjectDetail, TeamSchema, UserSchema
from similarity.schemas import SimilarityResult

from sentence_transformers import SentenceTransformer

from init.lifespan import embedding_store


class ProjectService:

    async def get_teams_by_ids(self, session, team_ids: list[int]) -> dict[int, TeamSchema]:
        if not team_ids:
            return {}

        result = await session.execute(
            select(Team.id, Team.year, User.id, User.name, User.email)
            .join(TeamMember, TeamMember.team_id == Team.id)
            .join(User, User.id == TeamMember.user_id)
            .where(Team.id.in_(team_ids))
        )
        rows = result.all()

        teams: dict[int, TeamSchema] = {}
        for team_id, year, user_id, name, email in rows:
            if team_id not in teams:
                teams[team_id] = TeamSchema(id=team_id, year=year, members=[])
            teams[team_id].members.append(UserSchema(id=user_id, name=name, email=email))

        return teams

    async def get_projects_by_ids(self, session, similarities: list[SimilarityResult]) -> list[ProjectDetail]:
        if not similarities:
            return []

        sim_by_id = {s.id: s.weighted_sim for s in similarities}
        ids = list(sim_by_id.keys())

        statement = select(Project.id, Project.title, Project.description, Project.rating, Project.team_id).where(
            Project.id.in_(ids))

        result = await session.execute(statement)
        rows = result.all()

        team_ids = [r.team_id for r in rows if r.team_id is not None]
        teams_by_id = await self.get_teams_by_ids(session, team_ids)

        projects = [
            ProjectDetail(
                id=r.id,
                title=r.title,
                description=r.description,
                rating=r.rating or 0,
                team=teams_by_id.get(r.team_id) if r.team_id is not None else None,
                weighted_sim=sim_by_id[r.id],
            )
            for r in rows
        ]

        projects.sort(key=lambda p: p.weighted_sim, reverse=True)

        return projects

    async def get_project(self, session: AsyncSession, project_id: int) -> Project | None:
        statement = select(Project).where(Project.id == project_id)

        result = await session.exec(statement)

        project = result.first()

        return project if project is not None else None

    async def set_project_embeddings(self, session: AsyncSession, model: SentenceTransformer, project_id: int):

        project_to_update = await self.get_project(session, project_id)

        if project_to_update is not None:
            title_emb, desc_emb = await encode_async(model, [project_to_update.title, project_to_update.description])

            project_to_update.title_emb = title_emb.tolist()
            project_to_update.desc_emb = desc_emb.tolist()

            embedding_store.add_and_place(project_to_update.id, title_emb, desc_emb)

            await session.commit()

            return project_to_update
        else:
            return None

        # todo
    # async def get_titles_and_descriptions_by_ids(self, session: AsyncSession, ids: list[int]):
