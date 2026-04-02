import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { buildApiUrl, API_ENDPOINTS } from '../config/api.js';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d{6}$/.test(pasted)) { setOtp(pasted.split('')); inputRefs.current[5]?.focus(); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) { setError('Please enter the complete 6-digit code'); return; }
    setLoading(true); setMessage(''); setError('');
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.VERIFY_OTP), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage(data.message);
        localStorage.setItem('resetToken', data.resetToken);
        setTimeout(() => navigate('/reset-password'), 1500);
      } else {
        setError(data.message || 'Invalid code. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendLoading(true); setMessage(''); setError('');
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.FORGOT_PASSWORD), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) { setMessage('New code sent to your email'); setResendCooldown(60); setOtp(['', '', '', '', '', '']); inputRefs.current[0]?.focus(); }
      else setError(data.message || 'Failed to resend code');
    } catch { setError('Network error. Please try again.'); }
    finally { setResendLoading(false); }
  };

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#A3B18A] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-lg">MENTRA</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">Wrong email?</span>
          <Link to="/forgot-password" className="bg-[#A3B18A] hover:bg-[#8FA076] text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Go back
          </Link>
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">

        {/* Decorative side â€” LEFT */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#F5F5F0] items-center justify-center relative overflow-hidden">
          <div className="absolute top-10 right-10 w-64 h-64 bg-[#DCE4D4] rounded-full opacity-60" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#A3B18A]/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#DCE4D4]/40 rounded-full" />
          <div className="relative z-10 text-center px-12">
            <div className="w-20 h-20 bg-[#A3B18A] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Check your inbox</h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
              We sent a 6-digit code to your email. It expires in 10 minutes for your security.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[{ n: '10K+', l: 'Users' }, { n: '500+', l: 'Therapists' }, { n: '24/7', l: 'Support' }].map(({ n, l }) => (
                <div key={l} className="bg-white rounded-2xl p-4 shadow-sm">
                  <p className="text-lg font-bold text-[#A3B18A]">{n}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form side â€” RIGHT */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-16">
          <div className="w-full max-w-sm">

            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-10 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <h1 className="text-3xl font-bold text-gray-900 mb-1">Verify your email</h1>
            <p className="text-gray-400 text-sm mb-1">Enter the 6-digit code sent to</p>
            <p className="text-[#A3B18A] font-semibold text-sm mb-8 truncate">{email}</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Single OTP input */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Verification code</label>
                <input
                  type="text" inputMode="numeric" maxLength="6"
                  value={otp.join('')}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(val.split('').concat(Array(6 - val.length).fill('')));
                  }}
                  onPaste={handlePaste}
                  disabled={loading}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 rounded-xl border-2 text-sm text-center tracking-[0.5em] font-bold outline-none transition-all focus:border-[#A3B18A] border-gray-100 hover:border-gray-200"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {message}
                </div>
              )}

              <button type="submit" disabled={loading || otp.join('').length !== 6}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${loading || otp.join('').length !== 6 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#A3B18A] hover:bg-[#8FA076] text-white'}`}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Verifying...
                  </span>
                ) : 'Verify Code'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center space-y-2">
              <p className="text-xs text-gray-400">Didn't receive the code?</p>
              <button type="button" onClick={handleResend} disabled={resendLoading || resendCooldown > 0}
                className={`text-sm font-medium transition-colors ${resendLoading || resendCooldown > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-[#A3B18A] hover:text-[#8FA076] hover:underline'}`}>
                {resendLoading ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VerifyOTP;


