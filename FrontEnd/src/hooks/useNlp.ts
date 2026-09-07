import { useMutation } from '@tanstack/react-query';
import nlpRepository from '../api/repositories/NlpRepository';

export const useAnalyzeProblem = () =>
    useMutation({ mutationFn: (text: string) => nlpRepository.analyzeProblem(text) });

export const useAnalyzeAudience = () =>
    useMutation({ mutationFn: (text: string) => nlpRepository.analyzeAudience(text) });

export const useAnalyzeAlignment = () =>
    useMutation({
        mutationFn: ({ problem, solution }: { problem: string; solution: string }) =>
            nlpRepository.analyzeAlignment(problem, solution),
    });

export const useClassifyCategories = () =>
    useMutation({
        mutationFn: ({ title, description, topN }: { title: string; description: string; topN?: number }) =>
            nlpRepository.classifyCategories(title, description, topN),
    });