import { useState, useEffect } from 'react';
import { buildApiUrl } from '../config/api.js';

const SystemReviewModal = ({ onClose }) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(buildApiUrl('/api/system-reviews/my'), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.review) setAlreadySubmitted(true); })
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!rating) return setError('Please select a rating.');
    if (!message.trim()) return setError('Please write a short message.');
    setError('');
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(buildApiUrl('/api/system-reviews'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, message }),
      });
      const data = await res.json();
      if (data.success) setDone(true);
      else setError(data.message || 'Failed to submit.');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Share Your Experience</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          {done ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-semibold text-gray-900 mb-1">Thank you for your review!</p>
              <button onClick={onClose} className="mt-5 px-6 py-2.5 bg-[#4A7C59] text-white rounded-xl text-sm font-medium hover:bg-[#3d6b4a] transition-colors">Close</button>
            </div>
          ) : alreadySubmitted ? (
            <div className="text-center py-6">
              <p className="font-semibold text-gray-900 mb-1">You've already submitted a review.</p>
              <p className="text-sm text-gray-500">Thank you for sharing your experience with Mentra.</p>
              <button onClick={onClose} className="mt-5 px-6 py-2.5 bg-[#4A7C59] text-white rounded-xl text-sm font-medium hover:bg-[#3d6b4a] transition-colors">Close</button>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-sm text-gray-600">How has your experience been with Mentra? Your review helps others find the support they need.</p>

              {/* Star rating */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Your Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      className="text-3xl transition-transform hover:scale-110">
                      <span className={(hovered || rating) >= star ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Your Message</p>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="Share how Mentra has helped you..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#4A7C59] focus:ring-1 focus:ring-[#4A7C59] resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-1">{message.length}/500</p>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button onClick={handleSubmit} disabled={submitting}
                className="w-full py-3 bg-[#4A7C59] hover:bg-[#3d6b4a] disabled:bg-gray-200 text-white rounded-xl font-semibold text-sm transition-colors">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemReviewModal;
