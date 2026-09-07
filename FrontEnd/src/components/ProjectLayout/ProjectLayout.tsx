import { Outlet } from 'react-router-dom';
import './ProjectLayout.css';

import BottomMenu from '../BottomMenu/BottomMenu.tsx';

function ProjectLayout() {
    return (
        <div className="appLayout">
            <div className="pageContent">
                <Outlet />
            </div>
            <BottomMenu />
        </div>
    );
}

export default ProjectLayout;