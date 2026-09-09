import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import usersRepository from '../api/repositories/UsersRepository.ts';
import {queryKeys} from '../api/queryKeys.ts';

export function useCurrentUser(tokenParam?: string | null) {
    const token = tokenParam !== undefined ? tokenParam : localStorage.getItem('authToken');
    return useQuery({
        queryKey: queryKeys.auth.me(),
        queryFn: () => usersRepository.getCurrentUser(),
        enabled: Boolean(token),
        retry: false,
    });
}

export function useTeachers(search?: string) {
    return useQuery({
        queryKey: queryKeys.users.teachers(search),
        queryFn: () => usersRepository.getTeachers(search),
    });
}

export function useSearchStudents(search?: string) {
    const token = localStorage.getItem('authToken');
    return useQuery({
        queryKey: queryKeys.users.students(search),
        queryFn: () => usersRepository.searchStudents(search),
        enabled: Boolean(token),
    });
}

export function useAllStudents() {
    const token = localStorage.getItem('authToken');
    return useQuery({
        queryKey: ['users', 'students', 'all'],
        queryFn: () => usersRepository.getAllStudents(),
        enabled: Boolean(token),
    });
}

export function useCreateTeacher() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({name, email}: { name: string; email: string }) =>
            usersRepository.createTeacher(name, email),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['users', 'teachers']});
        },
    });
}

export function useUpdateUserRole() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, role}: { id: number | string; role: string }) =>
            usersRepository.updateUserRole(id, role),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['users']});
        },
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, data}: {
            id: number | string;
            data: { name?: string; email?: string; role?: string; isTeacher?: boolean }
        }) =>
            usersRepository.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['users']});
            queryClient.invalidateQueries({queryKey: queryKeys.users.teachers()});
        },
    });
}

export function useCompleteOnboarding() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({name, teacherId}: { name: string; teacherId: number | string }) =>
            usersRepository.completeOnboarding(name, teacherId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: queryKeys.auth.me()});
        },
    });
}
