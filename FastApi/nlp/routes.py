from fastapi import APIRouter, Depends

from init.lifespan import get_model
from .schemas import TextAnalysisRequest, ProblemCohesionResponse, AudienceResponse, ClassifyRequest, ClassifyResponse, AlignmentRequest, AlignmentResponse
from .services import NLPServices
from sentence_transformers import SentenceTransformer
nlp_router = APIRouter()

nlp_services = NLPServices()


@nlp_router.post("/analyze/problem", response_model=ProblemCohesionResponse)
async def analyze_problem(
    payload: TextAnalysisRequest,
    model: SentenceTransformer = Depends(get_model),
):
    return await nlp_services.analyze_problem_async(payload.text, model)

@nlp_router.post("/analyze/audience", response_model=AudienceResponse)
async def analyze_audience(
    payload: TextAnalysisRequest,
    model: SentenceTransformer = Depends(get_model),
):
    return await nlp_services.analyze_audience_async(payload.text, model)

@nlp_router.post("/analyze/categories", response_model=ClassifyResponse)
async def classify_categories(
    payload: ClassifyRequest,
    model: SentenceTransformer = Depends(get_model),
):
    return await nlp_services.classify_categories_async(
        title=payload.title,
        description=payload.description,
        model=model,
        top_n=payload.top_n,
    )

@nlp_router.post("/analyze/alignment", response_model=AlignmentResponse)
async def analyze_alignment(
    payload: AlignmentRequest,
    model: SentenceTransformer = Depends(get_model),
):
    return await nlp_services.analyze_alignment_async(
        problem=payload.problem,
        solution=payload.solution,
        model=model,
    )

