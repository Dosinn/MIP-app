import { apiClient } from '../apiClient.ts';
import type { Team } from '../schemas/PeopleSchema.ts';

export interface TeamInvite {
    id: number;
    teamId: number | null;
    inviteToken: string;
    invitedUser: {
        id: number;
        name: string;
        email?: string;
        role?: string;
    };
    invitedBy: {
        id: number;
        name: string;
        email?: string;
        role?: string;
    };
    status: 'pending' | 'accepted' | 'declined';
    createdAt: string;
}

export const teamRepository = {
    async getMyTeam(): Promise<Team> {
        const res = await apiClient.get<Team>('/teams/me');
        return res.data;
    },

    async getTeamById(id: number | string): Promise<Team> {
        const res = await apiClient.get<Team>(`/teams/${id}`);
        return res.data;
    },

    async createTeam(): Promise<Team> {
        const res = await apiClient.post<Team>('/teams');
        return res.data;
    },

    async inviteMember(invitedEmail: string): Promise<TeamInvite> {
        const res = await apiClient.post<TeamInvite>('/invites', { invitedEmail });
        return res.data;
    },

    // Returns pending invites sent *to* the current user (incoming)
    async getMyPendingInvites(): Promise<TeamInvite[]> {
        const res = await apiClient.get<TeamInvite[]>('/invites/me/pending');
        return res.data;
    },

    // Returns pending invites sent *by* the current user (outgoing)
    async getMySentPendingInvites(): Promise<TeamInvite[]> {
        const res = await apiClient.get<TeamInvite[]>('/invites/me/sent');
        return res.data;
    },

    // token — inviteToken UUID string from the invite object
    async acceptInvite(token: string): Promise<TeamInvite> {
        const res = await apiClient.post<TeamInvite>(`/invites/${token}/accept`);
        return res.data;
    },

    async declineInvite(token: string): Promise<TeamInvite> {
        const res = await apiClient.post<TeamInvite>(`/invites/${token}/decline`);
        return res.data;
    },

    async removeMember(teamId: number, userId: number): Promise<void> {
        await apiClient.delete(`/teams/${teamId}/members/${userId}`);
    },
};

export default teamRepository;