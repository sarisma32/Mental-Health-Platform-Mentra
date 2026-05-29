import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { buildApiUrl, API_ENDPOINTS } from '../config/api.js';

const ProfessionalsPage = () => {
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [professionals, setProfessionals] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchApprovedDoctors();
    fetchSpecializations();
  }, []);

  const fetchSpecializations = async () => {
    try {
      const res = await fetch(buildApiUrl('/api/admin/specializations'));
      const data = await res.json();
      if (data.success) setSpecializations(data.specializations.map(s => s.name));
    } catch (e) {
      // fallback to empty — filter will still work
    }
  };

  const fetchApprovedDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl(API_ENDPOINTS.DOCTOR_APPROVED));
      const data = await response.json();
      
      if (data.success) {
        // Transform backend data to match frontend format
        const transformedDoctors = data.doctors.map(doctor => ({
          id: doctor.id,
          name: doctor.full_name,
          specialization: doctor.specialization,
          experience: doctor.years_experience ? `${doctor.years_experience} years` : doctor.experience,
          rating: doctor.rating || 0,
          reviews: doctor.review_count || 0,
          image: doctor.profile_photo && doctor.profile_photo.trim() !== ''
            ? (doctor.profile_photo.startsWith('http') ? doctor.profile_photo : `http://localhost:5002/${doctor.profile_photo}`)
            : null,
          bio: doctor.bio || "Experienced mental health professional dedicated to helping clients achieve their wellness goals.",
          credentials: doctor.credentials || "Licensed Professional",
          location: doctor.location || doctor.hospital_name,
          price: doctor.initial_session_fee ? `Rs ${doctor.initial_session_fee}/session` : "Contact for pricing"
        }));
        
        setProfessionals(transformedDoctors);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = (professionalId) => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'patient') {
      // User is not logged in, show modal instead of alert
      setShowLoginModal(true);
    } else {
      // User is logged in, proceed to booking page
      navigate(`/book-appointment/${professionalId}`);
    }
  };

  const filteredProfessionals = professionals.filter(prof => {
    const matchesSpecialization = selectedSpecialization === 'all' || 
      prof.specialization.toLowerCase().includes(selectedSpecialization.toLowerCase());
    const matchesSearch = prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prof.location && prof.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSpecialization && matchesSearch;
  });

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-mentra-white">
      <Header />
      <Breadcrumb customTitle="Professionals" />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-mentra-secondary to-mentra-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Find Your Perfect Therapist
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Connect with licensed, verified mental health professionals for in-person therapy sessions. 
              All our therapists are carefully vetted and committed to providing compassionate, evidence-based care at their clinic locations.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>500+ Licensed Professionals</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>In-Person Sessions</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>Verified Clinic Locations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name, specialization, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mentra-primary focus:border-transparent"
              />
            </div>

            {/* Specialization Filter */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by:</label>
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mentra-primary focus:border-transparent"
              >
                <option value="all">All Specializations</option>
                {specializations.map((spec, index) => (
                  <option key={index} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              {loading ? 'Loading...' : `${filteredProfessionals.length} professionals found`}
            </div>
          </div>
        </div>
      </section>

      {/* Professionals Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                  <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-4"></div>
                  <div className="h-20 bg-gray-300 rounded mb-4"></div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredProfessionals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No professionals found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria or browse all professionals.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSpecialization('all');
                }}
                className="bg-mentra-primary hover:bg-mentra-primary-hover text-white px-6 py-3 rounded-full font-semibold transition-all duration-300"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProfessionals.map((professional) => (
                <div
                  key={professional.id}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                >
                  {/* Professional Image and Basic Info */}
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                      {professional.image ? (
                        <img 
                          src={professional.image} 
                          alt={professional.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-full h-full flex items-center justify-center text-white font-bold text-2xl"
                        style={{
                          background: 'linear-gradient(135deg, #4A7C59 0%, #3d6b4a 100%)',
                          display: professional.image ? 'none' : 'flex'
                        }}
                      >
                        {professional.name?.charAt(0)?.toUpperCase() || 'D'}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{professional.name}</h3>
                    <p className="text-mentra-primary font-medium text-sm mb-3">{professional.specialization}</p>
                  </div>

                  {/* Professional Details */}
                  <div className="space-y-3 mb-6">
                    {/* Hospital/Clinic */}
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-mentra-secondary rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-mentra-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4m0 0v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{professional.location}</span>
                    </div>

                    {/* Rating and Experience */}
                    <div className="flex items-center justify-between pt-2">
                      {/* Rating */}
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-900">{professional.rating}</span>
                          <span className="text-xs text-gray-500 ml-1">({professional.reviews})</span>
                        </div>
                      </div>

                      {/* Experience */}
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{professional.experience}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                      {professional.bio}
                    </p>
                  </div>

                  {/* Session Fee */}
                  <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">Session Fee</span>
                    </div>
                    <span className="text-lg font-bold text-mentra-primary">{professional.price}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button 
                      onClick={() => handleBookSession(professional.id)}
                      className="w-full bg-mentra-primary hover:bg-mentra-primary-hover text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 text-sm"
                    >
                      Book Session
                    </button>
                    <button
                      onClick={() => navigate(`/doctor-profile/${professional.id}`)}
                      className="w-full border border-mentra-primary text-mentra-primary hover:bg-mentra-primary hover:text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 text-sm">
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Login Required</h3>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-mentra-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-mentra-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-gray-700 mb-2">Please login or signup first to book an appointment.</p>
                <p className="text-sm text-gray-500">You need to be logged in as a patient to book sessions with our professionals.</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    navigate('/login');
                  }}
                  className="flex-1 bg-mentra-primary hover:bg-mentra-primary-hover text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    navigate('/register-user');
                  }}
                  className="flex-1 border border-mentra-primary text-mentra-primary hover:bg-mentra-primary hover:text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300"
                >
                  Sign Up
                </button>
              </div>

              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full mt-3 text-gray-500 hover:text-gray-700 py-2 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

     

      <Footer />
    </div>
  );
};

export default ProfessionalsPage;

