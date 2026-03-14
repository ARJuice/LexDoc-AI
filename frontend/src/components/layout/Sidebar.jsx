import { NavLink, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../store/store';
import {
    LayoutDashboard, FileText, Upload, Sparkles, Users, Building2,
    ClipboardList, User, LogOut, ChevronLeft, ChevronRight, FolderUp
} from 'lucide-react';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import './Sidebar.css';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/documents', label: 'Documents', icon: FileText },
    { path: '/upload', label: 'Upload', icon: Upload },
    { path: '/my-uploads', label: 'My Uploads', icon: FolderUp },
    { path: '/insights', label: 'AI Insights', icon: Sparkles },
    { divider: true },
    { path: '/admin/users', label: 'Users', icon: Users, admin: true },
    { path: '/admin/departments', label: 'Departments', icon: Building2, admin: true },
    { path: '/admin/audit', label: 'Audit Logs', icon: ClipboardList, admin: true },
    { divider: true },
    { path: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
    const collapsed = useSelector((s) => s.sidebar.collapsed);
    const dispatch = useDispatch();
    const sidebarRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        const el = sidebarRef.current;
        if (!el) return;
        gsap.to(el, {
            width: collapsed ? 72 : 260,
            duration: 0.4,
            delay: collapsed ? 0.3 : 0,
            ease: 'power2.inOut',
        });
    }, [collapsed]);

    return (
        <aside ref={sidebarRef} className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <Sparkles size={22} />
                </div>
                {!collapsed && <span className="sidebar-logo-text">LexDoc AI</span>}
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navItems.map((item, i) => {
                    if (item.divider) return <div key={i} className="sidebar-divider" />;
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''} ${item.admin ? 'admin-link' : ''}`
                            }
                            data-hoverable
                        >
                            <Icon size={20} />
                            {!collapsed && <span className="sidebar-label">{item.label}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Collapse toggle */}
            <button
                className="sidebar-toggle"
                onClick={() => dispatch(toggleSidebar())}
                data-hoverable
            >
                {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
        </aside>
    );
}
