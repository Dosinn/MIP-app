import { NavLink } from 'react-router-dom';
import {Home, Search, User, GraduationCap, Users, Map} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import './BottomMenu.css';

interface NavItem {
    path: string;
    icon: React.ElementType;
    end?: boolean;
}

function BottomMenu() {
    const { role } = useAuth();

    const getNavItems = (): NavItem[] => {
        if (role === 'teacher') {
            return [
                { path: '/teacher', icon: Home, end: true },
                { path: '/teacher/students', icon: Users },
                { path: '/search', icon: Search },
                { path: '/map', icon: Map },
                { path: '/account', icon: User },
            ];
        }

        if (role === 'admin') {
            return [
                { path: '/admin', icon: Home, end: true },
                { path: '/teacher', icon: GraduationCap },
                { path: '/search', icon: Search },
                { path: '/map', icon: Map },
                { path: '/account', icon: User },
            ];
        }

        return [
            { path: '/', icon: Home, end: true },
            { path: '/search', icon: Search },
            { path: '/map', icon: Map },
            { path: '/account', icon: User },
        ];
    };

    const navItems = getNavItems();

    return (
        <nav className="bottomMenu">
            {navItems.map(({ path, icon: Icon, end }) => (
                <NavLink
                    key={path}
                    to={path}
                    end={end}
                    className={({ isActive }) => `navItem ${isActive ? 'navItemActive' : ''}`}
                >
                    <Icon size={32} strokeWidth={2} />
                </NavLink>
            ))}
        </nav>
    );
}

export default BottomMenu;