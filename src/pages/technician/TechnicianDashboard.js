import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { tasksAPI, locationAPI } from '../../services/api';
import Navbar from '../../components/layout/Navbar';

const MENU = [
  { path: '/technician', label: 'Dashboard', icon: '🏠' },
  { path: '/technician/tasks', label: 'My Tasks', icon: '📋' },
  { path: '/technician/location', label: 'Update Location', icon: '📍' },
];

const PRIORITY_COLORS = {
  Low: 'bg-gray-100 text-gray-600',
  Medium: 'bg-blue-100 text-blue-700',
  High: 'bg-orange-100 text-orange-700',
  Urgent: 'bg-red-100 text-red-700',
};

const STATUS_FLOW = ['Accepted', 'OnTheWay', 'InProgress', 'Completed'];
const STATUS_LABELS = {
  Assigned: { label: 'Accept Job', next: 'Accepted', icon: '✅' },
  Accepted: { label: 'On My Way', next: 'OnTheWay', icon: '🚗' },
  OnTheWay: { label: 'Start Work', next: 'InProgress', icon: '🔧' },
  InProgress: { label: 'Mark Complete', next: 'Completed', icon: '🏁' },
};

function RejectModal({ task, onClose, onRejected }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!reason.trim()) { toast.error('Please provide a rejection reason.'); return; }
    setLoading(true);
    try {
      await tasksAPI.updateStatus(task._id, { status: 'Rejected', rejectionReason: reason });
      toast.success('Task rejected.');
      onRejected();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject task.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Reject Task</h3>
        <p className="text-sm text-gray-500 mb-4">Please provide a reason for rejecting this task.</p>
        <textarea value={reason} onChange={e => setReason(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none mb-4"
          rows={3} placeholder="e.g. Not available at the scheduled time..." />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleReject} disabled={loading}
            className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition disabled:opacity-60">
            {loading ? 'Rejecting...' : 'Reject Task'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function TaskCard({ task, onUpdate }) {
  const [rejectModal, setRejectModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const nextAction = STATUS_LABELS[task.status];
  const request = task.requestId;

  const handleStatusUpdate = async () => {
    if (!nextAction) return;
    setLoading(true);
    try {
      await tasksAPI.updateStatus(task._id, { status: nextAction.next });
      toast.success(`Status updated to ${nextAction.next}`);
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
              {task.priority}
            </span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{task.status}</span>
          </div>
          <p className="font-semibold text-gray-800">{request?.issue || 'Service Task'}</p>
        </div>
      </div>

      <div className="space-y-1.5 mb-4 text-sm text-gray-500">
        {request?.name && <p>👤 <strong className="text-gray-700">{request.name}</strong></p>}
        {request?.phone && (
          <p>📞 <a href={`tel:${request.phone}`} className="text-green-600 font-semibold hover:underline">{request.phone}</a></p>
        )}
        {request?.location?.address && <p>📍 {request.location.address}</p>}
        {task.deadline && <p>⏰ Deadline: {new Date(task.deadline).toLocaleString()}</p>}
      </div>

      {/* Progress bar */}
      {task.status !== 'Rejected' && (
        <div className="mb-4">
          <div className="flex gap-1">
            {['Assigned', ...STATUS_FLOW].map((s, i) => {
              const steps = ['Assigned', ...STATUS_FLOW];
              const currentIdx = steps.indexOf(task.status);
              const active = i <= currentIdx;
              return (
                <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${active ? 'bg-orange-500' : 'bg-gray-200'}`} />
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Assigned</span><span>On Way</span><span>Working</span><span>Done</span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {nextAction && task.status !== 'Completed' && (
          <button onClick={handleStatusUpdate} disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60">
            {loading ? '...' : `${nextAction.icon} ${nextAction.label}`}
          </button>
        )}
        {task.status === 'Assigned' && (
          <button onClick={() => setRejectModal(true)}
            className="px-4 py-2.5 border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition">
            Reject
          </button>
        )}
        {task.status === 'Completed' && (
          <div className="flex-1 text-center py-2.5 bg-green-50 text-green-700 text-sm font-semibold rounded-xl">
            ✅ Completed
          </div>
        )}
      </div>

      {rejectModal && (
        <RejectModal task={task} onClose={() => setRejectModal(false)} onRejected={onUpdate} />
      )}
    </motion.div>
  );
}

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchTasks = async () => {
    try {
      const { data } = await tasksAPI.getAll();
      setTasks(data.tasks);
    } catch { toast.error('Failed to load tasks.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const filtered = filter ? tasks.filter(t => t.status === filter) : tasks;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 font-display">My Tasks</h2>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
          <option value="">All Tasks</option>
          {['Assigned', 'Accepted', 'OnTheWay', 'InProgress', 'Completed', 'Rejected'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      {loading ? <div className="text-center py-16 text-gray-400">Loading tasks...</div> :
        filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">📋</div>
            <p>No tasks found.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map(task => <TaskCard key={task._id} task={task} onUpdate={fetchTasks} />)}
          </div>
        )}
    </div>
  );
}

function LocationPage() {
  const [coords, setCoords] = useState({ latitude: '', longitude: '' });
  const [loading, setLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);

  const getGPS = () => {
    setAutoLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoords({ latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) });
        setAutoLoading(false);
        toast.success('Location detected!');
      },
      () => { toast.error('Could not get GPS location.'); setAutoLoading(false); }
    );
  };

  const handleUpdate = async () => {
    if (!coords.latitude || !coords.longitude) { toast.error('Please provide coordinates.'); return; }
    setLoading(true);
    try {
      await locationAPI.update({ latitude: parseFloat(coords.latitude), longitude: parseFloat(coords.longitude) });
      toast.success('Location updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update location.');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-1 font-display">Update Location</h2>
        <p className="text-gray-500 text-sm mb-6">Share your current location with customers</p>

        <button onClick={getGPS} disabled={autoLoading}
          className="w-full mb-4 border-2 border-dashed border-orange-200 text-orange-600 font-medium py-3 rounded-xl hover:bg-orange-50 transition disabled:opacity-60 flex items-center justify-center gap-2">
          {autoLoading ? '📡 Detecting...' : '📍 Use My Current GPS Location'}
        </button>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Latitude</label>
            <input type="number" step="any" value={coords.latitude} onChange={e => setCoords({ ...coords, latitude: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g. 13.0827" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Longitude</label>
            <input type="number" step="any" value={coords.longitude} onChange={e => setCoords({ ...coords, longitude: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g. 80.2707" />
          </div>
          <button onClick={handleUpdate} disabled={loading}
            className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl hover:bg-orange-600 transition disabled:opacity-60 shadow-lg shadow-orange-100">
            {loading ? 'Updating...' : '🚀 Update Location'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function TechnicianHome() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tasksAPI.getAll().then(({ data }) => { setTasks(data.tasks); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const counts = {
    assigned: tasks.filter(t => t.status === 'Assigned').length,
    active: tasks.filter(t => ['Accepted', 'OnTheWay', 'InProgress'].includes(t.status)).length,
    completed: tasks.filter(t => t.status === 'Completed').length,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 font-display">Technician Dashboard</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'New Assignments', value: counts.assigned, icon: '📬', color: 'border-l-4 border-yellow-400' },
          { label: 'Active Jobs', value: counts.active, icon: '🔧', color: 'border-l-4 border-orange-500' },
          { label: 'Completed', value: counts.completed, icon: '✅', color: 'border-l-4 border-green-500' },
        ].map(stat => (
          <div key={stat.label} className={`bg-white rounded-2xl shadow-sm p-5 ${stat.color}`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-3xl font-bold text-gray-800">{loading ? '...' : stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Active tasks */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Active Tasks</h2>
        {tasks.filter(t => ['Assigned', 'Accepted', 'OnTheWay', 'InProgress'].includes(t.status)).slice(0, 3).map(task => (
          <div key={task._id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-800">{task.requestId?.issue || 'Task'}</p>
              <p className="text-xs text-gray-400">{task.requestId?.location?.address}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TechnicianDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar menuItems={MENU} />
      <main>
        <Routes>
          <Route index element={<TechnicianHome />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="location" element={<LocationPage />} />
        </Routes>
      </main>
    </div>
  );
}
