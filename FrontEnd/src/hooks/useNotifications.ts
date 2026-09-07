import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationsRepository from '../api/repositories/NotificationsRepository.ts';
import { queryKeys } from '../api/queryKeys.ts';

export function useMyNotifications() {
    return useQuery({
        queryKey: queryKeys.notifications.all(),
        queryFn: () => notificationsRepository.getMyNotifications(),
    });
}

export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number | string) => notificationsRepository.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
        },
    });
}
