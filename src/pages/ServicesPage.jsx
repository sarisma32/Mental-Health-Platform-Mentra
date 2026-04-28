import React, { useEffect } from 'react';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const ServicesPage = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const services = [
    {
      id: 1,
      title: "AI-Powered Chatbot Support",
      description: "Get instant support 24/7 with our intelligent mental health chatbot. Receive personalized guidance, coping strategies, and immediate assistance whenever you need it.",
      icon: (
        <svg className="w-6 h-6 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      id: 2,
      title: "Professional Therapy Sessions",
      description: "Connect with licensed mental health professionals for one-on-one therapy sessions. Our verified therapists specialize in various areas of mental health care.",
      icon: (
        <svg className="w-6 h-6 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 3,
      title: "Depression Support",
      description: "Comprehensive support for managing depression through evidence-based therapeutic approaches, medication management, and ongoing care.",
      icon: (
        <svg className="w-6 h-6 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      id: 4,
      title: "Anxiety Management",
      description: "Learn effective techniques to manage anxiety disorders, panic attacks, and stress through personalized treatment plans and therapeutic interventions.",
      icon: (
        <svg className="w-6 h-6 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      id: 5,
      title: "Sleep Problems",
      description: "Address sleep disorders and improve sleep quality through specialized therapy, sleep hygiene education, and behavioral interventions.",
      icon: (
        <svg className="w-6 h-6 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
    },
    {
      id: 6,
      title: "Relationship Issues",
      description: "Work through relationship challenges with couples therapy, family counseling, and communication skills training from experienced professionals.",
      icon: (
        <svg className="w-6 h-6 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 7,
      title: "Stress Management",
      description: "Develop effective coping strategies for managing work stress, life transitions, and daily pressures through proven therapeutic techniques.",
      icon: (
        <svg className="w-6 h-6 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 8,
      title: "Trauma Therapy",
      description: "Specialized trauma-informed care using evidence-based approaches like EMDR and trauma-focused CBT to help process and heal from traumatic experiences.",
      icon: (
        <svg className="w-6 h-6 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    }
  ];

  const additionalServices = [
    {
      title: "Crisis Intervention",
      description: "Immediate support during mental health crises",
      icon: (
        <svg className="w-5 h-5 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    {
      title: "Group Therapy",
      description: "Connect with others facing similar challenges",
      icon: (
        <svg className="w-5 h-5 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      title: "Medication Management",
      description: "Professional guidance on psychiatric medications",
      icon: (
        <svg className="w-5 h-5 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      title: "Wellness Coaching",
      description: "Holistic approach to mental wellness and self-care",
      icon: (
        <svg className="w-5 h-5 text-[#4A7C59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-mentra-white">
      <Header />
      <Breadcrumb />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-mentra-secondary to-mentra-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Our Mental Health Services
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Comprehensive mental health support tailored to your unique needs. From AI-powered assistance to professional therapy, we're here to support your journey to wellness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <button className="bg-mentra-primary hover:bg-mentra-primary-hover text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Get Started Today
                </button>
              </Link>
              <Link to="/doctor-login">
                <button className="border-2 border-mentra-primary text-mentra-primary hover:bg-mentra-primary hover:text-white px-8 py-4 rounded-full font-semibold transition-all duration-300">
                  Find a Therapist
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Services Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#4A7C59] text-sm font-semibold uppercase tracking-widest mb-2">What We Offer</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Comprehensive Care for Every Need
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Evidence-based services designed to support every aspect of your mental health journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((service) => (
              <div key={service.id}
                className="bg-[#F5F5F0] rounded-2xl p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
                <div className="w-12 h-12 bg-[#d0e8dc] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#4A7C59] transition-colors">
                  {service.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      

      <CallToAction />

      <Footer />
    </div>
  );
};

export default ServicesPage;

