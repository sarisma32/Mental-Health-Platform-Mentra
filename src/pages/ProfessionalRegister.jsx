import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { buildApiUrl, API_ENDPOINTS } from '../config/api.js';

const ProfessionalRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', phoneNumber: '',
    experience: '', licenseNumber: '', hospitalName: '',
    specialization: '', location: '', document: null, agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [specializations, setSpecializations] = useState([]);
  const [step, setStep] = useState('form'); // 'form' | 'verify'
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    fetch(buildApiUrl('/api/admin/specializations'))
      .then(r => r.json())
      .then(data => { if (data.success) setSpecializations(data.specializations.map(s => s.name)); })
      .catch(() => {});
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    else { const p = formData.fullName.trim().split(/\s+/); if (p.length < 2) newErrors.fullName = 'Enter first and last name'; }
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.experience.trim()) newErrors.experience = 'Experience is required';
    else if (!/^\d+\s*(years?|months?|yrs?)$/i.test(formData.experience.trim())) newErrors.experience = 'e.g. "5 years" or "2 months"';
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    if (!formData.hospitalName.trim()) newErrors.hospitalName = 'Hospital/Clinic name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.specialization) newErrors.specialization = 'Please select a specialization';
    if (!formData.document) newErrors.document = 'Please upload your license/certificate';
    else if (!['application/pdf','image/png','image/jpeg','image/jpg'].includes(formData.document.type)) newErrors.document = 'PDF, PNG or JPG only';
    else if (formData.document.size > 10 * 1024 * 1024) newErrors.document = 'Max 10MB';
    if (!formData.password) newErrors.password = 'Password is required';
    else {
      const errs = [];
      if (formData.password.length < 8) errs.push('8+ chars');
      if (!/[A-Z]/.test(formData.password)) errs.push('uppercase');
      if (!/[a-z]/.test(formData.password)) errs.push('lowercase');
      if (!/\d/.test(formData.password)) errs.push('number');
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) errs.push('special char');
      if (errs.length) newErrors.password = `Needs: ${errs.join(', ')}`;
    }
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'email') { setEmailVerified(false); setStep('form'); }
  };

  const handleSendOtp = async () => {
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email first' })); return;
    }
    setSendingOtp(true);
    
    try {
      const res = await fetch(buildApiUrl('/api/doctors/send-verification'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();
      if (data.success) { setStep('verify'); setOtpError(''); }
      else setErrors(prev => ({ ...prev, email: data.message }));
    } catch { setErrors(prev => ({ ...prev, email: 'Failed to send code.' })); }
    finally { setSendingOtp(false); }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) { setOtpError('Enter the 6-digit code'); return; }
    setVerifyingOtp(true);
    try {
      const res = await fetch(buildApiUrl('/api/doctors/verify-email'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp })
      });
      const data = await res.json();
      if (data.success) { setEmailVerified(true); setStep('form'); setOtpError(''); }
      else setOtpError(data.message || 'Invalid code.');
    } catch { setOtpError('Verification failed.'); }
    finally { setVerifyingOtp(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!emailVerified) {
      setErrors(prev => ({ ...prev, email: 'Please verify your email first' }));
      setIsSubmitting(false); return;
    }
    if (validateForm()) {
      try {
        const fd = new FormData();
        Object.entries(formData).forEach(([k, v]) => { if (k !== 'document' && k !== 'agreeToTerms') fd.append(k, v); });
        if (formData.document) fd.append('document', formData.document);
        const response = await fetch(buildApiUrl(API_ENDPOINTS.DOCTOR_REGISTER), { method: 'POST', body: fd });
        const data = await response.json();
        if (data.success) { localStorage.setItem('pendingDoctor', JSON.stringify(data.doctor)); navigate('/doctor-pending'); }
        else alert(data.message || 'Registration failed.');
      } catch { alert('Registration failed. Please try again.'); }
    }
    setIsSubmitting(false);
  };

  const ic = (field) => `w-full px-4 py-3.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent bg-gray-50 focus:bg-white ${errors[field] ? 'border-red-300' : 'border-gray-200'}`;

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#A3B18A] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-lg">MENTRA</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">Already have an account?</span>
          <Link to="/login" className="bg-[#A3B18A] hover:bg-[#8FA076] text-white px-4 py-2 rounded-lg font-medium transition-colors">Sign in</Link>
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left decorative */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#F5F5F0] items-center justify-center relative overflow-hidden">
          <div className="absolute top-10 right-10 w-64 h-64 bg-[#DCE4D4] rounded-full opacity-60" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#A3B18A]/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#DCE4D4]/40 rounded-full" />
          <div className="relative z-10 text-center px-8">
            <div className="w-20 h-20 bg-[#A3B18A] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Join as a Professional</h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto mb-6">
              Verified professionals only. Your profile will be reviewed within 24â€“72 hours.
            </p>
            <div className="space-y-3 text-left">
              {['Profile reviewed by admin before going live', 'Documents stored securely & confidentially', 'Notified via email once approved'].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#A3B18A] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-500 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-12 py-6 overflow-y-auto">
          <div className="w-full max-w-md">

            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-6 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Register as Professional</h1>
            <p className="text-gray-400 text-sm mb-6">Verified professionals only  admin review required</p>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name + Experience */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="First Last" className={ic('fullName')} />
                  {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience</label>
                  <input type="text" name="experience" value={formData.experience} onChange={handleInputChange} placeholder="e.g. 5 years" className={ic('experience')} />
                  {errors.experience && <p className="mt-1 text-xs text-red-500">{errors.experience}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="flex gap-2">
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                    placeholder="you@example.com" disabled={emailVerified}
                    className={`flex-1 px-4 py-3.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent bg-gray-50 focus:bg-white ${errors.email ? 'border-red-300' : emailVerified ? 'border-green-400 bg-green-50' : 'border-gray-200'}`} />
                  {emailVerified ? (
                    <span className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-xl text-xs font-medium whitespace-nowrap">✓ Verified</span>
                  ) : (
                    <button type="button" onClick={handleSendOtp} disabled={sendingOtp || !formData.email}
                      className="px-4 py-2 bg-[#A3B18A] hover:bg-[#8FA076] text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap">
                      {sendingOtp ? '...' : 'Verify'}
                    </button>
                  )}
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                {step === 'verify' && !emailVerified && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-xs text-blue-700 mb-2">Code sent to <strong>{formData.email}</strong></p>
                    <div className="flex gap-2">
                      <input type="text" value={otp}
                        onChange={e => { setOtp(e.target.value.replace(/\D/g,'').slice(0,6)); setOtpError(''); }}
                        placeholder="6-digit code" maxLength={6}
                        className="flex-1 px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-[#A3B18A] focus:border-transparent text-center tracking-widest font-mono" />
                      <button type="button" onClick={handleVerifyOtp} disabled={verifyingOtp || otp.length !== 6}
                        className="px-4 py-2 bg-[#A3B18A] hover:bg-[#8FA076] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                        {verifyingOtp ? '...' : 'Confirm'}
                      </button>
                    </div>
                    {otpError && <p className="mt-1 text-xs text-red-500">{otpError}</p>}
                    <button type="button" onClick={handleSendOtp} disabled={sendingOtp}
                      className="mt-1 text-xs text-blue-600 hover:underline disabled:opacity-50">
                      Resend code
                    </button>
                  </div>
                )}
              </div>

              {/* License + Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">License Number</label>
                  <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} placeholder="License / Reg. no." className={ic('licenseNumber')} />
                  {errors.licenseNumber && <p className="mt-1 text-xs text-red-500">{errors.licenseNumber}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="Phone number" className={ic('phoneNumber')} />
                  {errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>}
                </div>
              </div>

              {/* Hospital + Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Hospital / Clinic</label>
                  <input type="text" name="hospitalName" value={formData.hospitalName} onChange={handleInputChange} placeholder="Hospital name" className={ic('hospitalName')} />
                  {errors.hospitalName && <p className="mt-1 text-xs text-red-500">{errors.hospitalName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="City, Country" className={ic('location')} />
                  {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
                </div>
              </div>

              {/* Specialization + Password */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Specialization</label>
                  <select name="specialization" value={formData.specialization} onChange={handleInputChange} className={ic('specialization')}>
                    <option value="">Select...</option>
                    {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.specialization && <p className="mt-1 text-xs text-red-500">{errors.specialization}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} placeholder="Create password" className={`${ic('password')} pr-9`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {showPassword ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>}
                      </svg>
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                </div>
              </div>

              {/* Document upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">License / Certificate Document</label>
                <label htmlFor="doc-upload" className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border cursor-pointer transition-all bg-gray-50 hover:bg-white ${errors.document ? 'border-red-300' : 'border-gray-200 hover:border-[#A3B18A]'}`}>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-sm text-gray-500 truncate">{formData.document ? formData.document.name : 'Upload PDF, PNG or JPG (max 10MB)'}</span>
                  <input type="file" id="doc-upload" name="document" onChange={handleInputChange} accept=".pdf,.png,.jpg,.jpeg" className="hidden" />
                </label>
                {errors.document && <p className="mt-1 text-xs text-red-500">{errors.document}</p>}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2">
                <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange} className="mt-0.5 w-4 h-4 text-[#A3B18A] rounded" />
                <label className="text-xs text-gray-500">I agree to the <a href="#" className="text-[#A3B18A] underline">terms</a> & <a href="#" className="text-[#A3B18A] underline">privacy policy</a> and confirm all information is accurate</label>
              </div>
              {errors.agreeToTerms && <p className="text-xs text-red-500">{errors.agreeToTerms}</p>}

              <button type="submit" disabled={isSubmitting || !emailVerified}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${isSubmitting || !emailVerified ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#A3B18A] hover:bg-[#8FA076] text-white'}`}>
                {isSubmitting ? 'Submitting...' : !emailVerified ? 'Verify Email to Continue' : 'Submit Registration'}
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalRegister;


