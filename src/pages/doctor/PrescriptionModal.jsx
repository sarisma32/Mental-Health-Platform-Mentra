import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../config/api.js';

const emptyMed = () => ({ medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' });

const PrescriptionModal = ({ appointment, onClose, onSaved }) => {
  const [medications, setMedications] = useState([emptyMed()]);
  const [diagnosis, setDiagnosis] = useState('');
  const [therapyAdvice, setTherapyAdvice] = useState('');
  const [lifestyleAdvice, setLifestyleAdvice] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [existing, setExisting] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    // Load existing prescription if any
    const load = async () => {
      try {
        const res = await fetch(buildApiUrl(`/api/prescriptions/appointment/${appointment.id}`), {
          headers: { Authorization: 'Bearer ' + token },
        });
        const data = await res.json();
        if (data.success && data.prescription) {
          setExisting(true);
          setMedications(data.prescription.medications.length
            ? data.prescription.medications.map(m => ({ ...m, instructions: m.instructions || '' }))
            : [emptyMed()]);
          setDiagnosis(data.prescription.diagnosis || '');
          setTherapyAdvice(data.prescription.therapy_advice || '');
          setLifestyleAdvice(data.prescription.lifestyle_advice || '');
          setFollowUpDate(data.prescription.follow_up_date ? data.prescription.follow_up_date.split('T')[0] : '');
        }
      } catch (e) { console.error(e); }
    };
    load();
  }, [appointment.id]);

  const updateMed = (idx, field, value) => {
    setMedications(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  };

  const addMed = () => setMedications(prev => [...prev, emptyMed()]);
  const removeMed = (idx) => setMedications(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) return setMsg({ text: 'Diagnosis is required.', type: 'error' });
    const validMeds = medications.filter(m => m.medicine_name?.trim() && m.dosage?.trim() && m.frequency?.trim() && m.duration?.trim() && m.instructions?.trim());
    if (!validMeds.length) return setMsg({ text: 'Add at least one complete medication with all fields including instructions.', type: 'error' });
    setSaving(true);
    try {
      const res = await fetch(buildApiUrl('/api/prescriptions/save'), {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointment.id,
          medications: validMeds,
          diagnosis, therapyAdvice, lifestyleAdvice, followUpDate: followUpDate || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onSaved && onSaved();
        onClose();
      } else setMsg({ text: data.message, type: 'error' });
    } catch { setMsg({ text: 'Something went wrong.', type: 'error' }); }
    finally { setSaving(false); }
  };

  const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4A7C59] bg-gray-50 focus:bg-white transition-all";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              {existing ? 'Edit Prescription' : 'Add Prescription'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {appointment.patient_first_name} {appointment.patient_last_name} ·{' '}
              {new Date(appointment.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 py-5 space-y-6">

          {msg && (
            <div className={`px-4 py-3 rounded-xl text-sm font-medium border ${msg.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-[#f0f7f4] text-[#4A7C59] border-[#dce8e0]'}`}>
              {msg.text}
            </div>
          )}

          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">🩺 Diagnosis *</label>
            <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
              placeholder="e.g. Generalized Anxiety Disorder, Major Depressive Episode..."
              rows={2} className={inputCls + ' resize-none'} required />
          </div>

          {/* Medications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">💊 Medications</h4>
              <button type="button" onClick={addMed}
                className="flex items-center gap-1 text-xs text-[#4A7C59] hover:text-[#3d6b4a] font-medium border border-[#dce8e0] hover:border-[#4A7C59] px-3 py-1.5 rounded-lg transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Medicine
              </button>
            </div>

            <div className="space-y-4">
              {medications.map((med, idx) => (
                <div key={idx} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500">Medicine #{idx + 1}</span>
                    {medications.length > 1 && (
                      <button type="button" onClick={() => removeMed(idx)}
                        className="text-red-400 hover:text-red-600 text-xs font-medium">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Medicine Name *</label>
                      <input value={med.medicine_name} onChange={e => updateMed(idx, 'medicine_name', e.target.value)}
                        placeholder="e.g. Sertraline" className={inputCls} required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Dosage *</label>
                      <input value={med.dosage} onChange={e => updateMed(idx, 'dosage', e.target.value)}
                        placeholder="e.g. 50mg" className={inputCls} required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Frequency *</label>
                      <input value={med.frequency} onChange={e => updateMed(idx, 'frequency', e.target.value)}
                        placeholder="e.g. Once daily" className={inputCls} required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Duration *</label>
                      <input value={med.duration} onChange={e => updateMed(idx, 'duration', e.target.value)}
                        placeholder="e.g. 30 days" className={inputCls} required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Instructions *</label>
                      <input value={med.instructions} onChange={e => updateMed(idx, 'instructions', e.target.value)}
                        placeholder="e.g. After food" className={inputCls} required />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lifestyle Advice */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">🌿 Lifestyle Suggestions</label>
            <textarea value={lifestyleAdvice} onChange={e => setLifestyleAdvice(e.target.value)}
              placeholder="e.g. Sleep 8 hours, avoid caffeine after 3pm, 30 min walk daily..."
              rows={3} className={inputCls + ' resize-none'} />
          </div>

          {/* Follow-up Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Follow-up Date</label>
            <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={inputCls} />
            <p className="text-xs text-gray-400 mt-1">Optional — when the patient should return for a follow-up</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-[#4A7C59] hover:bg-[#3d6b4a] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : existing ? 'Update Prescription' : 'Save Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionModal;
