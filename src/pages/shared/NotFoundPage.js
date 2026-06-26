import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_ROUTES = { admin: '/admin', manager: '/manager', technician: '/technician', customer: '/customer' };

export default function NotFoundPage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-center p-4">
      <div>
        <div className="text-8xl font-bold text-white/10 mb-4">404</div>
        <h1 className="text-3xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-slate-400 mb-8">The page you're looking for doesn't exist.</p>
        <Link to={user ? ROLE_ROUTES[user.role] : '/login'}
          className="bg-purple-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-purple-700 transition">
          Go Home
        </Link>
      </div>
    </div>
  );
}
