import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import MainPage from '../../pages/MainPage/MainPage.tsx';

export function RoleHomeRedirect() {
    const { role } = useAuth();

    if (role === 'teacher') {
        return <Navigate to="/teacher" replace />;
    }

    if (role === 'admin') {
        return <Navigate to="/admin" replace />;
    }

    return <MainPage />;
}

export default RoleHomeRedirect;
