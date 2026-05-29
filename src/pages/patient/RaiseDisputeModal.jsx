import React, { useState } from 'react';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api.js';

const ISSUE_TYPES = [
  'Doctor Did Not Attend Appointment',
  'Wrong Diagnosis / Medical Error',
  'Poor Service Quality',
  'Late Cancellation by Doctor',
  'Doctor No-Show',
  'Unprofessional Behavior',
  'Payment / Billing Issue',
  'Other Issue',
];

const RaiseDisputeModal = ({ appointment, onClose, onSubmitted, formatDate }) => {
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!appointment) return null;

  const handleSubmit = async () => {
    if (!issueType) { setError('Please select an issue type.'); return; }
    if (!description.trim()) { setError('Please provide a description.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(buildApiUrl(API_ENDPOINTS.SUBMIT_DISPUTE), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: appointment.id, issueType, description }),
      });
      const data = await res.json();
      if (data.success) {
        onSubmitted(appointment.id);
        onClose();
      } else {
        setError(data.message || 'Failed to submit dispute.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Raise a Dispute</h3>
              <p className="text-xs text-gray-500">Submit a complaint about this appointment</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Info banner */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex gap-2">
            <svg className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs font-semibold text-orange-800">Submit a dispute if you experienced issues with this appointment</p>
              <p className="text-xs text-orange-700 mt-0.5">Our admin team will review your dispute within 24–48 hours and take appropriate action.</p>
            </div>
          </div>

          {/* Appointment info */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
            <p className="font-semibold text-gray-900">Doctor: {appointment.doctor_name}</p>
            <p className="text-gray-600">Specialty: {appointment.doctor_specialization}</p>
            <p className="text-gray-600">Date: {formatDate(appointment.appointment_date)}</p>
            {appointment.confirmation_number && (
              <p className="text-gray-600">Token: #{appointment.confirmation_number}</p>
            )}
          </div>

          {/* Issue type */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Issue Type <span className="text-red-500">*</span>
            </label>
            <select
              value={issueType}
              onChange={e => setIssueType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white"
            >
              <option value="">Select an issue type</option>
              {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder="Please provide detailed information about your issue..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none bg-white"
            />
            <p className="text-xs text-gray-400 mt-1">Be as specific as possible. This will help our team resolve your dispute faster.</p>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          {/* What happens next */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
              What happens next?
            </p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Your dispute will be reviewed by our admin team</li>
              <li>• We may contact you for additional information</li>
              <li>• You'll receive a status update within 24–48 hours</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Dispute'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RaiseDisputeModal;
