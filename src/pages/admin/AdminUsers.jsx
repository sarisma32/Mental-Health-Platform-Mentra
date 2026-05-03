import React, { useState } from 'react';

const AdminUsers = ({ patients, patientSearchTerm, setPatientSearchTerm, userFilter, setUserFilter, updatePatientStatus }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [errorDialog, setErrorDialog] = useState(null);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.full_name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
      (patient.phone_number && patient.phone_number.includes(patientSearchTerm));
    const matchesFilter = userFilter === 'all' || patient.status === userFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Users', value: patients.length, sub: 'Registered patients', color: 'bg-blue-50', iconColor: 'text-blue-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> },
          { label: 'New This Month', value: patients.filter(p => { const c = new Date(p.created_at); const n = new Date(); return c.getMonth() === n.getMonth() && c.getFullYear() === n.getFullYear(); }).length, sub: 'Recent registrations', color: 'bg-green-50', iconColor: 'text-green-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /> },
          { label: 'Active Users', value: patients.filter(p => p.status === 'active').length, sub: 'Currently active', color: 'bg-purple-50', iconColor: 'text-purple-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <svg className={`w-6 h-6 ${card.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">{card.icon}</svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input type="text" placeholder="Search by name, email, or phone..." value={patientSearchTerm}
                onChange={e => setPatientSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select value={userFilter} onChange={e => setUserFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent">
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">User Management</h3>
          <p className="text-sm text-gray-500 mt-1">Click a user to view full details</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPatients.map(patient => (
                <tr key={patient.id} onClick={() => setSelectedPatient(patient)}
                  className="hover:bg-[#F5F5F0] transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-[#4A7C59] to-[#3d6b4a] rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">{patient.full_name.charAt(0).toUpperCase()}</div>
                      <p className="text-sm font-semibold text-gray-900">{patient.full_name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4"><p className="text-sm text-gray-600">{patient.email}</p></td>
                  <td className="px-6 py-4"><p className="text-sm text-gray-500">{new Date(patient.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p></td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      patient.status === 'active' ? 'bg-green-100 text-green-800'
                      : patient.status === 'deleted' ? 'bg-gray-100 text-gray-500'
                      : 'bg-red-100 text-red-800'
                    }`}>
                      {patient.status === 'active' ? 'Active' : patient.status === 'deleted' ? 'Deleted' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                    {patient.status === 'deleted' ? (
                      <span className="px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed">Removed</span>
                    ) : patient.status === 'active' ? (
                      <button onClick={async () => {
                        const result = await updatePatientStatus(patient.id, 'inactive');
                        if (result?.error) setErrorDialog({ message: result.error });
                      }} className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors">Deactivate</button>
                    ) : (
                      <button onClick={async () => {
                        const result = await updatePatientStatus(patient.id, 'active');
                        if (result?.error) setErrorDialog({ message: result.error });
                      }} className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors">Activate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPatients.length === 0 && (
          <div className="text-center py-12"><p className="text-sm text-gray-500">{patientSearchTerm || userFilter !== 'all' ? 'Try adjusting your search or filter criteria.' : 'No users have registered yet.'}</p></div>
        )}
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#4A7C59] to-[#3d6b4a] rounded-full flex items-center justify-center text-white font-bold text-lg">{selectedPatient.full_name.charAt(0).toUpperCase()}</div>
                <div>
                  <h3 className="font-bold text-gray-900">{selectedPatient.full_name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    selectedPatient.status === 'active' ? 'bg-green-100 text-green-800'
                    : selectedPatient.status === 'deleted' ? 'bg-gray-100 text-gray-500'
                    : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedPatient.status === 'active' ? 'Active' : selectedPatient.status === 'deleted' ? 'Deleted' : 'Inactive'}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedPatient(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="bg-[#F5F5F0] rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Account Details</p>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Full Name', value: selectedPatient.full_name },
                    { label: 'Email', value: selectedPatient.email },
                    { label: 'Phone', value: selectedPatient.phone_number || '—' },
                    { label: 'Age', value: selectedPatient.age || '—' },
                    { label: 'Member Since', value: new Date(selectedPatient.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
                    { label: 'User ID', value: `#${selectedPatient.id}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              {selectedPatient.status === 'deleted' ? (
                <div className="flex-1 py-2.5 bg-gray-100 text-gray-400 rounded-xl font-medium text-sm text-center cursor-not-allowed">Account Deleted</div>
              ) : selectedPatient.status === 'active' ? (
                <button onClick={async () => {
                  const result = await updatePatientStatus(selectedPatient.id, 'inactive');
                  if (!result?.error) setSelectedPatient(null);
                  else setErrorDialog({ message: result.error });
                }} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-colors">Deactivate Account</button>
              ) : (
                <button onClick={async () => {
                  const result = await updatePatientStatus(selectedPatient.id, 'active');
                  if (!result?.error) setSelectedPatient(null);
                  else setErrorDialog({ message: result.error });
                }} className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium text-sm transition-colors">Activate Account</button>
              )}
              <button onClick={() => setSelectedPatient(null)} className="flex-1 py-2.5 bg-[#4A7C59] hover:bg-[#3d6b4a] text-white rounded-xl font-medium text-sm transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Error Dialog */}
      {errorDialog && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-800 mb-1">Cannot Deactivate User</h3>
                <p className="text-sm text-gray-600">{errorDialog.message}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorDialog(null)}
              className="w-full py-2.5 bg-[#4A7C59] hover:bg-[#3d6b4a] text-white rounded-xl text-sm font-semibold transition-colors">
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
