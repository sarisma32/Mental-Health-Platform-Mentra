import React from 'react';

const DoctorCompleteSessionModal = ({
  selectedAppointment, sessionNotes, setSessionNotes,
  completingSession, handleCompleteSession, onClose, formatTime,
}) => {
  if (!selectedAppointment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Complete Session</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Patient Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-600">Name:</span> <span className="ml-2 font-medium">{selectedAppointment.patient_first_name} {selectedAppointment.patient_last_name}</span></div>
              <div><span className="text-gray-600">Date:</span> <span className="ml-2 font-medium">{new Date(selectedAppointment.appointment_date).toLocaleDateString()}</span></div>
              <div><span className="text-gray-600">Time:</span> <span className="ml-2 font-medium">{formatTime(selectedAppointment.appointment_time)}</span></div>
              <div><span className="text-gray-600">Type:</span> <span className="ml-2 font-medium">{selectedAppointment.appointment_type}</span></div>
            </div>
            {selectedAppointment.reason_for_visit && (
              <div className="mt-3">
                <span className="text-gray-600 text-sm">Reason for Visit:</span>
                <p className="text-sm text-gray-800 mt-1">{selectedAppointment.reason_for_visit}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Notes <span className="text-red-500">*</span>
            </label>
            <textarea value={sessionNotes} onChange={e => setSessionNotes(e.target.value)} rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A7C59] focus:border-transparent resize-none"
              placeholder="Enter session notes, observations, treatment plan, recommendations, etc..." required />
            <p className="text-xs text-gray-500 mt-2">These notes will be visible to the patient after the session is completed.</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button onClick={onClose} disabled={completingSession}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50">Cancel</button>
            <button onClick={handleCompleteSession} disabled={completingSession || !sessionNotes.trim()}
              className="px-6 py-2 bg-[#4A7C59] hover:bg-[#3d6b4a] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {completingSession ? 'Completing...' : 'Complete Session'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCompleteSessionModal;
