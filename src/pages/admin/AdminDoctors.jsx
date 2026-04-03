import React, { useState } from 'react';

const getStatusBadge = (status) => {
  const styles = { pending: 'bg-yellow-100 text-yellow-800 border-yellow-200', approved: 'bg-green-100 text-green-800 border-green-200', rejected: 'bg-red-100 text-red-800 border-red-200' };
  return <span className={`px-3 py-1 rounded-full text-sm font-medium border ${styles[status] || styles.pending}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
};

const AdminDoctors = ({ doctors, filter, setFilter, searchTerm, setSearchTerm, updateDoctorStatus, formatDate }) => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const filteredDoctors = doctors.filter(doctor => {
    const matchesFilter = filter === 'all' || doctor.approval_status === filter;
    const matchesSearch = doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Doctors', value: doctors.length, sub: 'All registrations', color: 'bg-blue-50', iconColor: 'text-blue-600' },
          { label: 'Pending Approval', value: doctors.filter(d => d.approval_status === 'pending').length, sub: 'Awaiting review', color: 'bg-yellow-50', iconColor: 'text-yellow-600' },
          { label: 'Approved Doctors', value: doctors.filter(d => d.approval_status === 'approved').length, sub: 'Active providers', color: 'bg-green-50', iconColor: 'text-green-600' },
          { label: 'Rejected Doctors', value: doctors.filter(d => d.approval_status === 'rejected').length, sub: 'Declined applications', color: 'bg-red-50', iconColor: 'text-red-600' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-gray-800">{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Doctors</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input type="text" placeholder="Search by name, email, or specialization..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select value={filter} onChange={e => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Doctor Applications</h3>
          <p className="text-sm text-gray-500 mt-1">Click a doctor to view full registration details</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Hospital</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredDoctors.map(doctor => (
                <tr key={doctor.id} onClick={() => setSelectedDoctor(doctor)}
                  className="hover:bg-[#F5F5F0] transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A3B18A] to-[#8FA076] flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">{doctor.full_name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{doctor.full_name}</p>
                        <p className="text-xs text-gray-400">{doctor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><p className="text-sm text-gray-700">{doctor.specialization}</p></td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700">{doctor.hospital_name}</p>
                    <p className="text-xs text-gray-400">{doctor.location || '—'}</p>
                  </td>
                  <td className="px-6 py-4"><p className="text-sm text-gray-500">{new Date(doctor.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p></td>
                  <td className="px-6 py-4">{getStatusBadge(doctor.approval_status)}</td>
                  <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-2">
                      {doctor.approval_status === 'pending' && (<>
                        <button onClick={() => updateDoctorStatus(doctor.id, 'approved')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors">Approve</button>
                        <button onClick={() => updateDoctorStatus(doctor.id, 'rejected')} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors">Reject</button>
                      </>)}
                      {doctor.approval_status === 'approved' && <button onClick={() => updateDoctorStatus(doctor.id, 'rejected')} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors">Revoke</button>}
                      {doctor.approval_status === 'rejected' && <button onClick={() => updateDoctorStatus(doctor.id, 'approved')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors">Approve</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredDoctors.length === 0 && (
          <div className="text-center py-12"><p className="text-sm text-gray-500">{searchTerm || filter !== 'all' ? 'Try adjusting your search or filter criteria.' : 'No doctors have registered yet.'}</p></div>
        )}
      </div>

      {/* Doctor Detail Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-full flex items-center justify-center text-white font-bold text-lg">{selectedDoctor.full_name.charAt(0)}</div>
                <div>
                  <h3 className="font-bold text-gray-900">{selectedDoctor.full_name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">{getStatusBadge(selectedDoctor.approval_status)}<span className="text-xs text-gray-400">{selectedDoctor.specialization}</span></div>
                </div>
              </div>
              <button onClick={() => setSelectedDoctor(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="bg-[#F5F5F0] rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact Information</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Email:</span><span className="font-medium ml-1">{selectedDoctor.email}</span></div>
                  <div><span className="text-gray-500">Phone:</span><span className="font-medium ml-1">{selectedDoctor.phone_number}</span></div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Professional Details</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Specialization:</span><span className="font-medium ml-1">{selectedDoctor.specialization}</span></div>
                  <div><span className="text-gray-500">Experience:</span><span className="font-medium ml-1">{selectedDoctor.experience}</span></div>
                  <div><span className="text-gray-500">License No:</span><span className="font-medium ml-1">{selectedDoctor.license_number}</span></div>
                  <div><span className="text-gray-500">Hospital:</span><span className="font-medium ml-1">{selectedDoctor.hospital_name}</span></div>
                  <div><span className="text-gray-500">Location:</span><span className="font-medium ml-1">{selectedDoctor.location || '—'}</span></div>
                  <div><span className="text-gray-500">Registered:</span><span className="font-medium ml-1">{formatDate(selectedDoctor.created_at)}</span></div>
                </div>
              </div>
              {selectedDoctor.bio && <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bio</p><p className="text-sm text-gray-700 bg-white border border-gray-100 rounded-lg p-3">{selectedDoctor.bio}</p></div>}
              {selectedDoctor.credentials && <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Credentials</p><p className="text-sm text-gray-700 bg-white border border-gray-100 rounded-lg p-3">{selectedDoctor.credentials}</p></div>}
              {selectedDoctor.document_path && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">License Document</p>
                  <a href={`http://localhost:5002/uploads/documents/${selectedDoctor.document_path.split('\\').pop()}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#DCE4D4] text-[#A3B18A] hover:bg-[#A3B18A] hover:text-white rounded-lg text-sm font-medium transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    View Document
                  </a>
                </div>
              )}
              {(selectedDoctor.initial_session_fee || selectedDoctor.followup_session_fee) && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Session Fees</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {selectedDoctor.initial_session_fee && <div><span className="text-gray-500">Initial:</span><span className="font-medium ml-1">Rs {selectedDoctor.initial_session_fee}</span></div>}
                    {selectedDoctor.followup_session_fee && <div><span className="text-gray-500">Follow-up:</span><span className="font-medium ml-1">Rs {selectedDoctor.followup_session_fee}</span></div>}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              {selectedDoctor.approval_status === 'pending' && (<>
                <button onClick={() => { updateDoctorStatus(selectedDoctor.id, 'approved'); setSelectedDoctor(null); }} className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium text-sm transition-colors">Approve</button>
                <button onClick={() => { updateDoctorStatus(selectedDoctor.id, 'rejected'); setSelectedDoctor(null); }} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-colors">Reject</button>
              </>)}
              {selectedDoctor.approval_status === 'approved' && <button onClick={() => { updateDoctorStatus(selectedDoctor.id, 'rejected'); setSelectedDoctor(null); }} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-colors">Revoke Approval</button>}
              {selectedDoctor.approval_status === 'rejected' && <button onClick={() => { updateDoctorStatus(selectedDoctor.id, 'approved'); setSelectedDoctor(null); }} className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium text-sm transition-colors">Approve</button>}
              <button onClick={() => setSelectedDoctor(null)} className="flex-1 py-2.5 bg-[#A3B18A] hover:bg-[#8FA076] text-white rounded-xl font-medium text-sm transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;
