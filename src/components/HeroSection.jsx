import React from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../assets/heroSectionImage.png';

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-20 lg:py-28 bg-gradient-mentra-hero relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-mentra-secondary rounded-full opacity-40 blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-mentra-primary rounded-full opacity-20 blur-xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fadeInUp">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Take Control of your 
                <span className="text-mentra-primary block lg:inline"> Mental Health</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl">
                Your mental health matters. Healing is possible, happiness is real, and you deserve to feel well — 
                one step at a time, with the right support by your side.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => navigate('/professionals')} className="bg-mentra-primary hover:bg-mentra-primary-hover text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Start Your Wellness Journey
              </button>
              <button onClick={() => navigate('/about')} className="border-2 border-mentra-primary text-mentra-primary hover:bg-mentra-primary hover:text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300">
                Learn More
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center space-x-6 pt-4">
              <div className="flex items-center space-x-2">
                <span className="text-mentra-primary text-xl">✓</span>
                <span className="text-sm text-gray-600">HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-mentra-primary text-xl">✓</span>
                <span className="text-sm text-gray-600">Licensed Professionals</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-mentra-primary text-xl">✓</span>
                <span className="text-sm text-gray-600">24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-3xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <img 
                  src={heroImage}
                  alt="Smiling young woman representing mental wellness" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-mentra-secondary rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-mentra-primary rounded-full opacity-40 animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 -left-8 w-16 h-16 bg-mentra-primary rounded-full opacity-30 animate-bounce"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;