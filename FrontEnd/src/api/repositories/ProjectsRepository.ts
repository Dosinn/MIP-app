import { apiClient } from '../apiClient.ts';
import type { HistoryElement, Project, ProjectCard, ProjectReview, PageResponse } from '../schemas/ProjectSchema.ts';

export interface CreateProjectPayload {
    title: string;
    description: string;
    lessonId: number;
    improvesProjectId?: number;
    // Three dedicated NLP-analysed fields
    problem?: string;
    targetAudience?: string;
    uniqueness?: string;
    // NLP quality metrics from Python
    problemCohesion?: number;
    audiencePrecision?: number;
    alignmentScore?: number;
    uniquenessScore?: number;
    hasContrastiveMarkers?: boolean;
    // User-selected category
    categoryId?: number;
}

export const projectsRepository = {
    async getLibrary(search?: string, categoryIds?: number[]): Promise<ProjectCard[]> {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (categoryIds?.length) {
            categoryIds.forEach((id) => params.append('categoryIds', String(id)));
        }
        const res = await apiClient.get<ProjectCard[]>('/projects', { params });
        return res.data;
    },

    async getLibraryPage(params: {
        search?: string;
        categoryIds?: number[];
        page: number;
        size?: number;
    }): Promise<PageResponse<ProjectCard>> {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append('search', params.search);
        if (params.categoryIds?.length) {
            params.categoryIds.forEach((id) => queryParams.append('categoryIds', String(id)));
        }
        queryParams.append('page', String(params.page));
        queryParams.append('size', String(params.size ?? 12));
        const res = await apiClient.get<PageResponse<ProjectCard>>('/projects', { params: queryParams });
        return res.data;
    },

    async getMyProject(): Promise<ProjectCard | null> {
        try {
            const res = await apiClient.get<ProjectCard>('/projects/my');
            return res.data || null;
        } catch {
            return null;
        }
    },

    async getSavedProjects(): Promise<ProjectCard[]> {
        const res = await apiClient.get<ProjectCard[]>('/projects/saved');
        return res.data;
    },

    async getSavedProjectIds(): Promise<number[]> {
        const res = await apiClient.get<number[]>('/projects/saved/ids');
        return res.data;
    },

    async saveProject(id: number | string): Promise<void> {
        await apiClient.post(`/projects/${id}/save`);
    },

    async unsaveProject(id: number | string): Promise<void> {
        await apiClient.delete(`/projects/${id}/save`);
    },

    async getProjectById(id: number): Promise<Project> {
        const res = await apiClient.get<Project>(`/projects/${id}`);
        return res.data;
    },

    async createProject(payload: CreateProjectPayload): Promise<Project> {
        const res = await apiClient.post<Project>('/projects', payload);
        return res.data;
    },

    async updateProject(
        id: number | string,
        data: {
            title: string;
            description: string;
            problem?: string;
            targetAudience?: string;
            uniqueness?: string;
            categoryId?: number;
            problemCohesion?: number;
            audiencePrecision?: number;
            alignmentScore?: number;
            uniquenessScore?: number;
            hasContrastiveMarkers?: boolean;
        }
    ): Promise<Project> {
        const res = await apiClient.patch<Project>(`/projects/${id}`, data);
        return res.data;
    },

    async deleteProject(id: number | string): Promise<void> {
        await apiClient.delete(`/projects/${id}`);
    },

    async rateProject(id: number | string, rating: number): Promise<ProjectCard> {
        const res = await apiClient.post<ProjectCard>(`/projects/${id}/rate`, { rating });
        return res.data;
    },

    async getHistoryElementsByProjectId(projectId: number): Promise<HistoryElement[]> {
        const res = await apiClient.get<HistoryElement[]>(`/projects/${projectId}/history`);
        return res.data;
    },

    async approveProject(projectId: number | string, message?: string): Promise<void> {
        await apiClient.post(`/projects/${projectId}/approve`, { message });
    },

    async returnProject(projectId: number | string, message?: string): Promise<void> {
        await apiClient.post(`/projects/${projectId}/return`, { message });
    },

    async getProjectImprovementsByProjectId(projectId: number): Promise<ProjectCard[]> {
        const project = await this.getProjectById(projectId);
        return project.improves ?? [];
    },

    async getReviewsForLesson(lessonId: number | string): Promise<ProjectReview[]> {
        const res = await apiClient.get<ProjectReview[]>(`/lessons/${lessonId}/reviews`);
        return res.data;
    },

    async getMyArchivedProjects(): Promise<ProjectCard[]> {
        const res = await apiClient.get<ProjectCard[]>('/projects/archived/my');
        return res.data;
    },

    async archiveProject(id: number | string): Promise<ProjectCard> {
        const res = await apiClient.post<ProjectCard>(`/projects/${id}/archive`);
        return res.data;
    },

    async unarchiveProject(id: number | string): Promise<ProjectCard> {
        const res = await apiClient.post<ProjectCard>(`/projects/${id}/unarchive`);
        return res.data;
    },

    async archiveSchoolYear(): Promise<void> {
        await apiClient.post('/projects/archive-year');
    },

    async getAllTeacherReviews(): Promise<ProjectReview[]> {
        const res = await apiClient.get<ProjectReview[]>('/reviews/teacher');
        return res.data;
    },
};

export default projectsRepository;

