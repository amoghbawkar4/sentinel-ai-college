import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedLayout from '../layouts/ProtectedLayout';
import PublicLayout from '../layouts/PublicLayout';
import DashboardPage from '../pages/DashboardPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import AuditLogsPage from '../pages/AuditLogsPage';
import UsersPage from '../pages/UsersPage';
import NotFoundPage from '../pages/NotFoundPage';
import ForbiddenPage from '../pages/ForbiddenPage';
import ErrorPage from '../pages/ErrorPage';
import LandingPage from '../pages/LandingPage';
import EmployeeWorkspacePage from '../pages/EmployeeWorkspacePage';
import AdminLoginPage from '../pages/AdminLoginPage';
import { useAdminAuth } from '../contexts/AdminAuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAdminAuthenticated } = useAdminAuth();
  return isAdminAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/employee" element={<EmployeeWorkspacePage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
      </Route>

      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/audit-logs" element={<ProtectedRoute><AuditLogsPage /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
