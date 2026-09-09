import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '../hooks/useUsers.ts';
import type { User, Role } from '../api/schemas/PeopleSchema.ts';
import { queryKeys } from '../api/queryKeys.ts';

interface AuthContextValue {
    user: User | null;
    role: Role | null;
    isAuthenticated: boolean;
    isOnboarded: boolean;
    isLoading: boolean;
    isStudent: boolean;
    isTeacher: boolean;
    isAdmin: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
    refetchUser: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));

    const {
        data: user,
        isPending,
        isError,
        refetch,
    } = useCurrentUser(token);

    const hasValidSession = Boolean(token && user && !isError);
    const isOnboarded = Boolean(user && user.onboarded !== false);
    const isAuthenticated = Boolean(hasValidSession && isOnboarded);
    const isLoading = Boolean(token && isPending);

    const role: Role | null = hasValidSession && user?.role
        ? (user.role.toLowerCase() as Role)
        : null;

    const login = useCallback(async (newToken: string) => {
        localStorage.setItem('authToken', newToken);
        setToken(newToken);
        await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    }, [queryClient]);

    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        setToken(null);
        queryClient.setQueryData(queryKeys.auth.me(), null);
        queryClient.removeQueries();
    }, [queryClient]);

    const value = useMemo<AuthContextValue>(
        () => ({
            user: hasValidSession ? (user ?? null) : null,
            role,
            isAuthenticated,
            isOnboarded,
            isLoading,
            isStudent: role === 'student',
            isTeacher: role === 'teacher',
            isAdmin: role === 'admin',
            login,
            logout,
            refetchUser: refetch,
        }),
        [hasValidSession, user, role, isAuthenticated, isOnboarded, isLoading, login, logout, refetch]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
