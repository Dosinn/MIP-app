import { apiClient } from '../apiClient.ts';
import type { LessonResponse } from '../schemas/PeopleSchema.ts';
import type { ProjectReview } from '../schemas/ProjectSchema.ts';
import projectsRepository from './ProjectsRepository.ts';

export const lessonsRepository = {
    async getMyLessons(): Promise<LessonResponse[]> {
        const res = await apiClient.get<LessonResponse[]>('/lessons/me');
        return res.data;
    },

    async getLessonsOfTeacher(teacherId: number | string): Promise<LessonResponse[]> {
        const res = await apiClient.get<LessonResponse[]>(`/lessons/teacher/${teacherId}`);
        return res.data;
    },

    async getReviewsForLesson(lessonId: number | string): Promise<ProjectReview[]> {
        return projectsRepository.getReviewsForLesson(lessonId);
    },

    async createLesson(payload: { dayOfWeek: number; hour: number; endHour?: number; room?: string; teacherId?: number; type?: string }): Promise<LessonResponse> {
        const res = await apiClient.post<LessonResponse>('/lessons', payload);
        return res.data;
    },

    async updateLesson(id: number | string, payload: { dayOfWeek: number; hour: number; endHour?: number; room?: string; teacherId?: number; type?: string }): Promise<LessonResponse> {
        const res = await apiClient.put<LessonResponse>(`/lessons/${id}`, payload);
        return res.data;
    },

    async deleteLesson(lessonId: number | string): Promise<void> {
        await apiClient.delete(`/lessons/${lessonId}`);
    },

    async getAllLessons(): Promise<LessonResponse[]> {
        const res = await apiClient.get<LessonResponse[]>('/lessons/all');
        return res.data;
    },
};

export default lessonsRepository;
