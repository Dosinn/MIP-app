import { Outlet } from 'react-router-dom';
import './AppLayout.css';

import BottomMenu from '../BottomMenu/BottomMenu.tsx';
import NavBar from "../NavBar/NavBar.tsx";

function AppLayout() {
    return (
        <div className="appLayout">
            <NavBar />
            <div className="pageContent">
                <Outlet />
            </div>
            <BottomMenu />
        </div>
    );
}

export default AppLayout;