import { apiClient } from '../apiClient.ts';
import type { Teacher, User } from '../schemas/PeopleSchema.ts';

export const usersRepository = {
    async getCurrentUser(): Promise<User> {
        const res = await apiClient.get<User>('/users/me');
        return res.data;
    },

    async completeOnboarding(name: string, teacherId: number | string): Promise<User> {
        const res = await apiClient.patch<User>('/users/me/onboarding', {
            name,
            teacherId: Number(teacherId),
        });
        return res.data;
    },

    async getTeachers(search?: string): Promise<Teacher[]> {
        const res = await apiClient.get<Teacher[]>('/users/teachers', {
            params: search ? { search } : undefined,
        });
        return res.data;
    },

    async searchStudents(search?: string): Promise<User[]> {
        const res = await apiClient.get<User[]>('/users/students', {
            params: search ? { search } : undefined,
        });
        return res.data;
    },

    async getAllStudents(): Promise<User[]> {
        const res = await apiClient.get<User[]>('/users/students/all');
        return res.data;
    },

    async createTeacher(name: string, email: string): Promise<User> {
        const res = await apiClient.post<User>('/users/teachers', { name, email });
        return res.data;
    },

    async updateUser(id: number | string, data: { name?: string; email?: string; role?: string; isTeacher?: boolean }): Promise<User> {
        const res = await apiClient.put<User>(`/users/${id}`, data);
        return res.data;
    },

    async updateUserRole(id: number | string, role: string): Promise<User> {
        const res = await apiClient.patch<User>(`/users/${id}/role`, { role });
        return res.data;
    },
};

export default usersRepository;
