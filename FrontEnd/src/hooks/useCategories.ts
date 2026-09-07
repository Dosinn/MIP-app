import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient.ts';
import type { Category } from '../api/schemas/ProjectSchema.ts';

export function useCategories() {
    return useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await apiClient.get<Category[]>('/categories');
            return res.data;
        },
        staleTime: 10 * 60 * 1000,
    });
}
