import {keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import projectsRepository, {type CreateProjectPayload} from '../api/repositories/ProjectsRepository.ts';
import {queryKeys} from '../api/queryKeys.ts';

export function useInfiniteProjectsLibrary(search?: string, categoryIds?: number[], pageSize: number = 12) {
    return useInfiniteQuery({
        queryKey: ['projects', 'library', 'infinite', search ?? '', categoryIds ?? []],
        queryFn: ({ pageParam = 0 }) =>
            projectsRepository.getLibraryPage({
                search,
                categoryIds,
                page: pageParam,
                size: pageSize,
            }),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            if (lastPage.last || lastPage.pageNumber + 1 >= lastPage.totalPages) {
                return undefined;
            }
            return lastPage.pageNumber + 1;
        },
        placeholderData: keepPreviousData,
    });
}

export function useProjectsLibrary(search?: string, categoryIds?: number[]) {
    return useQuery({
        queryKey: queryKeys.projects.all(search, categoryIds),
        queryFn: () => projectsRepository.getLibrary(search, categoryIds),
        placeholderData: keepPreviousData,
    });
}

export function useMyProject() {
    return useQuery({
        queryKey: queryKeys.projects.mine(),
        queryFn: () => projectsRepository.getMyProject(),
    });
}

export function useSavedProjects() {
    return useQuery({
        queryKey: ['projects', 'saved'],
        queryFn: () => projectsRepository.getSavedProjects(),
    });
}

export function useSavedProjectIds() {
    return useQuery({
        queryKey: ['projects', 'saved', 'ids'],
        queryFn: () => projectsRepository.getSavedProjectIds(),
    });
}

export function useToggleSaveProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({projectId, isSaved}: { projectId: number; isSaved: boolean }) => {
            if (isSaved) {
                await projectsRepository.unsaveProject(projectId);
            } else {
                await projectsRepository.saveProject(projectId);
            }
        },
        onMutate: async ({projectId, isSaved}) => {
            await queryClient.cancelQueries({queryKey: ['projects', 'saved', 'ids']});
            const previousIds = queryClient.getQueryData<number[]>(['projects', 'saved', 'ids']) ?? [];
            queryClient.setQueryData<number[]>(['projects', 'saved', 'ids'], (old = []) =>
                isSaved ? old.filter((id) => id !== projectId) : [...old, projectId]
            );
            return {previousIds};
        },
        onError: (_err, _vars, context) => {
            if (context?.previousIds) {
                queryClient.setQueryData(['projects', 'saved', 'ids'], context.previousIds);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({queryKey: ['projects', 'saved']});
            queryClient.invalidateQueries({queryKey: ['projects', 'saved', 'ids']});
        },
    });
}

export function useProjectDetail(id: number) {
    return useQuery({
        queryKey: queryKeys.projects.detail(id),
        queryFn: () => projectsRepository.getProjectById(id),
        enabled: !!id,
    });
}

export function useProjectHistory(projectId: number) {
    return useQuery({
        queryKey: queryKeys.projects.history(projectId),
        queryFn: () => projectsRepository.getHistoryElementsByProjectId(projectId),
        enabled: !!projectId,
    });
}

export function useProjectImprovements(projectId: number) {
    return useQuery({
        queryKey: queryKeys.projects.improvements(projectId),
        queryFn: () => projectsRepository.getProjectImprovementsByProjectId(projectId),
        enabled: !!projectId,
    });
}

export function useCreateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateProjectPayload) => projectsRepository.createProject(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['projects']});
            queryClient.invalidateQueries({queryKey: queryKeys.teams.mine()});
            queryClient.invalidateQueries({queryKey: queryKeys.lessons.mine()});
        },
    });
}

export function useUpdateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, data}: {
            id: number | string;
            data: Parameters<typeof projectsRepository.updateProject>[1];
        }) => projectsRepository.updateProject(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({queryKey: queryKeys.projects.detail(variables.id)});
            queryClient.invalidateQueries({queryKey: ['projects']});
        },
    });
}

export function useDeleteProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number | string) => projectsRepository.deleteProject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['projects']});
        },
    });
}

export function useRateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, rating}: { id: number | string; rating: number }) =>
            projectsRepository.rateProject(id, rating),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({queryKey: queryKeys.projects.detail(variables.id)});
            queryClient.invalidateQueries({queryKey: ['projects']});
        },
    });
}

export function useApproveProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({projectId, message}: { projectId: number | string; message?: string }) =>
            projectsRepository.approveProject(projectId, message),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({queryKey: queryKeys.projects.detail(variables.projectId)});
            queryClient.invalidateQueries({queryKey: queryKeys.projects.history(variables.projectId)});
            queryClient.invalidateQueries({queryKey: ['lessons', 'reviews']});
            queryClient.invalidateQueries({queryKey: ['reviews', 'teacher', 'all']});
            queryClient.invalidateQueries({queryKey: ['comments', variables.projectId]});
            queryClient.invalidateQueries({queryKey: ['project', variables.projectId]});
            queryClient.invalidateQueries({queryKey: queryKeys.projects.all()});
        },
    });
}

export function useReturnProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({projectId, message}: { projectId: number | string; message?: string }) =>
            projectsRepository.returnProject(projectId, message),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({queryKey: queryKeys.projects.detail(variables.projectId)});
            queryClient.invalidateQueries({queryKey: queryKeys.projects.history(variables.projectId)});
            queryClient.invalidateQueries({queryKey: ['lessons', 'reviews']});
            queryClient.invalidateQueries({queryKey: ['reviews', 'teacher', 'all']});
            queryClient.invalidateQueries({queryKey: ['comments', variables.projectId]});
            queryClient.invalidateQueries({queryKey: ['project', variables.projectId]});
        },
    });
}

export function useTeacherAllReviews() {
    return useQuery({
        queryKey: ['reviews', 'teacher', 'all'],
        queryFn: () => projectsRepository.getAllTeacherReviews(),
    });
}

export function useMyArchivedProjects() {
    return useQuery({
        queryKey: ['projects', 'archived', 'my'],
        queryFn: () => projectsRepository.getMyArchivedProjects(),
    });
}

export function useArchiveProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (projectId: number | string) => projectsRepository.archiveProject(projectId),
        onSuccess: (_data, projectId) => {
            queryClient.invalidateQueries({queryKey: queryKeys.projects.all()});
            queryClient.invalidateQueries({queryKey: queryKeys.projects.detail(Number(projectId))});
            queryClient.invalidateQueries({queryKey: ['reviews', 'teacher', 'all']});
            queryClient.invalidateQueries({queryKey: ['projects', 'archived', 'my']});
            queryClient.invalidateQueries({queryKey: queryKeys.projects.mine()});
        },
    });
}

export function useUnarchiveProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (projectId: number | string) => projectsRepository.unarchiveProject(projectId),
        onSuccess: (_data, projectId) => {
            queryClient.invalidateQueries({queryKey: queryKeys.projects.all()});
            queryClient.invalidateQueries({queryKey: queryKeys.projects.detail(Number(projectId))});
            queryClient.invalidateQueries({queryKey: ['reviews', 'teacher', 'all']});
            queryClient.invalidateQueries({queryKey: ['projects', 'archived', 'my']});
            queryClient.invalidateQueries({queryKey: queryKeys.projects.mine()});
            queryClient.invalidateQueries({queryKey: queryKeys.projects.all()});
        },
    });
}

export function useArchiveSchoolYear() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => projectsRepository.archiveSchoolYear(),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.projects.all()});
            queryClient.invalidateQueries({queryKey: ['reviews', 'teacher', 'all']});
            queryClient.invalidateQueries({queryKey: ['projects', 'archived', 'my']});
            queryClient.invalidateQueries({queryKey: queryKeys.projects.mine()});
        },
    });
}

