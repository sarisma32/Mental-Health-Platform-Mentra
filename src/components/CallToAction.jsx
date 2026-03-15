import React from 'react';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-mentra-white via-mentra-secondary to-mentra-primary/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Ready to Start Your 
            <span className="text-mentra-primary"> Mental Health Journey?</span>
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            Take the first step toward better mental health. Join thousands who have found peace, 
            clarity, and strength through our platform.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link to="/signup">
            <button className="bg-mentra-primary hover:bg-mentra-primary-hover text-white px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Start Your Journey Today
            </button>
          </Link>
          <Link to="/professionals">
            <button className="border-2 border-mentra-primary text-mentra-primary hover:bg-mentra-primary hover:text-white px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105">
              Meet Our Professionals
            </button>
          </Link>
        </div>
        
        {/* Trust indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-mentra-primary/20">
          <div className="text-center">
            <div className="text-4xl font-bold text-mentra-primary mb-2">10,000+</div>
            <p className="text-gray-700 font-medium">Happy Users</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-mentra-primary mb-2">500+</div>
            <p className="text-gray-700 font-medium">Licensed Professionals</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-mentra-primary mb-2">24/7</div>
            <p className="text-gray-700 font-medium">Support Available</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;