import { useMutation } from '@tanstack/react-query';
import similarityRepository from '../api/repositories/SimilarityRepository.ts';

export function useCheckSimilarity() {
    return useMutation({
        mutationFn: ({ title, description }: { title: string; description: string }) =>
            similarityRepository.getSimilarityProjectByTitleAndDescription(title, description),
    });
}

export const useCompareUniqueness = () =>
    useMutation({ mutationFn: similarityRepository.compareUniqueness });