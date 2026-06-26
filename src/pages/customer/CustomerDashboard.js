import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { requestsAPI, ratingsAPI } from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../context/AuthContext';

const STATUS_CONFIG = {
  Pending: { color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  Assigned: { color: 'bg-blue-100 text-blue-700', icon: '👤' },
  Accepted: { color: 'bg-indigo-100 text-indigo-700', icon: '✅' },
  OnTheWay: { color: 'bg-purple-100 text-purple-700', icon: '🚗' },
  InProgress: { color: 'bg-orange-100 text-orange-700', icon: '🔧' },
  Completed: { color: 'bg-green-100 text-green-700', icon: '✔️' },
  Cancelled: { color: 'bg-red-100 text-red-700', icon: '❌' },
};

const ISSUE_CATEGORIES = ['plumbing', 'electrical', 'hvac', 'appliance', 'carpentry', 'painting', 'cleaning', 'other'];
const MENU = [
  { path: '/customer', label: 'Dashboard', icon: '🏠' },
  { path: '/customer/new-request', label: 'New Request', icon: '➕' },
  { path: '/customer/history', label: 'My Requests', icon: '📋' },
];

// New Request Form
function NewRequestPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    location: { address: '' }, issue: '',
    issueCategory: 'other', preferredTime: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestsAPI.create(form);
      toast.success('Service request submitted! We\'ll assign a technician shortly.');
      setForm({ name: user?.name || '', phone: user?.phone || '', location: { address: '' }, issue: '', issueCategory: 'other', preferredTime: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-1 font-display">Submit Service Request</h2>
        <p className="text-gray-500 text-sm mb-6">Tell us about your issue and we'll send the right expert</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your name" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Phone Number</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+91 9000000000" required />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Service Address</label>
            <input type="text" value={form.location.address} onChange={e => setForm({ ...form, location: { address: e.target.value } })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Full address where service is needed" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Issue Category</label>
              <select value={form.issueCategory} onChange={e => setForm({ ...form, issueCategory: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize">
                {ISSUE_CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Preferred Time</label>
              <input type="datetime-local" value={form.preferredTime} onChange={e => setForm({ ...form, preferredTime: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Describe the Issue</label>
            <textarea value={form.issue} onChange={e => setForm({ ...form, issue: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4} placeholder="Describe your issue in detail..." required />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-60 shadow-lg shadow-blue-200">
            {loading ? 'Submitting...' : '🚀 Submit Request'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// Rating Modal
function RatingModal({ request, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await ratingsAPI.create({ requestId: request._id, technicianId: request.assignedTechnician?._id, rating, review });
      toast.success('Rating submitted! Thank you for your feedback.');
      onSubmit();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Rate Your Experience</h3>
        <p className="text-sm text-gray-500 mb-5">How was your service with {request.assignedTechnician?.name}?</p>

        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map(star => (
            <button key={star} onClick={() => setRating(star)}
              className={`text-3xl transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}>
              ★
            </button>
          ))}
        </div>

        <textarea value={review} onChange={e => setReview(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
          rows={3} placeholder="Write a review (optional)..." />

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60">
            {loading ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Request History
function RequestHistory() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingRequest, setRatingRequest] = useState(null);
  const [ratedIds, setRatedIds] = useState(new Set());

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await requestsAPI.getAll();
        setRequests(data.requests);
      } catch { toast.error('Failed to load requests.'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 font-display">My Service Requests</h2>

      {requests.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📋</div>
          <p>No requests yet. Submit your first service request!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => {
            const sc = STATUS_CONFIG[req.status] || STATUS_CONFIG.Pending;
            return (
              <motion.div key={req._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${sc.color}`}>
                        {sc.icon} {req.status}
                      </span>
                      <span className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-0.5 rounded-full">{req.issueCategory}</span>
                    </div>
                    <p className="font-semibold text-gray-800">{req.issue}</p>
                    <p className="text-sm text-gray-500 mt-1">📍 {req.location?.address}</p>
                    <p className="text-xs text-gray-400 mt-1">Submitted: {new Date(req.createdAt).toLocaleString()}</p>
                    {req.assignedTechnician && (
                      <p className="text-sm text-blue-600 mt-2">
                        👨‍🔧 Technician: <strong>{req.assignedTechnician.name}</strong>
                        {req.assignedTechnician.phone && (
                          <a href={`tel:${req.assignedTechnician.phone}`} className="ml-2 text-green-600 font-semibold">📞 Call</a>
                        )}
                      </p>
                    )}
                  </div>
                  {req.status === 'Completed' && !ratedIds.has(req._id) && (
                    <button onClick={() => setRatingRequest(req)}
                      className="flex-shrink-0 bg-yellow-400 hover:bg-yellow-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
                      ⭐ Rate
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {ratingRequest && (
        <RatingModal request={ratingRequest} onClose={() => setRatingRequest(null)}
          onSubmit={() => setRatedIds(prev => new Set([...prev, ratingRequest._id]))} />
      )}
    </div>
  );
}

// Customer Home
function CustomerHome() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestsAPI.getAll().then(({ data }) => { setRequests(data.requests); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const counts = {
    total: requests.length,
    active: requests.filter(r => ['Assigned', 'Accepted', 'OnTheWay', 'InProgress'].includes(r.status)).length,
    completed: requests.filter(r => r.status === 'Completed').length,
    pending: requests.filter(r => r.status === 'Pending').length,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 font-display">Welcome back, {user?.name}! 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Here's an overview of your service requests</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Requests', value: counts.total, icon: '📋', color: 'bg-blue-50 text-blue-700 border-blue-100' },
          { label: 'Active', value: counts.active, icon: '🔧', color: 'bg-orange-50 text-orange-700 border-orange-100' },
          { label: 'Completed', value: counts.completed, icon: '✅', color: 'bg-green-50 text-green-700 border-green-100' },
          { label: 'Pending', value: counts.pending, icon: '⏳', color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
        ].map(stat => (
          <motion.div key={stat.label} whileHover={{ scale: 1.02 }}
            className={`rounded-2xl border p-4 ${stat.color}`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold">{loading ? '...' : stat.value}</div>
            <div className="text-xs font-medium mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent requests */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Recent Requests</h2>
        {loading ? <div className="text-center py-8 text-gray-400">Loading...</div> :
          requests.slice(0, 5).length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No requests yet.</p>
              <a href="/customer/new-request" className="text-blue-600 font-medium text-sm mt-2 inline-block">Submit your first request →</a>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.slice(0, 5).map(req => {
                const sc = STATUS_CONFIG[req.status] || STATUS_CONFIG.Pending;
                return (
                  <div key={req._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{req.issue}</p>
                      <p className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${sc.color}`}>{sc.icon} {req.status}</span>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}

export default function CustomerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar menuItems={MENU} />
      <main>
        <Routes>
          <Route index element={<CustomerHome />} />
          <Route path="new-request" element={<NewRequestPage />} />
          <Route path="history" element={<RequestHistory />} />
        </Routes>
      </main>
    </div>
  );
}
