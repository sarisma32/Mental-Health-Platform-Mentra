import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../config/api.js';

const AdminSpecializations = () => {
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [specializationToDelete, setSpecializationToDelete] = useState(null);

  const fetchSpecializations = async () => {
    try {
      setLoading(true);
      const res = await fetch(buildApiUrl('/api/admin/specializations'));
      const data = await res.json();
      if (data.success) setSpecializations(data.specializations);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSpecializations(); }, []);

  const showMsg = (type, msg) => {
    if (type === 'error') setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(buildApiUrl('/api/admin/specializations'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      });
      const data = await res.json();
      if (data.success) { setNewName(''); fetchSpecializations(); showMsg('success', 'Specialization added successfully'); }
      else showMsg('error', data.message || 'Failed to add');
    } catch { showMsg('error', 'Network error'); }
    finally { setAdding(false); }
  };

  const handleEdit = async (id) => {
    if (!editName.trim()) return;
    try {
      const res = await fetch(buildApiUrl(`/api/admin/specializations/${id}`), {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() })
      });
      const data = await res.json();
      if (data.success) { setEditingId(null); setEditName(''); fetchSpecializations(); showMsg('success', 'Specialization updated'); }
      else showMsg('error', data.message || 'Failed to update');
    } catch { showMsg('error', 'Network error'); }
  };

  const handleDelete = async (id, name) => {
    setSpecializationToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (specializationToDelete) {
      try {
        const res = await fetch(buildApiUrl(`/api/admin/specializations/${specializationToDelete.id}`), { method: 'DELETE' });
        const data = await res.json();
        if (data.success) { 
          fetchSpecializations(); 
          showMsg('success', data.message); 
        } else {
          showMsg('error', data.message || 'Failed to delete');
        }
      } catch { 
        showMsg('error', 'Network error'); 
      }
      setShowDeleteModal(false);
      setSpecializationToDelete(null);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Add New Specialization</h3>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Trauma Therapy"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent" />
          <button type="submit" disabled={adding || !newName.trim()}
            className="px-5 py-2 bg-[#4A7C59] text-white rounded-lg text-sm font-medium hover:bg-[#3d6b4a] transition-colors disabled:opacity-50">
            {adding ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">All Specializations ({specializations.length})</h3>
        </div>
        {loading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A7C59] mx-auto"></div></div>
        ) : specializations.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No specializations yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {specializations.map(spec => (
              <li key={spec.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                {editingId === spec.id ? (
                  <div className="flex items-center gap-3 flex-1">
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} autoFocus
                      className="flex-1 px-3 py-1.5 border border-[#4A7C59] rounded-lg text-sm focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent" />
                    <button onClick={() => handleEdit(spec.id)} className="px-3 py-1.5 bg-[#4A7C59] text-white rounded-lg text-xs font-medium hover:bg-[#3d6b4a] transition-colors">Save</button>
                    <button onClick={() => { setEditingId(null); setEditName(''); }} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 bg-[#d0e8dc] rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">{spec.name}</span>
                        {spec.doctor_count > 0 && (
                          <span className="ml-2 text-xs text-gray-400">({spec.doctor_count} doctor{spec.doctor_count !== 1 ? 's' : ''})</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {spec.doctor_count > 0 ? (
                        <span title="Cannot edit — assigned to doctors" className="px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed select-none">Edit</span>
                      ) : (
                        <button onClick={() => { setEditingId(spec.id); setEditName(spec.name); }} className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">Edit</button>
                      )}
                      {spec.doctor_count > 0 ? (
                        <span title="Cannot delete — assigned to doctors" className="px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed select-none">Delete</span>
                      ) : (
                        <button onClick={() => handleDelete(spec.id, spec.name)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Delete</button>
                      )}
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Delete Specialization</h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <p className="text-gray-700 mb-2">
                  Are you sure you want to delete "{specializationToDelete?.name}"?
                </p>
                <p className="text-sm text-gray-500">This action cannot be undone. The specialization will be permanently removed from the system.</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-lg font-semibold transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSpecializations;
