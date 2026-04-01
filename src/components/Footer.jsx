import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#2D3B2D] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#A3B18A] rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-wide">MENTRA</span>
            </div>
            <p className="text-[#B8C9A8] text-sm leading-relaxed">
              Your mental health matters. Connect with licensed professionals for compassionate, evidence-based care.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-[#A3B18A] mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm text-[#B8C9A8]">
              <li><Link to="/" className="hover:text-[#A3B18A] transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-[#A3B18A] transition-colors">About Us</Link></li>
              <li><Link to="/services" className="hover:text-[#A3B18A] transition-colors">Services</Link></li>
              <li><Link to="/professionals" className="hover:text-[#A3B18A] transition-colors">Find Therapists</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-[#A3B18A] mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-[#B8C9A8]">
              <li>📧 mentra32@gmail.com</li>
              <li>📞 +977 9702690848</li>
              <li>🕐 Support: 24/7 Available</li>
            </ul>
            <div className="mt-4 bg-red-900/40 border border-red-700/50 rounded-lg px-3 py-2">
              <p className="text-red-300 text-xs">🚨 Crisis? Call <strong>988</strong> — Suicide & Crisis Lifeline</p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#3D4F3D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-[#7A9A7A]">
          <p>© 2026 Mentra. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-[#A3B18A] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#A3B18A] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
