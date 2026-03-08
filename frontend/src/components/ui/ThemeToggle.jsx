import { Sun, Moon } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../store/store';
import './ThemeToggle.css';

export default function ThemeToggle() {
    const isDark = useSelector((state) => state.theme.isDark);
    const dispatch = useDispatch();

    const switchTheme = () => {
        dispatch(toggleTheme());
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('lexdoc-theme', isDark ? 'light' : 'dark');
    };

    const handleToggle = () => {
        if (!document.startViewTransition) {
            switchTheme();
            return;
        }
        document.startViewTransition(switchTheme);
    };

    return (
        <button
            className="theme-toggle-btn"
            onClick={handleToggle}
            aria-label="Toggle theme"
            data-hoverable
        >
            <div className="theme-toggle-icon">
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </div>
        </button>
    );
}
