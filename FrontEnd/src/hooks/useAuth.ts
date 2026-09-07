import { useMutation, useQueryClient } from '@tanstack/react-query';
import authRepository from '../api/repositories/AuthRepository.ts';
import { queryKeys } from '../api/queryKeys.ts';

export function useRequestCode() {
    return useMutation({
        mutationFn: (email: string) => authRepository.requestCode(email),
    });
}

export function useVerifyCode() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ email, code }: { email: string; code: string }) =>
            authRepository.verifyCode(email, code),
        onSuccess: (data) => {
            if (data.token) {
                localStorage.setItem('authToken', data.token);
            }
            queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
        },
    });
}

export function useCompleteProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ name, teacherId }: { name: string; teacherId: number | string }) =>
            authRepository.completeOnboarding(name, teacherId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
        },
    });
}
