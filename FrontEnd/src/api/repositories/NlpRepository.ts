import { fastApiClient } from '../apiClient';
import {
    ProblemCohesionSchema,
    AudienceAnalysisSchema,
    CategoryClassifySchema,
    AlignmentResultSchema,
} from '../schemas/NlpSchema';

const nlpRepository = {
    analyzeProblem: async (text: string) => {
        const { data } = await fastApiClient.post('/nlp/analyze/problem', { text });
        return ProblemCohesionSchema.parse(data);
    },
    analyzeAudience: async (text: string) => {
        const { data } = await fastApiClient.post('/nlp/analyze/audience', { text });
        return AudienceAnalysisSchema.parse(data);
    },
    analyzeAlignment: async (problem: string, solution: string) => {
        const { data } = await fastApiClient.post('/nlp/analyze/alignment', { problem, solution });
        return AlignmentResultSchema.parse(data);
    },
    classifyCategories: async (title: string, description: string, topN = 4) => {
        const { data } = await fastApiClient.post('/nlp/analyze/categories', {
            title,
            description,
            top_n: topN,
        });
        return CategoryClassifySchema.parse(data);
    },
};

export default nlpRepository;