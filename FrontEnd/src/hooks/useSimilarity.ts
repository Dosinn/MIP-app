import { useMutation } from '@tanstack/react-query';
import similarityRepository from '../api/repositories/SimilarityRepository.ts';

export const useCompareUniqueness = () =>
    useMutation({ mutationFn: similarityRepository.compareUniqueness });