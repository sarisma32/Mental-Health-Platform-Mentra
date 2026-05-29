import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../config/api.js';

const TASK_TYPES = ['CBT', 'Journaling', 'Mindfulness', 'Breathing', 'Exercise', 'Social', 'Other'];
const FREQUENCIES = ['once', 'daily', 'weekly'];

const statusBadge = (status) => {
  const map = { pending: 'bg-yellow-100 text-yellow-700', completed: 'bg-green-100 text-green-700', missed: 'bg-red-100 text-red-700' };
  return map[status] || 'bg-gray-100 text-gray-600';
};

const difficultyColor = (d) => ({ Easy: 'text-green-600', Medium: 'text-yellow-600', Hard: 'text-red-600' }[d] || '');

const DoctorTherapyTasks = ({ patients = [], preSelectedPatient = null, onClearPreSelected }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(!!preSelectedPatient);
  const [editTask, setEditTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // task to delete
  const [selectedPatient, setSelectedPatient] = useState(
    preSelectedPatient ? String(preSelectedPatient.patient_id || preSelectedPatient.id || '') : ''
  );
  const [filterPatient, setFilterPatient] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', type: 'CBT', deadline: '', frequency: 'once' });
  const [expandedTask, setExpandedTask] = useState(null);

  const token = localStorage.getItem('token');

  const fetchTasks = async (patientId = '') => {
    setLoading(true);
    try {
      const url = patientId
        ? buildApiUrl(`/api/therapy/doctor/tasks?patientId=${patientId}`)
        : buildApiUrl('/api/therapy/doctor/tasks');
      const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
      const data = await res.json();
      if (data.success) setTasks(data.tasks);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const showMsg = (text, type = 'success') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3000); };

  const openEdit = (task) => {
    setEditTask(task);
    setSelectedPatient(String(task.patient_id));
    setForm({ title: task.title, description: task.description || '', type: task.type, deadline: task.deadline?.split('T')[0] || '', frequency: task.frequency });
    setShowForm(true);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!editTask && !selectedPatient) return showMsg('Please select a patient.', 'error');
    setSubmitting(true);
    try {
      let res;
      if (editTask) {
        // Update existing task
        res = await fetch(buildApiUrl(`/api/therapy/doctor/tasks/${editTask.id}`), {
          method: 'PUT',
          headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        // Create new task
        res = await fetch(buildApiUrl('/api/therapy/assign'), {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, patientId: selectedPatient }),
        });
      }
      const data = await res.json();
      if (data.success) {
        showMsg(editTask ? 'Task updated successfully!' : 'Task assigned successfully!');
        setShowForm(false);
        setEditTask(null);
        setForm({ title: '', description: '', type: 'CBT', deadline: '', frequency: 'once' });
        setSelectedPatient('');
        onClearPreSelected && onClearPreSelected();
        fetchTasks(filterPatient);
      } else showMsg(data.message || 'Failed.', 'error');
    } catch { showMsg('Something went wrong.', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (taskId) => {
    try {
      await fetch(buildApiUrl(`/api/therapy/doctor/tasks/${taskId}`), {
        method: 'DELETE', headers: { Authorization: 'Bearer ' + token },
      });
      setDeleteConfirm(null);
      fetchTasks(filterPatient);
    } catch { showMsg('Failed to delete.', 'error'); }
  };

  const filtered = filterPatient ? tasks.filter(t => String(t.patient_id) === String(filterPatient)) : tasks;
  const completedCount = filtered.filter(t => t.status === 'completed').length;
  const completionRate = filtered.length > 0 ? Math.round((completedCount / filtered.length) * 100) : 0;

  return (
    <div className="space-y-6">

      {msg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium border ${msg.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-[#f0f7f4] text-[#4A7C59] border-[#dce8e0]'}`}>
          {msg.type === 'error' ? '' : ''} {msg.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Therapy Homework</h2>
          <p className="text-sm text-gray-400 mt-0.5">Assign and track therapy tasks for your patients</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#4A7C59] hover:bg-[#3d6b4a] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Assign Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Tasks', value: filtered.length, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Completed', value: completedCount, bg: 'bg-[#f0f7f4]', color: 'text-[#4A7C59]' },
          { label: 'Completion Rate', value: completionRate + '%', bg: 'bg-purple-50', color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select value={filterPatient} onChange={e => { setFilterPatient(e.target.value); fetchTasks(e.target.value); }}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4A7C59] bg-white">
          <option value="">All Patients</option>
          {patients.map(p => (
            <option key={p.id || p.patient_id} value={p.id || p.patient_id}>
              {p.full_name || `${p.patient_first_name} ${p.patient_last_name}`}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-400">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A7C59]" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-[#f0f7f4] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <p className="text-gray-500 font-medium">No tasks assigned yet</p>
          <p className="text-sm text-gray-400 mt-1">Click "Assign Task" to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => (
            <div key={task.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-800">{task.title}</p>
                    <span className="text-xs bg-[#f0f7f4] text-[#4A7C59] px-2 py-0.5 rounded-full">{task.type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(task.status)}`}>{task.status}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Patient: <span className="font-medium text-gray-600">{task.patient_name}</span>
                    {' · '}Due: {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {' · '}{task.frequency}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {task.difficulty && (
                    <span className={`text-xs font-semibold ${difficultyColor(task.difficulty)}`}>
                      {task.difficulty}
                    </span>
                  )}
                  <button onClick={e => { e.stopPropagation(); openEdit(task); }}
                    className="p-1.5 text-gray-300 hover:text-[#4A7C59] transition-colors rounded-lg hover:bg-[#f0f7f4]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={e => { e.stopPropagation(); setDeleteConfirm(task); }}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedTask === task.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              {expandedTask === task.id && (
                <div className="px-5 pb-4 border-t border-gray-50 pt-3 space-y-2">
                  {task.description && <p className="text-sm text-gray-600">{task.description}</p>}
                  {task.completed_at && (
                    <p className="text-xs text-gray-400">Completed: {new Date(task.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  )}
                  {task.feedback_comment && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Patient Feedback</p>
                      <p className="text-sm text-gray-700">{task.feedback_comment}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-2">Delete Task</h3>
            <p className="text-sm text-gray-500 mb-1">Are you sure you want to delete this task?</p>
            <p className="text-sm font-medium text-gray-700 mb-6">"{deleteConfirm.title}"</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                No
              </button>
              <button onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {showForm && (        <div className="fixed inset-0 backdrop-blur-md bg-white/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-800">{editTask ? 'Edit Therapy Task' : 'Assign Therapy Task'}</h3>
              <button onClick={() => { setShowForm(false); setEditTask(null); onClearPreSelected && onClearPreSelected(); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleAssign} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Patient *</label>
                <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} required
                  disabled={!!preSelectedPatient}
                  className={`w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4A7C59] ${preSelectedPatient ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'}`}>
                  <option value="">Select patient...</option>
                  {patients.map(p => (
                    <option key={p.id || p.patient_id} value={p.id || p.patient_id}>
                      {p.full_name || `${p.patient_first_name} ${p.patient_last_name}`}
                    </option>
                  ))}
                  {/* If preSelectedPatient not in list, add it */}
                  {preSelectedPatient && !patients.find(p => String(p.id || p.patient_id) === String(preSelectedPatient.patient_id || preSelectedPatient.id)) && (
                    <option value={preSelectedPatient.patient_id || preSelectedPatient.id}>
                      {preSelectedPatient.patient_first_name} {preSelectedPatient.patient_last_name}
                    </option>
                  )}
                </select>
                {preSelectedPatient && <p className="text-xs text-[#4A7C59] mt-1">Auto-filled from appointment</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Task Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
                  placeholder="e.g. Daily Breathing Exercise"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4A7C59] bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Instructions for the patient..."
                  rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4A7C59] bg-gray-50 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Type *</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4A7C59] bg-gray-50">
                    {TASK_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Frequency *</label>
                  <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4A7C59] bg-gray-50">
                    {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Deadline *</label>
                <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4A7C59] bg-gray-50" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditTask(null); onClearPreSelected && onClearPreSelected(); }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 bg-[#4A7C59] hover:bg-[#3d6b4a] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
                  {submitting ? 'Saving...' : editTask ? 'Update Task' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorTherapyTasks;
