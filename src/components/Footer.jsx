import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 py-16 border-t-4 border-mentra-primary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12">
          
          {/* Left Column */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <svg className="w-8 h-8 text-mentra-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                <path d="M12 16L10.91 22.26L2 23L10.91 23.74L12 30L13.09 23.74L22 23L13.09 22.26L12 16Z" opacity="0.6"/>
              </svg>
              <h3 className="text-xl font-bold text-white">MENTRA</h3>
            </div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Empowering individuals to take control of their mental health through 
              accessible, professional, and personalized care.
            </p>
            <p className="text-gray-400 text-sm">
              © 2024 Mentra. All Rights Reserved
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-3 mt-4">
              <a href="#" className="bg-mentra-primary hover:bg-mentra-primary-hover text-white p-3 rounded-full transition-all duration-300 shadow-sm">
                <span className="text-lg">📘</span>
              </a>
              <a href="#" className="bg-mentra-primary hover:bg-mentra-primary-hover text-white p-3 rounded-full transition-all duration-300 shadow-sm">
                <span className="text-lg">🐦</span>
              </a>
              <a href="#" className="bg-mentra-primary hover:bg-mentra-primary-hover text-white p-3 rounded-full transition-all duration-300 shadow-sm">
                <span className="text-lg">📷</span>
              </a>
            </div>
          </div>

          {/* Center Column */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-6 text-white">Company</h3>
            <div className="space-y-4">
              <Link to="/about" className="block text-gray-300 hover:text-mentra-primary transition-colors font-medium">About Us</Link>
              <Link to="/services" className="block text-gray-300 hover:text-mentra-primary transition-colors font-medium">Our Services</Link>
              <Link to="/professionals" className="block text-gray-300 hover:text-mentra-primary transition-colors font-medium">Find Therapists</Link>
              <a href="#contact" className="block text-gray-300 hover:text-mentra-primary transition-colors font-medium">Contact Us</a>
              <a href="#privacy" className="block text-gray-300 hover:text-mentra-primary transition-colors font-medium">Privacy Policy</a>
              <a href="#terms" className="block text-gray-300 hover:text-mentra-primary transition-colors font-medium">Terms of Service</a>
            </div>
          </div>

          {/* Right Column */}
          <div className="text-right">
            <h3 className="text-lg font-semibold mb-6 text-white">Get In Touch</h3>
            <div className="space-y-4">
              <div>
                <p className="text-white font-medium">Phone</p>
                <p className="text-gray-300">+977 9702690848</p>
              </div>
              <div>
                <p className="text-white font-medium">Email</p>
                <p className="text-gray-300">Mentra314@gmail.com</p>
              </div>
              <div>
                <p className="text-white font-medium">Support</p>
                <p className="text-gray-300">24/7 Available</p>
              </div>
              
              {/* Emergency Notice */}
              <div className="bg-red-600 border-2 border-red-500 rounded-lg p-3 mt-6 text-left">
                <p className="text-white text-sm font-medium">
                  🚨 Crisis? Call 988 (Suicide & Crisis Lifeline)
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-600 mt-12 pt-8 text-center">
          <p className="text-gray-300 text-sm font-medium">
            Your mental health matters. Take the first step towards wellness today.
          </p>
          <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-300">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-mentra-primary rounded-full"></span>
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-mentra-primary rounded-full"></span>
              <span>Licensed Professionals</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-mentra-primary rounded-full"></span>
              <span>Secure & Private</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;