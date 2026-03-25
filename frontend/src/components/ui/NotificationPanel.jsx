import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, X, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthProvider';
import { fetchNotifications } from '../../lib/supabaseData';
import { setPanelOpen, setUnreadCount } from '../../store/store';
import './NotificationPanel.css';

export default function NotificationPanel() {
    const { profile } = useAuth();
    const panelOpen = useSelector(s => s.notifications.panelOpen);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const panelRef = useRef(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch and sync unseen count
    useEffect(() => {
        if (!profile) return;
        
        const loadNotes = async () => {
            setLoading(true);
            const data = await fetchNotifications(profile.id);
            setNotifications(data || []);
            
            // Sync unread count to Redux
            const unread = (data || []).filter(n => !n.is_read).length;
            dispatch(setUnreadCount(unread));
            setLoading(false);
        };
        
        loadNotes();

        // Listen for realtime notifications
        const channel = supabase.channel('public:notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile.id}` }, (payload) => {
                setNotifications(prev => [payload.new, ...prev]);
                dispatch(setUnreadCount(notifications.filter(n => !n.is_read).length + 1));
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile]);

    // Handle GSAP animation for opening/closing
    useEffect(() => {
        if (!panelRef.current) return;
        
        if (panelOpen) {
            gsap.fromTo(panelRef.current, 
                { opacity: 0, scale: 0.95, y: -10, display: 'flex' },
                { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'expo.out' }
            );

            // Mark all as read when opened
            const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
            if (unreadIds.length > 0) {
                supabase.from('notifications').update({ is_read: true }).in('id', unreadIds).then();
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                dispatch(setUnreadCount(0));
            }
        } else {
            gsap.to(panelRef.current, {
                opacity: 0, scale: 0.95, y: -10, duration: 0.2, ease: 'power2.in',
                onComplete: () => { if (panelRef.current) panelRef.current.style.display = 'none'; }
            });
        }
    }, [panelOpen, notifications, dispatch]);

    // Close panel on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (panelOpen && panelRef.current && !panelRef.current.contains(e.target) && !e.target.closest('.topbar-icon-btn')) {
                dispatch(setPanelOpen(false));
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [panelOpen, dispatch]);

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // prevent navigation if clicking on row
        
        // GSAP Remove Animation
        const row = document.getElementById(`notif-${id}`);
        if (row) {
            gsap.to(row, {
                opacity: 0,
                height: 0,
                padding: 0,
                margin: 0,
                scale: 0.9,
                duration: 0.3,
                ease: 'power2.inOut',
                onComplete: () => {
                    setNotifications(prev => prev.filter(n => n.id !== id));
                    supabase.from('notifications').delete().eq('id', id).then();
                }
            });
        } else {
            setNotifications(prev => prev.filter(n => n.id !== id));
            supabase.from('notifications').delete().eq('id', id).then();
        }
    };

    const handleDocClick = (docId) => {
        if (!docId) return;
        dispatch(setPanelOpen(false));
        navigate(`/documents/${docId}`);
    };

    return (
        <div ref={panelRef} className="notification-panel glass-card" style={{ display: 'none' }}>
            <div className="notif-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Bell size={18} />
                    <h3>Notifications</h3>
                </div>
                <button className="notif-close-btn" onClick={() => dispatch(setPanelOpen(false))} data-hoverable>
                    <X size={16} />
                </button>
            </div>
            
            <div className="notif-body custom-scrollbar">
                {loading ? (
                    <div className="notif-empty">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="notif-empty">
                        <CheckCircle2 size={32} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }} />
                        <p>No new notifications</p>
                    </div>
                ) : (
                    notifications.map(notif => (
                        <div 
                            key={notif.id} 
                            id={`notif-${notif.id}`} 
                            className={`notif-item ${!notif.is_read ? 'unread' : ''}`}
                            onClick={() => handleDocClick(notif.doc_id)}
                        >
                            <div className="notif-icon-wrapper">
                                {notif.type === 'urgent_doc' ? (
                                    <AlertCircle size={18} style={{ color: 'var(--color-danger)' }} />
                                ) : (
                                    <Bell size={18} style={{ color: 'var(--color-primary)' }} />
                                )}
                            </div>
                            <div className="notif-content">
                                <p className="notif-message">{notif.message}</p>
                                <span className="notif-time">
                                    {new Date(notif.created_at).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <button 
                                className="notif-delete-btn" 
                                onClick={(e) => handleDelete(notif.id, e)}
                                aria-label="Delete notification"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
