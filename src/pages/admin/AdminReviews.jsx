import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../config/api.js';

const ratingLabel = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, visible: 0, hidden: 0, avg_rating: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(buildApiUrl('/api/reviews/admin/all'));
      const data = await res.json();
      if (data.success) { setReviews(data.reviews); setStats(data.stats); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, []);

  const toggleVisibility = async (e, reviewId, currentVisibility) => {
    e && e.stopPropagation();
    try {
      const res = await fetch(buildApiUrl(`/api/reviews/admin/${reviewId}/visibility`), {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !currentVisibility })
      });
      const data = await res.json();
      if (data.success) fetchReviews();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (e, reviewId) => {
    e && e.stopPropagation();
    if (!window.confirm('Delete this review? This cannot be undone.')) return;
    try {
      const res = await fetch(buildApiUrl(`/api/reviews/admin/${reviewId}`), { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { fetchReviews(); if (selectedReview?.id === reviewId) setSelectedReview(null); }
    } catch (e) { console.error(e); }
  };

  const filteredReviews = reviews.filter(r => {
    if (filter === 'visible') return r.is_visible;
    if (filter === 'hidden') return !r.is_visible;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reviews', value: stats.total || 0, color: 'bg-[#4A7C59]' },
          { label: 'Approved', value: stats.visible || 0, color: 'bg-green-500' },
          { label: 'Pending/Hidden', value: stats.hidden || 0, color: 'bg-yellow-500' },
          { label: 'Avg Rating', value: stats.avg_rating ? `${stats.avg_rating} ★` : 'N/A', color: 'bg-purple-500' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className={`${card.color} p-3 rounded-lg`}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-2">
        {['all', 'hidden', 'visible'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-[#4A7C59] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f === 'hidden' ? 'Pending Approval' : f === 'visible' ? 'Approved' : 'All'}
          </button>
        ))}
        <button onClick={fetchReviews} className="ml-auto text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh
        </button>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Reviews ({filteredReviews.length})</h3>
        </div>
        {loading ? (
          <div className="text-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4A7C59] mx-auto mb-3"></div></div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><p className="text-sm">No reviews found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Patient', 'Doctor', 'Rating', 'Review', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredReviews.map(review => (
                  <tr key={review.id} className="hover:bg-[#F5F5F0] transition-colors cursor-pointer" onClick={() => setSelectedReview(review)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4A7C59] to-[#3d6b4a] flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                          {review.patient_first_name?.charAt(0)}{review.patient_last_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{review.patient_first_name} {review.patient_last_name}</p>
                          <p className="text-xs text-gray-400">{review.patient_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[#4A7C59]">Dr. {review.doctor_full_name}</p>
                      <p className="text-xs text-gray-400">{review.doctor_specialization}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-yellow-400 text-sm leading-none">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                      <p className="text-xs text-gray-400 mt-1">{review.rating}/5</p>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      {review.review_text ? <p className="text-sm text-gray-600 line-clamp-2">{review.review_text}</p> : <p className="text-xs text-gray-300 italic">No written review</p>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 whitespace-nowrap">{new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${review.is_visible ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {review.is_visible ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button onClick={e => toggleVisibility(e, review.id, review.is_visible)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${review.is_visible ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                          {review.is_visible ? 'Hide' : 'Approve'}
                        </button>
                        <button onClick={e => handleDelete(e, review.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Review Details</h3>
              <button onClick={() => setSelectedReview(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="bg-[#F5F5F0] rounded-xl p-4 text-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">{selectedReview.patient_first_name} {selectedReview.patient_last_name}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  <span className="font-semibold text-[#4A7C59]">Dr. {selectedReview.doctor_full_name}</span>
                </div>
                <p className="text-gray-400 text-xs mt-1">{selectedReview.doctor_specialization} • {new Date(selectedReview.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Overall Rating</p>
                <div className="flex items-center gap-3">
                  <span className="text-yellow-400 text-2xl">{'★'.repeat(selectedReview.rating)}{'☆'.repeat(5 - selectedReview.rating)}</span>
                  <span className="text-lg font-bold text-gray-800">{selectedReview.rating}/5</span>
                  <span className="text-sm text-[#4A7C59] font-medium">{ratingLabel[selectedReview.rating]}</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Detailed Ratings</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Professionalism', value: selectedReview.rating_professionalism },
                    { label: 'Communication', value: selectedReview.rating_communication },
                    { label: 'Wait Time', value: selectedReview.rating_wait_time },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      {value ? (<><p className="text-yellow-400 text-lg leading-none">{'★'.repeat(value)}{'☆'.repeat(5 - value)}</p><p className="text-xs text-gray-500 mt-1">{value}/5</p></>) : <p className="text-xs text-gray-400 mt-2">Not rated</p>}
                    </div>
                  ))}
                </div>
              </div>
              {selectedReview.review_text && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Written Review</p>
                  <p className="text-sm text-gray-700 leading-relaxed bg-white border border-gray-100 rounded-xl p-4">{selectedReview.review_text}</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedReview.is_visible ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {selectedReview.is_visible ? 'Approved & Visible' : 'Pending Approval'}
                </span>
                <div className="flex gap-2">
                  <button onClick={e => { toggleVisibility(e, selectedReview.id, selectedReview.is_visible); setSelectedReview(null); }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${selectedReview.is_visible ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                    {selectedReview.is_visible ? 'Hide' : 'Approve'}
                  </button>
                  <button onClick={e => handleDelete(e, selectedReview.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Delete</button>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <button onClick={() => setSelectedReview(null)} className="w-full py-2.5 bg-[#4A7C59] hover:bg-[#3d6b4a] text-white rounded-xl font-medium text-sm transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
