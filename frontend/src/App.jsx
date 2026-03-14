import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppLayout from './components/layout/AppLayout';
import CustomCursor from './components/ui/CustomCursor';
import SmoothScroll from './components/ui/SmoothScroll';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import DocumentDetail from './pages/DocumentDetail';
import Upload from './pages/Upload';
import AIInsights from './pages/AIInsights';
import AdminUsers from './pages/AdminUsers';
import AdminDepartments from './pages/AdminDepartments';
import AdminAuditLogs from './pages/AdminAuditLogs';
import Profile from './pages/Profile';
import MyUploads from './pages/MyUploads';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import SetupAccount from './pages/SetupAccount';

function App() {
  const isDark = useSelector((s) => s.theme.isDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    localStorage.setItem('lexdoc-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <div>
      <SmoothScroll>
        <CustomCursor />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/setup-account" element={<SetupAccount />} />
              
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/documents/:id" element={<DocumentDetail />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/my-uploads" element={<MyUploads />} />
                <Route path="/insights" element={<AIInsights />} />

                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/departments" element={<AdminDepartments />} />
                <Route path="/admin/audit" element={<AdminAuditLogs />} />

                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </SmoothScroll>
    </div>
  );
}

export default App;
