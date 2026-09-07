import { apiClient } from '../apiClient.ts';
import type { FileAttachment, ProjectSection } from '../schemas/FilesSchema.ts';

export const filesRepository = {
    async getAllSections(): Promise<ProjectSection[]> {
        const res = await apiClient.get<ProjectSection[]>('/sections');
        return res.data;
    },

    async createSection(data: {
        name: string;
        description?: string;
        orderIndex?: number;
        startsAt?: string;
        endsAt?: string;
    }): Promise<ProjectSection> {
        const res = await apiClient.post<ProjectSection>('/sections', data);
        return res.data;
    },

    async updateSection(
        id: number | string,
        data: {
            name: string;
            description?: string;
            orderIndex?: number;
            startsAt?: string;
            endsAt?: string;
        }
    ): Promise<ProjectSection> {
        const res = await apiClient.patch<ProjectSection>(`/sections/${id}`, data);
        return res.data;
    },

    async deleteSection(id: number | string): Promise<void> {
        await apiClient.delete(`/sections/${id}`);
    },

    async uploadFile(projectId: number | string, sectionId: number | string, file: File): Promise<FileAttachment> {
        const formData = new FormData();
        formData.append('projectId', String(projectId));
        formData.append('sectionId', String(sectionId));
        formData.append('file', file);

        const res = await apiClient.post<FileAttachment>('/files', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },

    async deleteFile(fileId: number | string): Promise<void> {
        await apiClient.delete(`/files/${fileId}`);
    },
};

export default filesRepository;
