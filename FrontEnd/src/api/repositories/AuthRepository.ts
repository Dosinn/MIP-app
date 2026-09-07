import { apiClient } from '../apiClient.ts';
import type { User } from '../schemas/PeopleSchema.ts';

export interface VerifyCodeResponse {
    token: string;
    user?: User;
}

export const authRepository = {
    async requestCode(email: string): Promise<void> {
        await apiClient.post('/auth/request-code', { email });
    },

    async verifyCode(email: string, code: string): Promise<VerifyCodeResponse> {
        const res = await apiClient.post<VerifyCodeResponse>('/auth/verify-code', { email, code });
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
