import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import teamRepository from '../api/repositories/TeamRepository.ts';
import { queryKeys } from '../api/queryKeys.ts';

export function useMyTeam() {
    const token = localStorage.getItem('authToken');
    return useQuery({
        queryKey: queryKeys.teams.mine(),
        queryFn: () => teamRepository.getMyTeam(),
        enabled: Boolean(token),
        retry: false,
    });
}

export function useTeamDetail(id?: number | string) {
    return useQuery({
        queryKey: queryKeys.teams.detail(id),
        queryFn: () => teamRepository.getTeamById(id!),
        enabled: !!id,
    });
}

export function useInviteMember() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (invitedEmail: string) => teamRepository.inviteMember(invitedEmail),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.teams.mine() });
            queryClient.invalidateQueries({ queryKey: queryKeys.teams.sentInvites() });
            queryClient.invalidateQueries({ queryKey: queryKeys.teams.invites() });
            queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail() });
        },
    });
}

/** Incoming: invites sent TO the current user */
export function usePendingInvites() {
    const token = localStorage.getItem('authToken');
    return useQuery({
        queryKey: queryKeys.teams.invites(),
        queryFn: () => teamRepository.getMyPendingInvites(),
        enabled: Boolean(token),
        retry: false,
    });
}

/** Outgoing: invites sent BY the current user that are still pending */
export function useSentPendingInvites() {
    const token = localStorage.getItem('authToken');
    return useQuery({
        queryKey: queryKeys.teams.sentInvites(),
        queryFn: () => teamRepository.getMySentPendingInvites(),
        enabled: Boolean(token),
        retry: false,
    });
}

/** inviteToken — UUID string from the invite object */
export function useAcceptInvite() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (inviteToken: string) => teamRepository.acceptInvite(inviteToken),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.teams.invites() });
            queryClient.invalidateQueries({ queryKey: queryKeys.teams.mine() });
            queryClient.invalidateQueries({ queryKey: queryKeys.teams.sentInvites() });
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.mine() });
        },
    });
}

export function useDeclineInvite() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (inviteToken: string) => teamRepository.declineInvite(inviteToken),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.teams.invites() });
        },
    });
}

export function useRemoveTeamMember() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ teamId, userId }: { teamId: number; userId: number }) =>
            teamRepository.removeMember(teamId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teacherAllReviews'] });
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
}

