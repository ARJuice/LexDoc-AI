import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import { setPanelOpen } from '../../store/store';
import { useAuth } from '../../context/AuthProvider';
import './TopBar.css';

export default function TopBar() {
    const unreadCount = useSelector((s) => s.notifications.unreadCount);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const username = profile?.username || 'User';

    return (
        <header className="topbar">
            <div className="topbar-search">
                <Search size={18} className="topbar-search-icon" />
                <input
                    type="text"
                    placeholder="Search documents, tags, people..."
                    className="topbar-search-input"
                />
            </div>

            <div className="topbar-actions">
                <ThemeToggle />

                <button
                    className="topbar-icon-btn"
                    onClick={() => dispatch(setPanelOpen(true))}
                    data-hoverable
                    aria-label="Notifications"
                >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                        <span className="notification-badge">{unreadCount}</span>
                    )}
                </button>

                <div className="topbar-user" data-hoverable onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
                    <div className="topbar-avatar">
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <span className="topbar-username">
                        {username.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                    </span>
                </div>
            </div>
        </header>
    );
}
