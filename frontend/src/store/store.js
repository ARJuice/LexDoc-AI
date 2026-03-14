import { configureStore, createSlice } from '@reduxjs/toolkit';

// ---- Theme Slice ----
const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('lexdoc-theme') : null;
const themeSlice = createSlice({
    name: 'theme',
    initialState: { isDark: savedTheme === 'dark' },
    reducers: {
        toggleTheme: (state) => { state.isDark = !state.isDark; },
        setTheme: (state, action) => { state.isDark = action.payload; },
    },
});

// ---- Sidebar Slice ----
const sidebarSlice = createSlice({
    name: 'sidebar',
    initialState: { collapsed: false },
    reducers: {
        toggleSidebar: (state) => { state.collapsed = !state.collapsed; },
        setSidebar: (state, action) => { state.collapsed = action.payload; },
    },
});

// ---- Notifications Slice ----
const notificationsSlice = createSlice({
    name: 'notifications',
    initialState: { unreadCount: 0, panelOpen: false },
    reducers: {
        setPanelOpen: (state, action) => { state.panelOpen = action.payload; },
        decrementUnread: (state) => { state.unreadCount = Math.max(0, state.unreadCount - 1); },
        setUnreadCount: (state, action) => { state.unreadCount = action.payload; },
    },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export const { toggleSidebar, setSidebar } = sidebarSlice.actions;
export const { setPanelOpen, decrementUnread, setUnreadCount } = notificationsSlice.actions;

const store = configureStore({
    reducer: {
        theme: themeSlice.reducer,
        sidebar: sidebarSlice.reducer,
        notifications: notificationsSlice.reducer,
    },
});

export default store;
