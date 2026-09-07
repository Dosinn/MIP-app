import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import QueryState from '../QueryState/QueryState.tsx';
import type { ReactNode } from 'react';

interface PublicRouteProps {
    children?: ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
    const { isAuthenticated, isLoading, role } = useAuth();

    if (isLoading) {
        return <QueryState isPending size="page" />;
    }

    if (isAuthenticated) {
        const defaultPath = role === 'teacher' ? '/teacher' : role === 'admin' ? '/admin' : '/';
        return <Navigate to={defaultPath} replace />;
    }

    return children ? <>{children}</> : <Outlet />;
}

export default PublicRoute;
