import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../store/store';
import { useAuth } from '../../context/AuthProvider';
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
    { path: '/upload', label: 'Upload', icon: Upload, minAccess: 5 },
    { path: '/my-uploads', label: 'My Uploads', icon: FolderUp, minAccess: 5 },
    { path: '/insights', label: 'AI Insights', icon: Sparkles },
    { divider: true },
    { path: '/admin/users', label: 'Users', icon: Users, minAccess: 10 },
    { path: '/admin/departments', label: 'Departments', icon: Building2, minAccess: 10 },
    { path: '/admin/audit', label: 'Audit Logs', icon: ClipboardList, minAccess: 10 },
    { divider: true },
    { path: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
    const collapsed = useSelector((s) => s.sidebar.collapsed);
    const dispatch = useDispatch();
    const sidebarRef = useRef(null);
    const { profile, signOut } = useAuth();

    const userAccessLevel = profile?.roles?.access_level || 0;

    useEffect(() => {
        const el = sidebarRef.current;
        if (!el) return;
        gsap.to(el, {
            width: collapsed ? 72 : 260,
            duration: 0.4,
            ease: 'power2.inOut',
        });
    }, [collapsed]);

    // Filter out items that the user doesn't have access to
    const visibleItems = navItems.filter(item => {
        if (item.divider) return true;
        if (item.minAccess && userAccessLevel < item.minAccess) return false;
        return true;
    });

    // Remove consecutive/trailing dividers
    const cleanedItems = visibleItems.filter((item, i, arr) => {
        if (!item.divider) return true;
        // Skip if it's the first or last item, or if previous was also a divider
        if (i === 0 || i === arr.length - 1) return false;
        if (arr[i - 1]?.divider) return false;
        return true;
    });

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
                {cleanedItems.map((item, i) => {
                    if (item.divider) return <div key={i} className="sidebar-divider" />;
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''} ${item.minAccess ? 'admin-link' : ''}`
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
