import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './AppLayout.css';

export default function AppLayout() {
    const collapsed = useSelector((s) => s.sidebar.collapsed);

    return (
        <div className="app-layout">
            <Sidebar />
            <div className={`app-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
                <TopBar />
                <main className="app-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
