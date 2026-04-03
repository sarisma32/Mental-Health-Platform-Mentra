import React from 'react';
import { StarRating, SubStarRating } from '../../components/StarRating';

const ratingLabels = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

const PatientReviewModal = ({
  reviewModal, setReviewModal,
  reviewRating, setReviewRating,
  reviewText, setReviewText,
  ratingProfessionalism, setRatingProfessionalism,
  ratingCommunication, setRatingCommunication,
  ratingWaitTime, setRatingWaitTime,
  submittingReview, handleSubmitReview, formatDate,
}) => {
  if (!reviewModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#DCE4D4] rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-[#A3B18A]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Rate Your Experience</h3>
              <p className="text-xs text-gray-500">Your feedback helps other patients</p>
            </div>
          </div>
          <button onClick={() => setReviewModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="bg-[#F5F5F0] rounded-xl p-4 text-sm">
            <p className="font-semibold text-gray-900">Dr. {reviewModal.doctor_name}</p>
            <p className="text-gray-500 mt-0.5">{reviewModal.doctor_specialization} • {formatDate(reviewModal.appointment_date)}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">Overall Rating <span className="text-red-500">*</span></p>
            <StarRating rating={reviewRating} onRate={setReviewRating} size="lg" />
            {reviewRating > 0 && <p className="text-sm text-[#A3B18A] font-medium mt-2">{ratingLabels[reviewRating]}</p>}
          </div>

          <div className="bg-[#F5F5F0] rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-800 mb-4">Detailed Ratings <span className="text-gray-400 font-normal">(Optional)</span></p>
            <div className="grid grid-cols-3 gap-4">
              {[
                ['Professionalism', ratingProfessionalism, setRatingProfessionalism],
                ['Communication', ratingCommunication, setRatingCommunication],
                ['Wait Time', ratingWaitTime, setRatingWaitTime],
              ].map(([label, val, setter]) => (
                <div key={label}>
                  <p className="text-xs font-medium text-gray-600 mb-2">{label}</p>
                  <SubStarRating rating={val} onRate={setter} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Your Review <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} rows={4}
              placeholder="Share your experience..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent resize-none bg-white" />
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={() => setReviewModal(null)} className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSubmitReview} disabled={!reviewRating || submittingReview}
            className="flex-1 px-4 py-3 bg-[#A3B18A] hover:bg-[#8FA076] text-white rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {submittingReview ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientReviewModal;
