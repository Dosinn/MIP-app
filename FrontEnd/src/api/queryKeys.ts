export const queryKeys = {
    auth: {
        me: () => ['auth', 'me'] as const,
    },
    users: {
        all: () => ['users'] as const,
        teachers: (search?: string) => ['users', 'teachers', { search }] as const,
        students: (search?: string) => ['users', 'students', { search }] as const,
    },
    projects: {
        all: (search?: string, categoryIds?: number[]) =>
            ['projects', 'all', search, categoryIds] as const,
        mine: () => ['projects', 'me'] as const,
        detail: (id?: number | string) => ['projects', 'detail', id] as const,
        history: (projectId?: number | string) => ['projects', 'history', projectId] as const,
        improvements: (projectId?: number | string) => ['projects', 'improvements', projectId] as const,
        similarity: (projectId?: number | string) => ['projects', 'similarity', projectId] as const,
    },
    lessons: {
        mine: () => ['lessons', 'me'] as const,
        teacher: (teacherId?: number | string) => ['lessons', 'teacher', teacherId] as const,
        reviews: (lessonId?: number | string) => ['lessons', 'reviews', lessonId] as const,
    },
    teams: {
        mine: () => ['teams', 'me'] as const,
        detail: (id?: number | string) => ['teams', 'detail', id] as const,
        invites: () => ['teams', 'invites', 'incoming'] as const,
        sentInvites: () => ['teams', 'invites', 'sent'] as const,
    },
    sections: {
        all: () => ['sections'] as const,
    },
    notifications: {
        all: () => ['notifications', 'me'] as const,
    },
};
