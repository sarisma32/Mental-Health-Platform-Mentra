import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { buildApiUrl, API_ENDPOINTS } from '../config/api.js';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [strength, setStrength] = useState({ score: 0, feedback: [] });

  useEffect(() => {
    if (!localStorage.getItem('resetToken')) navigate('/forgot-password');
  }, [navigate]);

  const checkStrength = (pw) => {
    const feedback = [];
    let score = 0;
    if (pw.length >= 8) score++; else feedback.push('8+ characters');
    if (/[a-z]/.test(pw)) score++; else feedback.push('lowercase');
    if (/[A-Z]/.test(pw)) score++; else feedback.push('uppercase');
    if (/\d/.test(pw)) score++; else feedback.push('number');
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pw)) score++; else feedback.push('special character');
    return { score, feedback };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'newPassword') setStrength(checkStrength(value));
  };

  const strengthColor = (s) => s <= 2 ? 'bg-red-400' : s <= 3 ? 'bg-yellow-400' : s <= 4 ? 'bg-blue-400' : 'bg-[#4A7C59]';
  const strengthText = (s) => s <= 2 ? 'Weak' : s <= 3 ? 'Fair' : s <= 4 ? 'Good' : 'Strong';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (strength.score < 5) { setError('Please meet all password requirements'); return; }
    setLoading(true); setMessage(''); setError('');
    try {
      const resetToken = localStorage.getItem('resetToken');
      const response = await fetch(buildApiUrl(API_ENDPOINTS.RESET_PASSWORD), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword: formData.newPassword, confirmPassword: formData.confirmPassword }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage(data.message);
        localStorage.removeItem('resetToken');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const EyeIcon = ({ show, toggle }) => (
    <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {show
          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
          : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
        }
      </svg>
    </button>
  );

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#4A7C59] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-lg">MENTRA</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">Remember your password?</span>
          <Link to="/login" className="bg-[#4A7C59] hover:bg-[#3d6b4a] text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Sign in
          </Link>
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">

        {/* Decorative side — LEFT */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#F5F5F0] items-center justify-center relative overflow-hidden">
          <div className="absolute top-10 right-10 w-64 h-64 bg-[#d0e8dc] rounded-full opacity-60" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#4A7C59]/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#d0e8dc]/40 rounded-full" />
          <div className="relative z-10 text-center px-12">
            <div className="w-20 h-20 bg-[#4A7C59] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Create a new password</h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
              Choose a strong, unique password to keep your account and wellness journey secure.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[{ n: '10K+', l: 'Users' }, { n: '500+', l: 'Therapists' }, { n: '24/7', l: 'Support' }].map(({ n, l }) => (
                <div key={l} className="bg-white rounded-2xl p-4 shadow-sm">
                  <p className="text-lg font-bold text-[#4A7C59]">{n}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form side — RIGHT */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-10">
          <div className="w-full max-w-sm">

            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm mb-8 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <h1 className="text-3xl font-bold text-gray-900 mb-1">Reset password</h1>
            <p className="text-gray-400 text-sm mb-7">Must be different from your previous password</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New password */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">New password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} name="newPassword"
                    value={formData.newPassword} onChange={handleInputChange}
                    placeholder="Enter new password" required disabled={loading}
                    className="w-full px-4 py-3 pr-10 rounded-xl border-2 text-sm outline-none transition-all focus:border-[#4A7C59] border-gray-100 hover:border-gray-200"
                  />
                  <EyeIcon show={showPassword} toggle={() => setShowPassword(!showPassword)} />
                </div>
                {/* Strength bar */}
                {formData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full transition-all ${strengthColor(strength.score)}`}
                          style={{ width: `${(strength.score / 5) * 100}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{strengthText(strength.score)}</span>
                    </div>
                    {strength.feedback.length > 0 && (
                      <p className="text-xs text-gray-400">Needs: {strength.feedback.join(', ')}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Confirm password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                    value={formData.confirmPassword} onChange={handleInputChange}
                    placeholder="Confirm new password" required disabled={loading}
                    className={`w-full px-4 py-3 pr-10 rounded-xl border-2 text-sm outline-none transition-all focus:border-[#4A7C59] ${
                      formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                        ? 'border-red-300' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  />
                  <EyeIcon show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} />
                </div>
                {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                )}
                {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                  <p className="mt-1 text-xs text-[#4A7C59]">✓ Passwords match</p>
                )}
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
                  <div>{message}<p className="text-xs mt-0.5 opacity-75">Redirecting to login...</p></div>
                </div>
              )}

              <button type="submit"
                disabled={loading || strength.score < 5 || formData.newPassword !== formData.confirmPassword}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all mt-1 ${
                  loading || strength.score < 5 || formData.newPassword !== formData.confirmPassword
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#4A7C59] hover:bg-[#3d6b4a] text-white'
                }`}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Resetting...
                  </span>
                ) : 'Reset Password'}
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;


