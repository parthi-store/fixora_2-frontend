import React, {useEffect, useRef } from 'react';
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminAPI, usersAPI, salariesAPI } from '../../services/api';
import Navbar from '../../components/layout/Navbar';

const MENU = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
  { path: '/admin/salaries', label: 'Salaries', icon: '💰' },
  { path: '/admin/ai-assistant', label: 'AI Assistant', icon: '🤖' },
  { path: '/admin/activity', label: 'Activity Logs', icon: '📜' },
  { path: '/admin/add-manager', label: 'Add Manager', icon: '➕' },
];

function StatCard({ icon, label, value, color }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }}
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 border-l-4 ${color}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-3xl font-bold text-gray-800">{value ?? '...'}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
    </motion.div>
  );
}

function AdminHome() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAnalytics()
      .then(({ data }) => setAnalytics(data))
      .catch(() => toast.error('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  const k = analytics?.kpis || {};

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 font-display">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm">Platform overview and key metrics</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard icon="👥" label="Total Users" value={k.totalUsers} color="border-purple-500" />
        <StatCard icon="👨‍💼" label="Managers" value={k.totalManagers} color="border-blue-800" />
        <StatCard icon="🔧" label="Technicians" value={k.totalTechnicians} color="border-orange-500" />
        <StatCard icon="🛒" label="Customers" value={k.totalCustomers} color="border-blue-400" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard icon="📋" label="Total Requests" value={k.totalRequests} color="border-gray-300" />
        <StatCard icon="⏳" label="Pending" value={k.pendingRequests} color="border-yellow-400" />
        <StatCard icon="🔥" label="Active Jobs" value={k.activeRequests} color="border-orange-400" />
        <StatCard icon="✅" label="Completed" value={k.completedRequests} color="border-green-500" />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-3">💰 Payroll Summary</h3>
          {analytics ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Total Payroll</span><span className="font-semibold">₹{analytics.salary?.totalPayroll?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Paid</span><span className="font-semibold text-green-600">₹{analytics.salary?.paidPayroll?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Pending</span><span className="font-semibold text-red-600">₹{analytics.salary?.unpaidPayroll?.toLocaleString()}</span></div>
            </div>
          ) : <div className="text-gray-400 text-sm">Loading...</div>}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-3">⭐ Rating Overview</h3>
          {analytics ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Avg Rating</span><span className="font-semibold text-yellow-500">★ {analytics.ratings?.avg?.toFixed(1) || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total Reviews</span><span className="font-semibold">{analytics.ratings?.count || 0}</span></div>
            </div>
          ) : <div className="text-gray-400 text-sm">Loading...</div>}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-3">🚦 Job Status</h3>
          {analytics ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Cancelled</span><span className="font-semibold text-red-500">{k.cancelledRequests}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Active</span><span className="font-semibold text-orange-500">{k.activeRequests}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Completed</span><span className="font-semibold text-green-500">{k.completedRequests}</span></div>
            </div>
          ) : <div className="text-gray-400 text-sm">Loading...</div>}
        </div>
      </div>
    </div>
  );
}

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    usersAPI.getAll(roleFilter ? { role: roleFilter } : {})
      .then(({ data }) => setUsers(data.users))
      .catch(() => toast.error('Failed to load users.'))
      .finally(() => setLoading(false));
  }, [roleFilter]);

  const ROLE_BADGES = {
    admin: 'bg-purple-100 text-purple-700',
    manager: 'bg-blue-100 text-blue-800',
    technician: 'bg-orange-100 text-orange-700',
    customer: 'bg-green-100 text-green-700',
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 font-display">All Users</h2>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
          <option value="">All Roles</option>
          {['admin', 'manager', 'technician', 'customer'].map(r => <option key={r} className="capitalize">{r}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Name', 'Email', 'Role', 'Phone', 'Status', 'Created'].map(h =>
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td></tr> :
              users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${ROLE_BADGES[u.role] || 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SalariesPage() {
  const [salaries, setSalaries] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchSalaries = () => {
    salariesAPI.getAll()
      .then(({ data }) => { setSalaries(data.salaries); setSummary(data.summary); })
      .catch(() => toast.error('Failed to load salaries.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSalaries(); }, []);

  const markPaid = async (id) => {
    try {
      await salariesAPI.update(id, { paymentStatus: 'Paid', paymentDate: new Date() });
      toast.success('Salary marked as paid!');
      fetchSalaries();
    } catch { toast.error('Failed to update salary.'); }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 font-display">Salary Management</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Payroll', value: `₹${summary.total?.toLocaleString() || 0}`, color: 'text-gray-800' },
          { label: 'Paid', value: `₹${summary.paid?.toLocaleString() || 0}`, color: 'text-green-600' },
          { label: 'Unpaid', value: `₹${summary.unpaid?.toLocaleString() || 0}`, color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Employee', 'Role', 'Base', 'Tasks', 'Bonus', 'Total', 'Status', 'Action'].map(h =>
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading...</td></tr> :
              salaries.map(s => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{s.employeeId?.name}</td>
                  <td className="px-4 py-3 capitalize text-gray-500 text-xs">{s.employeeRole}</td>
                  <td className="px-4 py-3 text-gray-600">₹{s.baseSalary?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{s.completedTasks}</td>
                  <td className="px-4 py-3 text-green-600">+₹{s.bonus}</td>
                  <td className="px-4 py-3 font-bold text-gray-800">₹{s.totalSalary?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {s.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {s.paymentStatus === 'Unpaid' && (
                      <button onClick={() => markPaid(s._id)}
                        className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition font-semibold">
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AIAssistantPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "👋 Hi! I'm Fixora AI. Ask me anything about your platform data — pending salaries, top technicians, active jobs, and more!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const SUGGESTIONS = [
    'Show pending salaries',
    'Who is the best technician?',
    'How many active jobs today?',
    'Platform overview',
    'List low-rated technicians',
    'Manager performance',
  ];

  const sendMessage = async (text) => {
    const q = text || input;
    if (!q.trim()) return;
    if (loading) return;
    setInput('');
    const history = messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0);
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);
    try {
      const { data } = await adminAPI.aiChat({ question: q, history });
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer, source: data.source }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Sorry, I could not process that request.' }]);
    } finally { setLoading(false); }
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };


  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold text-lg">AI</div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">Fixora AI Assistant</p>
            <p className="text-xs text-gray-400">Powered by database intelligence</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
  {loading && <p>Loading...</p>}   {/* ✅ ADD HERE */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs sm:max-w-sm px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white rounded-tr-sm'
                  : 'bg-gray-100 text-gray-800 rounded-tl-sm'
              }`}>
                {msg.content}
                {msg.source && <p className="text-xs opacity-50 mt-1">via {msg.source}</p>}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-5 pb-3 pt-2 border-t border-gray-100">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => sendMessage(s)}
                className="text-xs text-purple-600 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-full transition border border-purple-100">
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ask about your platform data..." />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
              className="bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-60">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getActivityLogs()
      .then(({ data }) => setLogs(data.logs))
      .catch(() => toast.error('Failed to load logs.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 font-display">Activity Logs</h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['User', 'Role', 'Action', 'Timestamp'].map(h =>
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={4} className="text-center py-12 text-gray-400">Loading...</td></tr> :
              logs.map(log => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{log.userId?.name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 capitalize">{log.userId?.role}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{log.action}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddManagerPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await usersAPI.addManager(form);
      toast.success('Manager added successfully!');
      setForm({ name: '', email: '', password: '', phone: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add manager.');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 font-display">Add Manager</h2>
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
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                required={f.key !== 'phone'} />
                    {loading && <p>Loading...</p>} 
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-700 transition disabled:opacity-60">
            {loading ? 'Adding...' : 'Add Manager'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar menuItems={MENU} />
      <main>
        <Routes>
          <Route index element={<AdminHome />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="salaries" element={<SalariesPage />} />
          <Route path="ai-assistant" element={<AIAssistantPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="add-manager" element={<AddManagerPage />} />
        </Routes>
      </main>
    </div>
  );
}
