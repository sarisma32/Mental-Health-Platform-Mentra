import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';
import SystemReviewModal from '../components/SystemReviewModal';
import { buildApiUrl } from '../config/api.js';

const StarRating = ({ rating }) => (
  <div className="flex text-yellow-400">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className={`w-5 h-5 ${i < rating ? 'fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

const MentraLanding = () => {
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const isLoggedIn = !!localStorage.getItem('token');
  const isPatient = localStorage.getItem('userRole') === 'patient';

  useEffect(() => {
    fetch(buildApiUrl('/api/system-reviews/public'))
      .then(r => r.json())
      .then(d => { if (d.success) setReviews(d.reviews); })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-mentra-white">
      <Header />
      <HeroSection />

      {/* Features Section */}
      <section className="py-20 bg-mentra-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your Mental Health, Our Priority
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide comprehensive mental health support with the highest standards of care and privacy
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-mentra-secondary p-8 rounded-2xl text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-mentra-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-mentra-primary/30 transition-colors">
                <svg className="w-10 h-10 text-mentra-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Confidential & Secure</h3>
              <p className="text-gray-600 leading-relaxed">
                Your privacy matters. All conversations and data are protected with end-to-end 
                encryption and strict confidentiality protocols that exceed industry standards.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-mentra-secondary p-8 rounded-2xl text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-mentra-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-mentra-primary/30 transition-colors">
                <svg className="w-12 h-12 text-mentra-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Verified Professionals</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect with licensed psychiatrists, psychologists, and therapists who are 
                thoroughly vetted and qualified to provide expert care tailored to your needs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-mentra-secondary p-8 rounded-2xl text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 bg-mentra-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-mentra-primary/30 transition-colors">
                <svg className="w-12 h-12 text-mentra-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Tailored Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Get personalized recommendations, evidence-based coping strategies, and wellness plans 
                designed specifically for your unique mental health journey and goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Professionals Section */}
      <section className="py-20 bg-gradient-mentra">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Professional and qualified therapists who you can trust
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Our network includes licensed psychiatrists, psychologists, and therapists 
                with years of experience. Each professional is carefully vetted to ensure 
                you receive the highest quality care and support on your mental health journey. 
                We believe in matching you with the right professional who understands your 
                unique needs and cultural background.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-mentra-primary text-xl"></span>
                  <span className="text-gray-700">Licensed and board-certified professionals</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-mentra-primary text-xl"></span>
                  <span className="text-gray-700">Specialized in various mental health areas</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-mentra-primary text-xl"></span>
                  <span className="text-gray-700">Culturally competent and diverse backgrounds</span>
                </div>
              </div>
              <Link to="/professionals">
                <button className="bg-mentra-primary hover:bg-mentra-primary-hover text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Get Matched to a therapist
                </button>
              </Link>
            </div>

            {/* Right - Therapists Grid */}
            <div className="grid grid-cols-3 gap-6 justify-items-center">
              <div className="text-center">
                <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face" alt="Dr. Sarah Johnson" className="w-24 h-24 lg:w-28 lg:h-28 rounded-full object-cover shadow-lg hover:shadow-xl transition-shadow" />
                <p className="text-sm text-gray-600 mt-2">Dr. Sarah J.</p>
              </div>
              <div className="text-center">
                <img src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face" alt="Dr. Michael Chen" className="w-24 h-24 lg:w-28 lg:h-28 rounded-full object-cover shadow-lg hover:shadow-xl transition-shadow" />
                <p className="text-sm text-gray-600 mt-2">Dr. Michael C.</p>
              </div>
              <div className="text-center">
                <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face" alt="Dr. Emily Rodriguez" className="w-24 h-24 lg:w-28 lg:h-28 rounded-full object-cover shadow-lg hover:shadow-xl transition-shadow" />
                <p className="text-sm text-gray-600 mt-2">Dr. Emily R.</p>
              </div>
              <div className="text-center">
                <img src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face" alt="Dr. James Wilson" className="w-24 h-24 lg:w-28 lg:h-28 rounded-full object-cover shadow-lg hover:shadow-xl transition-shadow" />
                <p className="text-sm text-gray-600 mt-2">Dr. James W.</p>
              </div>
              <div className="text-center">
                <img src="https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=150&h=150&fit=crop&crop=face" alt="Dr. Lisa Thompson" className="w-24 h-24 lg:w-28 lg:h-28 rounded-full object-cover shadow-lg hover:shadow-xl transition-shadow" />
                <p className="text-sm text-gray-600 mt-2">Dr. Lisa T.</p>
              </div>
              <div className="text-center">
                <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&h=150&fit=crop&crop=face" alt="Dr. David Kim" className="w-24 h-24 lg:w-28 lg:h-28 rounded-full object-cover shadow-lg hover:shadow-xl transition-shadow" />
                <p className="text-sm text-gray-600 mt-2">Dr. David K.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-mentra-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Stories of Hope</h2>
            <p className="text-xl text-gray-600">Real experiences from people who found their path to better mental health</p>
            {isLoggedIn && isPatient && (
              <button onClick={() => setShowReviewModal(true)}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#4A7C59] hover:bg-[#3d6b4a] text-white rounded-full font-semibold text-sm transition-all shadow-md hover:shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Leave a Review
              </button>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {reviews.map(review => (
                <div key={review.id} className="bg-mentra-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                  <StarRating rating={review.rating} />
                  <p className="text-gray-700 my-5 italic leading-relaxed">"{review.message}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full mr-4 overflow-hidden bg-gradient-to-br from-[#4A7C59] to-[#3d6b4a] flex items-center justify-center flex-shrink-0">
                      {review.profile_photo ? (
                        <img src={review.profile_photo} alt={review.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-lg">{review.full_name?.charAt(0)}</span>
                      )}
                    </div>
                    <span className="text-gray-900 font-semibold">{review.full_name}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              {isLoggedIn && isPatient ? (
                <p className="text-gray-500">Be the first to share your experience with Mentra!</p>
              ) : (
                <p className="text-gray-500">No reviews yet. Login as a patient to share your experience!</p>
              )}
            </div>
          )}
        </div>
      </section>

      {showReviewModal && <SystemReviewModal onClose={() => setShowReviewModal(false)} />}

      <CallToAction />

      <Footer />
    </div>
  );
};

export default MentraLanding;

