import { fastApiClient } from '../apiClient.ts';
import { UniquenessCompareSchema } from '../schemas/ProjectSchema';

import type { SimilarityProject } from '../schemas/ProjectSchema.ts';

export const similarityRepository = {
    async getSimilarityProjectByTitleAndDescription(title: string, description: string): Promise<SimilarityProject[]> {
        const r = await fastApiClient.post('/similarity/check-similarity', {
            title,
            description,
        });
        return r.data;
    },

    compareUniqueness: async (payload: {
        title: string;
        description: string;
        problem: string;
        target_audience: string;
        improves_project_id?: number;
    }) => {
        const { data } = await fastApiClient.post('/similarity/compare', payload);
        return UniquenessCompareSchema.parse(data);
    },

    async createEmbeddings(projectId: number | string): Promise<void> {
        try {
            await fastApiClient.post('/project/update-embeddings', {
                project_id: Number(projectId),
            });
        } catch (e) {
            console.warn('FastAPI embedding indexing failed:', e);
        }
    },
};

export default similarityRepository;