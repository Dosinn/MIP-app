import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import lessonsRepository from '../api/repositories/LessonsRepository.ts';
import { queryKeys } from '../api/queryKeys.ts';

export function useMyLessons() {
    return useQuery({
        queryKey: queryKeys.lessons.mine(),
        queryFn: () => lessonsRepository.getMyLessons(),
    });
}

export function useTeacherLessons(teacherId?: number | string) {
    return useQuery({
        queryKey: queryKeys.lessons.teacher(teacherId),
        queryFn: () => lessonsRepository.getLessonsOfTeacher(teacherId!),
        enabled: !!teacherId,
    });
}

export function useLessonReviews(lessonId?: number | string | null) {
    return useQuery({
        queryKey: queryKeys.lessons.reviews(lessonId ?? undefined),
        queryFn: () => lessonsRepository.getReviewsForLesson(lessonId!),
        enabled: lessonId !== null && lessonId !== undefined,
    });
}

export function useAllLessons() {
    return useQuery({
        queryKey: ['lessons', 'all'],
        queryFn: () => lessonsRepository.getAllLessons(),
    });
}

export function useCreateLesson() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { dayOfWeek: number; hour: number; endHour?: number; room?: string; teacherId?: number; type?: string }) =>
            lessonsRepository.createLesson(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lessons'] });
            queryClient.invalidateQueries({ queryKey: ['users', 'teachers'] });
        },
    });
}

export function useUpdateLesson() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number | string; payload: { dayOfWeek: number; hour: number; endHour?: number; room?: string; teacherId?: number; type?: string } }) =>
            lessonsRepository.updateLesson(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lessons'] });
            queryClient.invalidateQueries({ queryKey: ['users', 'teachers'] });
        },
    });
}

export function useDeleteLesson() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (lessonId: number | string) =>
            lessonsRepository.deleteLesson(lessonId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lessons'] });
            queryClient.invalidateQueries({ queryKey: ['users', 'teachers'] });
        },
    });
}
