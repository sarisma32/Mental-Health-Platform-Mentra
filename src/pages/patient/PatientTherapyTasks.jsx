import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../config/api.js';

const typeColors = {
  CBT: 'bg-blue-100 text-blue-700',
  Journaling: 'bg-purple-100 text-purple-700',
  Mindfulness: 'bg-teal-100 text-teal-700',
  Breathing: 'bg-cyan-100 text-cyan-700',
  Exercise: 'bg-orange-100 text-orange-700',
  Social: 'bg-pink-100 text-pink-700',
  Other: 'bg-gray-100 text-gray-600',
};

const isOverdue = (deadline, status) =>
  status === 'pending' && new Date(deadline) < new Date();

const PatientTherapyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState({ total: 0, completed: 0, pending: 0, completionRate: 0, streak: 0 });
  const [loading, setLoading] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [feedback, setFeedback] = useState({ difficulty: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

  const token = localStorage.getItem('token');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tasksRes, progressRes] = await Promise.all([
        fetch(buildApiUrl('/api/therapy/patient/tasks'), { headers: { Authorization: 'Bearer ' + token } }),
        fetch(buildApiUrl('/api/therapy/patient/progress'), { headers: { Authorization: 'Bearer ' + token } }),
      ]);
      const [tasksData, progressData] = await Promise.all([tasksRes.json(), progressRes.json()]);
      if (tasksData.success) setTasks(tasksData.tasks);
      if (progressData.success) setProgress(progressData.stats);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const showMsg = (text, type = 'success') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3000); };

  const handleComplete = async (taskId) => {
    try {
      const res = await fetch(buildApiUrl(`/api/therapy/patient/tasks/${taskId}/complete`), {
        method: 'PUT', headers: { Authorization: 'Bearer ' + token },
      });
      const data = await res.json();
      if (data.success) { showMsg('Task marked as completed! '); fetchAll(); }
      else showMsg(data.message, 'error');
    } catch { showMsg('Something went wrong.', 'error'); }
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    if (!feedback.difficulty) return showMsg('Please select a difficulty.', 'error');
    setSubmitting(true);
    try {
      const res = await fetch(buildApiUrl(`/api/therapy/patient/tasks/${feedbackModal.id}/feedback`), {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });
      const data = await res.json();
      if (data.success) {
        showMsg('Feedback submitted!');
        setFeedbackModal(null);
        setFeedback({ difficulty: '', comment: '' });
        fetchAll();
      } else showMsg(data.message, 'error');
    } catch { showMsg('Something went wrong.', 'error'); }
    finally { setSubmitting(false); }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const displayed = activeTab === 'pending' ? pendingTasks : completedTasks;

  return (
    <div className="space-y-6">

      {msg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium border ${msg.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-[#f0f7f4] text-[#4A7C59] border-[#dce8e0]'}`}>
          {msg.type === 'error' ? '' : ''} {msg.text}
        </div>
      )}

      {/* Progress Banner */}
      <div className="relative bg-gradient-to-r from-[#4A7C59] to-[#3d6b4a] rounded-2xl p-6 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/75 text-sm">My Therapy Progress</p>
              <h2 className="text-2xl font-bold mt-0.5">{progress.completionRate}% Complete</h2>
            </div>
            <div className="text-center bg-white/10 rounded-xl px-4 py-2">
              <p className="text-2xl font-bold">{progress.streak}</p>
              <p className="text-xs text-white/75 flex items-center gap-1">
                  Day Streak
                  <svg className="w-3.5 h-3.5 text-white/75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-white rounded-full h-2 transition-all duration-500" style={{ width: progress.completionRate + '%' }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/70">
            <span>{progress.completed} completed</span>
            <span>{progress.pending} pending</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Tasks', value: progress.total, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Completed', value: progress.completed, bg: 'bg-[#f0f7f4]', color: 'text-[#4A7C59]' },
          { label: 'Pending', value: progress.pending, bg: 'bg-yellow-50', color: 'text-yellow-600' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: 'pending', label: 'Pending', count: pendingTasks.length },
          { key: 'completed', label: 'Completed', count: completedTasks.length },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-[#f0f7f4] text-[#4A7C59]' : 'bg-gray-200 text-gray-500'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Task Cards */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A7C59]" /></div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-[#f0f7f4] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-gray-500 font-medium">
            {activeTab === 'pending' ? 'No pending tasks' : 'No completed tasks yet'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {activeTab === 'pending' ? 'Your doctor will assign tasks here' : 'Complete your pending tasks to see them here'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(task => (
            <div key={task.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isOverdue(task.deadline, task.status) ? 'border-red-200' : 'border-gray-100'}`}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[task.type] || typeColors.Other}`}>{task.type}</span>
                      {isOverdue(task.deadline, task.status) && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600">Overdue</span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800">{task.title}</h3>
                    {task.description && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{task.description}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Due: {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-xs text-gray-400 capitalize">{task.frequency}</span>
                      <span className="text-xs text-gray-400">Dr. {task.doctor_name}</span>
                    </div>
                  </div>

                  {task.status === 'completed' && (
                    <div className="w-8 h-8 bg-[#f0f7f4] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {task.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => handleComplete(task.id)}
                      className="flex-1 py-2 bg-[#4A7C59] hover:bg-[#3d6b4a] text-white rounded-xl text-sm font-semibold transition-colors">
                      ✓ Mark as Done
                    </button>
                  </div>
                )}

                {task.status === 'completed' && (
                  <div className="mt-3">
                    {task.difficulty ? (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-500">Your Feedback</span>
                          <span className={`text-xs font-semibold ${task.difficulty === 'Easy' ? 'text-green-600' : task.difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-600'}`}>
                            {task.difficulty}
                          </span>
                        </div>
                        {task.feedback_comment && <p className="text-xs text-gray-600">{task.feedback_comment}</p>}
                      </div>
                    ) : (
                      <button onClick={() => { setFeedbackModal(task); setFeedback({ difficulty: '', comment: '' }); }}
                        className="w-full py-2 border border-[#4A7C59] text-[#4A7C59] hover:bg-[#f0f7f4] rounded-xl text-sm font-medium transition-colors">
                        + Add Feedback
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-800">Task Feedback</h3>
              <button onClick={() => setFeedbackModal(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleFeedback} className="px-6 py-5 space-y-4">
              <p className="text-sm text-gray-600">How difficult was <span className="font-semibold">"{feedbackModal.title}"</span>?</p>
              <div className="grid grid-cols-3 gap-2">
                {['Easy', 'Medium', 'Hard'].map(d => (
                  <button key={d} type="button" onClick={() => setFeedback(f => ({ ...f, difficulty: d }))}
                    className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      feedback.difficulty === d
                        ? d === 'Easy' ? 'border-green-500 bg-green-50 text-green-700'
                          : d === 'Medium' ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}>
                    {d === 'Easy' ? '' : d === 'Medium' ? '' : ''} {d}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Comment (optional)</label>
                <textarea value={feedback.comment} onChange={e => setFeedback(f => ({ ...f, comment: e.target.value }))}
                  placeholder="Share your experience..."
                  rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4A7C59] bg-gray-50 resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setFeedbackModal(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting || !feedback.difficulty}
                  className="flex-1 py-2.5 bg-[#4A7C59] hover:bg-[#3d6b4a] text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientTherapyTasks;
