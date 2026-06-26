import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { requestsAPI, tasksAPI, usersAPI, ratingsAPI } from '../../services/api';
import Navbar from '../../components/layout/Navbar';

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Assigned: 'bg-blue-100 text-blue-700',
  Accepted: 'bg-indigo-100 text-indigo-700',
  OnTheWay: 'bg-purple-100 text-purple-700',
  InProgress: 'bg-orange-100 text-orange-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const MENU = [
  { path: '/manager', label: 'Dashboard', icon: '📊' },
  { path: '/manager/requests', label: 'Requests', icon: '📋' },
  { path: '/manager/technicians', label: 'Technicians', icon: '👨‍🔧' },
  { path: '/manager/ratings', label: 'Ratings', icon: '⭐' },
  { path: '/manager/add-technician', label: 'Add Technician', icon: '➕' },
];

function AssignModal({ request, technicians, onClose, onAssigned }) {
  const [form, setForm] = useState({ technicianId: '', priority: 'Medium', deadline: '' });
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!form.technicianId) { toast.error('Please select a technician.'); return; }
    setLoading(true);
    try {
      await tasksAPI.assign({ requestId: request._id, ...form });
      toast.success('Task assigned successfully!');
      onAssigned();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Assign Technician</h3>
        <p className="text-sm text-gray-500 mb-5 line-clamp-2">{request.issue}</p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Select Technician</label>
            <select value={form.technicianId} onChange={e => setForm({ ...form, technicianId: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Choose a technician...</option>
              {technicians.map(t => <option key={t._id} value={t._id}>{t.name} — {t.phone}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {['Low', 'Medium', 'High', 'Urgent'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Deadline</label>
              <input type="datetime-local" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleAssign} disabled={loading}
            className="flex-1 py-2.5 bg-blue-800 text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition disabled:opacity-60">
            {loading ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningReq, setAssigningReq] = useState(null);
  const [filter, setFilter] = useState('');

  const fetchData = async () => {
    try {
      const [reqRes, techRes] = await Promise.all([requestsAPI.getAll(), usersAPI.getTechnicians()]);
      setRequests(reqRes.data.requests);
      setTechnicians(techRes.data.technicians);
    } catch { toast.error('Failed to load data.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = filter ? requests.filter(r => r.status === filter) : requests;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 font-display">Service Requests</h2>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800">
          <option value="">All Statuses</option>
          {['Pending', 'Assigned', 'Accepted', 'OnTheWay', 'InProgress', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <div className="text-center py-16 text-gray-400">Loading...</div> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Customer', 'Issue', 'Location', 'Status', 'Technician', 'Date', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No requests found</td></tr>
              ) : filtered.map(req => (
                <tr key={req._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{req.customerId?.name || req.name}</p>
                    <p className="text-xs text-gray-400">{req.customerId?.phone || req.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-700 max-w-xs truncate">{req.issue}</p>
                    <span className="text-xs capitalize text-gray-400">{req.issueCategory}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{req.location?.address}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-600'}`}>{req.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{req.assignedTechnician?.name || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {req.status === 'Pending' && (
                      <button onClick={() => setAssigningReq(req)}
                        className="bg-blue-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-900 transition whitespace-nowrap">
                        Assign
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {assigningReq && (
        <AssignModal request={assigningReq} technicians={technicians}
          onClose={() => setAssigningReq(null)} onAssigned={fetchData} />
      )}
    </div>
  );
}

function TechniciansPage() {
  const [technicians, setTechnicians] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([usersAPI.getTechnicians(), ratingsAPI.getTop()])
      .then(([tRes, rRes]) => {
        setTechnicians(tRes.data.technicians);
        setRatings(rRes.data.topTechnicians);
      }).catch(() => toast.error('Failed to load.'))
      .finally(() => setLoading(false));
  }, []);

  const getRating = (id) => {
    const r = ratings.find(r => r._id?._id?.toString() === id || r._id?.toString() === id);
    return r ? { avg: r.avgRating?.toFixed(1), count: r.count } : null;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 font-display">Technicians</h2>
      {loading ? <div className="text-center py-16 text-gray-400">Loading...</div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {technicians.map(tech => {
            const r = getRating(tech._id);
            return (
              <motion.div key={tech._id} whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold">
                    {tech.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{tech.name}</p>
                    <p className="text-xs text-gray-400">{tech.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{tech.phone}</span>
                  {r ? (
                    <span className="flex items-center gap-1 text-yellow-500 font-semibold">
                      ★ {r.avg} <span className="text-gray-400 text-xs font-normal">({r.count})</span>
                    </span>
                  ) : <span className="text-gray-300 text-xs">No ratings</span>}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    ● Active
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RatingsPage() {
  const [topTech, setTopTech] = useState([]);
  useEffect(() => { ratingsAPI.getTop().then(({ data }) => setTopTech(data.topTechnicians)).catch(() => {}); }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 font-display">Technician Ratings</h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Rank', 'Technician', 'Avg Rating', 'Total Reviews'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {topTech.map((t, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-bold text-gray-400">#{i + 1}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{t._id?.name}</p>
                  <p className="text-xs text-gray-400">{t._id?.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-yellow-500 font-bold">
                    ★ {t.avgRating?.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{t.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddTechnicianPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await usersAPI.addTechnician(form);
      toast.success('Technician added successfully!');
      setForm({ name: '', email: '', password: '', phone: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add technician.');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 font-display">Add Technician</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full Name', key: 'name', type: 'text' },
            { label: 'Email', key: 'email', type: 'email' },
            { label: 'Phone', key: 'phone', type: 'tel' },
            { label: 'Password', key: 'password', type: 'password' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{f.label}</label>
              <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800"
                required={f.key !== 'phone'} />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-800 text-white font-semibold py-3 rounded-xl hover:bg-blue-900 transition disabled:opacity-60">
            {loading ? 'Adding...' : 'Add Technician'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function ManagerHome() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestsAPI.getAll().then(({ data }) => { setRequests(data.requests); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const counts = {
    pending: requests.filter(r => r.status === 'Pending').length,
    active: requests.filter(r => ['Assigned', 'Accepted', 'OnTheWay', 'InProgress'].includes(r.status)).length,
    completed: requests.filter(r => r.status === 'Completed').length,
    total: requests.length,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 font-display">Manager Dashboard</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pending', value: counts.pending, color: 'border-l-4 border-yellow-400', icon: '⏳' },
          { label: 'Active Jobs', value: counts.active, color: 'border-l-4 border-blue-800', icon: '🔧' },
          { label: 'Completed', value: counts.completed, color: 'border-l-4 border-green-500', icon: '✅' },
          { label: 'Total', value: counts.total, color: 'border-l-4 border-gray-300', icon: '📋' },
        ].map(stat => (
          <div key={stat.label} className={`bg-white rounded-2xl shadow-sm p-5 ${stat.color}`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-3xl font-bold text-gray-800">{loading ? '...' : stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Recent Pending Requests</h2>
        {requests.filter(r => r.status === 'Pending').slice(0, 5).map(req => (
          <div key={req._id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-800">{req.issue}</p>
              <p className="text-xs text-gray-400">{req.customerId?.name} • {req.location?.address}</p>
            </div>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full font-semibold">Pending</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ManagerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar menuItems={MENU} />
      <main>
        <Routes>
          <Route index element={<ManagerHome />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="technicians" element={<TechniciansPage />} />
          <Route path="ratings" element={<RatingsPage />} />
          <Route path="add-technician" element={<AddTechnicianPage />} />
        </Routes>
      </main>
    </div>
  );
}
