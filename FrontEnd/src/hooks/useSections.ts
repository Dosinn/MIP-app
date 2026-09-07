import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import filesRepository from '../api/repositories/FilesRepository.ts';
import { queryKeys } from '../api/queryKeys.ts';

export function useSections() {
    return useQuery({
        queryKey: queryKeys.sections.all(),
        queryFn: () => filesRepository.getAllSections(),
    });
}

export function useCreateSection() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: {
            name: string;
            description?: string;
            orderIndex?: number;
            startsAt?: string;
            endsAt?: string;
        }) => filesRepository.createSection(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.sections.all() });
        },
    });
}

export function useUpdateSection() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number | string;
            data: {
                name: string;
                description?: string;
                orderIndex?: number;
                startsAt?: string;
                endsAt?: string;
            };
        }) => filesRepository.updateSection(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.sections.all() });
        },
    });
}

export function useDeleteSection() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number | string) => filesRepository.deleteSection(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.sections.all() });
        },
    });
}
