import { apiClient } from '../apiClient.ts';
import type { User } from '../schemas/PeopleSchema.ts';

export interface VerifyCodeResponse {
    token: string;
    user?: User;
}

export const authRepository = {
    async googleLogin(idToken: string): Promise<VerifyCodeResponse> {
        const res = await apiClient.post<VerifyCodeResponse>('/auth/google', { idToken });
        return res.data;
    },

    async completeOnboarding(name: string, teacherId: number | string): Promise<User> {
        const res = await apiClient.patch<User>('/users/me/onboarding', {
            name,
            teacherId: Number(teacherId),
        });
        return res.data;
    },
};

export default authRepository;
