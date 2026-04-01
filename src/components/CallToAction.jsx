import React from 'react';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <section className="py-14 bg-[#F5F5F0]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <p className="text-[#A3B18A] font-semibold text-xs uppercase tracking-widest mb-2">Take the first step</p>
            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
              Ready to Start Your{' '}
              <span className="text-[#A3B18A]">Mental Health Journey?</span>
            </h2>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link to="/signup">
              <button className="bg-[#A3B18A] hover:bg-[#8FA076] text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm">
                Get Started
              </button>
            </Link>
            <Link to="/professionals">
              <button className="border border-[#A3B18A] text-[#A3B18A] hover:bg-[#A3B18A] hover:text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors">
                Meet Professionals
              </button>
            </Link>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: '10,000+', label: 'Happy Users', desc: 'People who found peace through Mentra', icon: (
              <svg className="w-5 h-5 text-[#A3B18A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )},
            { value: '500+', label: 'Licensed Professionals', desc: 'Verified therapists ready to help you', icon: (
              <svg className="w-5 h-5 text-[#A3B18A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            )},
            { value: '24/7', label: 'Support Available', desc: 'Always here when you need us most', icon: (
              <svg className="w-5 h-5 text-[#A3B18A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )},
          ].map(({ value, label, desc, icon }) => (
            <div key={label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="mb-3">{icon}</div>
              <p className="text-2xl font-bold text-[#A3B18A] mb-0.5">{value}</p>
              <p className="font-semibold text-gray-900 text-sm">{label}</p>
              <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CallToAction;
