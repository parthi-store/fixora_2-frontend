import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Role Dashboards
import AdminDashboard from './pages/admin/AdminDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import CustomerDashboard from './pages/customer/CustomerDashboard';

// Shared Pages
import ChatPage from './pages/shared/ChatPage';
import NotFoundPage from './pages/shared/NotFoundPage';

const ROLE_ROUTES = {
  admin: '/admin',
  manager: '/manager',
  technician: '/technician',
  customer: '/customer',
};

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={ROLE_ROUTES[user.role]} replace />;
  return children;
};

const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={ROLE_ROUTES[user.role]} replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

      <Route path="/admin/*" element={<ProtectedRoute roles={['admin']}><NotificationProvider><AdminDashboard /></NotificationProvider></ProtectedRoute>} />
      <Route path="/manager/*" element={<ProtectedRoute roles={['manager']}><NotificationProvider><ManagerDashboard /></NotificationProvider></ProtectedRoute>} />
      <Route path="/technician/*" element={<ProtectedRoute roles={['technician']}><NotificationProvider><TechnicianDashboard /></NotificationProvider></ProtectedRoute>} />
      <Route path="/customer/*" element={<ProtectedRoute roles={['customer']}><NotificationProvider><CustomerDashboard /></NotificationProvider></ProtectedRoute>} />

      <Route path="/chat" element={<ProtectedRoute><NotificationProvider><ChatPage /></NotificationProvider></ProtectedRoute>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '10px', fontFamily: 'Inter, sans-serif' },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
