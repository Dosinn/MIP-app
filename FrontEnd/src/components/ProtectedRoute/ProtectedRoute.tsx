import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import QueryState from '../QueryState/QueryState.tsx';
import type { Role } from '../../api/schemas/PeopleSchema.ts';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
    allowedRoles?: Role[];
    children?: ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, role } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <QueryState isPending size="page" />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
        const defaultPath = role === 'teacher' ? '/teacher' : role === 'admin' ? '/admin' : '/';
        return <Navigate to={defaultPath} replace />;
    }

    return children ? <>{children}</> : <Outlet />;
}

export default ProtectedRoute;
