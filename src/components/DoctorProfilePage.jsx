import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { buildApiUrl } from '../config/api.js';

const DoctorProfilePage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [videos, setVideos] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ total_reviews: 0, avg_rating: null });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAll();
  }, [doctorId]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [docRes, vidRes, revRes] = await Promise.all([
        fetch(buildApiUrl(`/api/doctors/${doctorId}`)),
        fetch(buildApiUrl(`/api/doctors/${doctorId}/videos`)),
        fetch(buildApiUrl(`/api/reviews/doctor/${doctorId}`))
      ]);
      const [docData, vidData, revData] = await Promise.all([
        docRes.json(), vidRes.json(), revRes.json()
      ]);
      if (docData.success) setDoctor(docData.doctor);
      if (vidData.success) setVideos(vidData.videos);
      if (revData.success) { setReviews(revData.reviews); setReviewStats(revData.stats); }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (!token || role !== 'patient') {
      alert('Please login as a patient to book an appointment.');
      navigate('/login');
    } else {
      navigate(`/book-appointment/${doctorId}`);
    }
  };

  const renderStars = (rating) => (
    <span className="text-yellow-400">
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
    </span>
  );

  if (loading) return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A3B18A]"></div>
    </div>
  );

  if (!doctor) return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 text-lg">Doctor not found.</p>
        <button onClick={() => navigate('/professionals')} className="mt-4 text-[#A3B18A] underline">Back to Professionals</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <Header />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#A3B18A] to-[#8FA076] py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Photo */}
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl flex-shrink-0">
              {doctor.profile_photo ? (
                <img src={`http://localhost:5002/${doctor.profile_photo}`} alt={doctor.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-white/30 flex items-center justify-center text-white text-4xl font-bold">
                  {doctor.full_name?.charAt(0)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left text-white">
              <h1 className="text-3xl font-bold">Dr. {doctor.full_name}</h1>
              <p className="text-white/90 text-lg mt-1">{doctor.specialization}</p>
              <p className="text-white/70 text-sm mt-1">{doctor.hospital_name} • {doctor.location}</p>

              <div className="flex flex-wrap items-center gap-4 mt-4 justify-center md:justify-start">
                {reviewStats.avg_rating && (
                  <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm">
                    <span className="text-yellow-300">★</span>
                    <span>{reviewStats.avg_rating} ({reviewStats.total_reviews} reviews)</span>
                  </div>
                )}
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm">{doctor.experience}</div>
                {doctor.initial_session_fee && (
                  <div className="bg-white/20 px-3 py-1 rounded-full text-sm">Rs {doctor.initial_session_fee}/session</div>
                )}
              </div>

              <button
                onClick={handleBook}
                className="mt-6 bg-white text-[#A3B18A] hover:bg-[#F5F5F0] font-semibold px-8 py-3 rounded-lg transition-colors shadow-md"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            {[
              { id: 'about', label: 'About' },
              { id: 'videos', label: `Videos (${videos.length})` },
              { id: 'reviews', label: `Reviews (${reviewStats.total_reviews})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#A3B18A] text-[#A3B18A]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {doctor.bio && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
                  <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
                </div>
              )}
              {doctor.credentials && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Credentials</h2>
                  <p className="text-gray-700 whitespace-pre-line">{doctor.credentials}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-[#A3B18A] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="text-gray-700">{doctor.hospital_name}, {doctor.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-[#A3B18A] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-700">{doctor.experience} experience</span>
                  </div>
                  {doctor.initial_session_fee && (
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-[#A3B18A] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span className="text-gray-700">Initial: Rs {doctor.initial_session_fee}</span>
                    </div>
                  )}
                  {doctor.followup_session_fee && (
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-[#A3B18A] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span className="text-gray-700">Follow-up: Rs {doctor.followup_session_fee}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleBook}
                className="w-full bg-[#A3B18A] hover:bg-[#8FA076] text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Book Appointment
              </button>
            </div>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div>
            {videos.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="font-medium">No videos uploaded yet</p>
                <p className="text-sm mt-1">Dr. {doctor.full_name} hasn't uploaded any educational videos yet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {videos.map(v => (
                  <div key={v.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <video
                      src={`http://localhost:5002/${v.video_path}`}
                      controls
                      className="w-full bg-black max-h-52"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900">{v.title}</h3>
                      {v.description && <p className="text-sm text-gray-600 mt-1">{v.description}</p>}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(v.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <p className="font-medium">No reviews yet</p>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-gray-900">{reviewStats.avg_rating}</p>
                    <p className="text-yellow-400 text-2xl mt-1">{'★'.repeat(Math.round(reviewStats.avg_rating))}</p>
                    <p className="text-sm text-gray-500 mt-1">{reviewStats.total_reviews} reviews</p>
                  </div>
                </div>

                {reviews.map(r => (
                  <div key={r.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#A3B18A] to-[#8FA076] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {r.patient_first_name?.charAt(0)}{r.patient_last_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{r.patient_first_name} {r.patient_last_name}</p>
                          <p className="text-xs text-gray-400">{new Date(r.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <span className="text-yellow-400">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    </div>
                    {r.review_text && <p className="mt-3 text-sm text-gray-700">{r.review_text}</p>}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default DoctorProfilePage;
