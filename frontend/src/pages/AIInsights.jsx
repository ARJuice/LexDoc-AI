import { useEffect, useRef, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, AlertTriangle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { fetchEvents, formatDate } from '../lib/supabaseData';
import './AIInsights.css';

export default function AIInsights() {
    const pageRef = useRef(null);
    const navigate = useNavigate();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        async function load() {
            setLoading(true);
            const evts = await fetchEvents();
            setEvents(evts || []);
            setLoading(false);
        }
        load();
    }, []);

    useEffect(() => {
        if (loading) return;
        const el = pageRef.current;
        if (!el) return;
        gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
        gsap.fromTo('.calendar-sidebar, .calendar-main',
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
        );
    }, [loading]);

    // Calendar logic
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    };
    const isSelected = (day) => {
        return day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
    };

    const handleDayClick = (day) => setSelectedDate(new Date(year, month, day));

    // Get events for a specific date
    const getEventsForDate = (dateObj) => {
        const targetStr = dateObj.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        return events.filter(e => {
            if (e.event_type === 'RANGE' && e.start_date && e.end_date) {
                return targetStr >= e.start_date && targetStr <= e.end_date;
            }
            return e.event_date === targetStr;
        });
    };

    const selectedEvents = getEventsForDate(selectedDate);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    if (loading) {
        return <div className="page-container"><p style={{ color: 'var(--text-muted)' }}>Loading calendar...</p></div>;
    }

    return (
        <div ref={pageRef} className="page-container insights-page">
            <h2 className="page-title"><CalendarIcon size={28} className="title-icon" /> Event Calendar</h2>
            <p className="page-subtitle">Track AI-extracted deadlines, meetings, and academic schedules.</p>

            <div className="calendar-layout">
                {/* Left Side: Calendar Grid */}
                <div className="calendar-main glass-card">
                    <div className="calendar-header">
                        <h3>{monthNames[month]} {year}</h3>
                        <div className="calendar-nav">
                            <button onClick={prevMonth} className="icon-btn" data-hoverable><ChevronLeft size={20} /></button>
                            <button onClick={nextMonth} className="icon-btn" data-hoverable><ChevronRight size={20} /></button>
                        </div>
                    </div>

                    <div className="calendar-grid">
                        <div className="weekday-header">Sun</div>
                        <div className="weekday-header">Mon</div>
                        <div className="weekday-header">Tue</div>
                        <div className="weekday-header">Wed</div>
                        <div className="weekday-header">Thu</div>
                        <div className="weekday-header">Fri</div>
                        <div className="weekday-header">Sat</div>

                        {/* Blank previous month days */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="calendar-day empty"></div>
                        ))}

                        {/* Actual days */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dayDate = new Date(year, month, day);
                            const dayEvents = getEventsForDate(dayDate);
                            
                            return (
                                <div 
                                    key={`day-${day}`} 
                                    className={`calendar-day ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
                                    onClick={() => handleDayClick(day)}
                                    data-hoverable
                                >
                                    <span className="day-number">{day}</span>
                                    {dayEvents.length > 0 && (
                                        <div className="day-dots">
                                            {dayEvents.slice(0, 3).map((e, idx) => (
                                                <span 
                                                    key={idx} 
                                                    className={`event-dot ${e.event_type.toLowerCase()}`}
                                                    title={e.title}
                                                />
                                            ))}
                                            {dayEvents.length > 3 && <span className="event-dot-more">+</span>}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Side: Event Details for Selected Date */}
                <div className="calendar-sidebar glass-card">
                    <h3 className="sidebar-date-title">
                        {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h3>
                    
                    <div className="selected-events-list custom-scrollbar">
                        {selectedEvents.length === 0 ? (
                            <div className="no-events-view">
                                <CalendarIcon size={32} />
                                <p>No events scheduled for this date.</p>
                            </div>
                        ) : (
                            selectedEvents.map(event => {
                                const isRange = event.event_type === 'RANGE';
                                const isUrgent = event.event_type === 'DEADLINE' || event.event_type === 'EXAM';
                                
                                return (
                                    <div key={event.id} className="selected-event-card">
                                        <div className="event-card-header">
                                            <span className={`event-badge ${event.event_type.toLowerCase()}`}>
                                                {isUrgent ? <AlertTriangle size={12} /> : <Clock size={12} />}
                                                {event.event_type}
                                            </span>
                                            {event.doc_id && (
                                                <button 
                                                    className="icon-btn-small" 
                                                    onClick={() => navigate(`/documents/${event.doc_id}`)}
                                                    data-hoverable
                                                    title="View Document"
                                                >
                                                    <FileText size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <h4 className="event-card-title">{event.title}</h4>
                                        <p className="event-card-desc">{event.description}</p>
                                        
                                        <div className="event-card-meta">
                                            {isRange ? (
                                                <span>{formatDate(event.start_date)} → {formatDate(event.end_date)}</span>
                                            ) : (
                                                <span>
                                                    {event.event_time ? event.event_time.substring(0, 5) : 'All Day'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
