import { useMutation, useQueryClient } from '@tanstack/react-query';
import authRepository from '../api/repositories/AuthRepository.ts';
import { queryKeys } from '../api/queryKeys.ts';



export function useGoogleLogin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (idToken: string) => authRepository.googleLogin(idToken),
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
