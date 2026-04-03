import React, { useState, useEffect } from 'react';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api.js';

const renderStars = (rating, size = 'text-base') => (
  <span className={`text-yellow-400 ${size}`}>
    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
  </span>
);

const ReviewDetailModal = ({ review, onClose }) => {
  const ratingLabel = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Review Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-full flex items-center justify-center text-white font-bold">
              {review.patient_first_name?.charAt(0)}{review.patient_last_name?.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{review.patient_first_name} {review.patient_last_name}</p>
              <p className="text-xs text-gray-400">
                {new Date(review.appointment_date || review.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="bg-[#F5F5F0] rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Overall Rating</p>
            <div className="flex items-center gap-3">
              {renderStars(review.rating, 'text-2xl')}
              <span className="text-lg font-bold text-gray-800">{review.rating}/5</span>
              <span className="text-sm text-[#A3B18A] font-medium">{ratingLabel[review.rating]}</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Detailed Ratings</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Professionalism', value: review.rating_professionalism },
                { label: 'Communication', value: review.rating_communication },
                { label: 'Wait Time', value: review.rating_wait_time },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  {value ? (
                    <>
                      <p className="text-yellow-400 text-lg leading-none">{'★'.repeat(value)}{'☆'.repeat(5 - value)}</p>
                      <p className="text-xs text-gray-500 mt-1">{value}/5</p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400 mt-2">Not rated</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {review.review_text && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Written Review</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-white border border-gray-100 rounded-xl p-4">{review.review_text}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100">
          <button onClick={onClose}
            className="w-full py-2.5 bg-[#A3B18A] hover:bg-[#8FA076] text-white rounded-xl font-medium text-sm transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
};

const DoctorReviews = ({ doctorId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total_reviews: 0, avg_rating: null });
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(buildApiUrl(`${API_ENDPOINTS.DOCTOR_REVIEWS}/${doctorId}`));
        const data = await res.json();
        if (data.success) { setReviews(data.reviews); setStats(data.stats); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchReviews();
  }, [doctorId]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
          <p className="text-3xl font-bold text-gray-800">{stats.total_reviews || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total Reviews</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
          <p className="text-3xl font-bold text-yellow-500">{stats.avg_rating || '—'}</p>
          <p className="text-sm text-gray-500 mt-1">Average Rating</p>
          {stats.avg_rating && <p className="text-yellow-400 text-lg mt-1">{'★'.repeat(Math.round(stats.avg_rating))}</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Patient Reviews (Approved)</h3>
          <p className="text-xs text-gray-400 mt-1">Click a review to see full details</p>
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A3B18A] mx-auto"></div></div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <p className="text-sm">No approved reviews yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {reviews.map(review => (
              <div key={review.id} onClick={() => setSelectedReview(review)}
                className="px-6 py-4 cursor-pointer hover:bg-[#F5F5F0] transition-colors group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {review.patient_first_name?.charAt(0)}{review.patient_last_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{review.patient_first_name} {review.patient_last_name}</p>
                      <p className="text-xs text-gray-400">{new Date(review.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      {renderStars(review.rating)}
                      <p className="text-xs text-gray-400 mt-0.5">{review.rating}/5</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-[#A3B18A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                {review.review_text && <p className="mt-2 text-sm text-gray-600 line-clamp-1 ml-13">{review.review_text}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedReview && <ReviewDetailModal review={selectedReview} onClose={() => setSelectedReview(null)} />}
    </div>
  );
};

export default DoctorReviews;
