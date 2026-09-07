import { apiClient } from '../apiClient.ts';
import type { Notification } from '../schemas/ProjectSchema.ts';

export const notificationsRepository = {
    async getMyNotifications(): Promise<Notification[]> {
        const res = await apiClient.get<Notification[]>('/notifications/me');
        return res.data;
    },

    async markAsRead(id: number | string): Promise<Notification> {
        const res = await apiClient.patch<Notification>(`/notifications/${id}/read`);
        return res.data;
    },
};

export default notificationsRepository;
