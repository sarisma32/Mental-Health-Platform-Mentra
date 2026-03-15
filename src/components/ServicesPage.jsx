import React, { useEffect } from 'react';
import Header from './Header';
import Breadcrumb from './Breadcrumb';
import CallToAction from './CallToAction';
import Footer from './Footer';
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
      icon: "🤖",
      features: [
        "24/7 availability",
        "Personalized responses",
        "Crisis intervention",
        "Mood tracking",
        "Coping strategies"
      ],
      color: "bg-blue-50 border-blue-200",
      iconBg: "bg-blue-100",
      textColor: "text-blue-800"
    },
    {
      id: 2,
      title: "Professional Therapy Sessions",
      description: "Connect with licensed mental health professionals for one-on-one therapy sessions. Our verified therapists specialize in various areas of mental health care.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      features: [
        "Licensed professionals",
        "Video & audio sessions",
        "Flexible scheduling",
        "Various specializations",
        "Secure platform"
      ],
      color: "bg-green-50 border-green-200",
      iconBg: "bg-green-100",
      textColor: "text-green-800"
    },
    {
      id: 3,
      title: "Depression Support",
      description: "Comprehensive support for managing depression through evidence-based therapeutic approaches, medication management, and ongoing care.",
      icon: "🌱",
      features: [
        "CBT therapy",
        "Medication guidance",
        "Support groups",
        "Progress tracking",
        "Relapse prevention"
      ],
      color: "bg-purple-50 border-purple-200",
      iconBg: "bg-purple-100",
      textColor: "text-purple-800"
    },
    {
      id: 4,
      title: "Anxiety Management",
      description: "Learn effective techniques to manage anxiety disorders, panic attacks, and stress through personalized treatment plans and therapeutic interventions.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      features: [
        "Breathing techniques",
        "Mindfulness training",
        "Exposure therapy",
        "Stress management",
        "Panic attack support"
      ],
      color: "bg-indigo-50 border-indigo-200",
      iconBg: "bg-indigo-100",
      textColor: "text-indigo-800"
    },
    {
      id: 5,
      title: "Sleep Problems",
      description: "Address sleep disorders and improve sleep quality through specialized therapy, sleep hygiene education, and behavioral interventions.",
      icon: "😴",
      features: [
        "Sleep hygiene education",
        "Insomnia treatment",
        "Sleep tracking",
        "Behavioral therapy",
        "Relaxation techniques"
      ],
      color: "bg-teal-50 border-teal-200",
      iconBg: "bg-teal-100",
      textColor: "text-teal-800"
    },
    {
      id: 6,
      title: "Relationship Issues",
      description: "Work through relationship challenges with couples therapy, family counseling, and communication skills training from experienced professionals.",
      icon: "💕",
      features: [
        "Couples therapy",
        "Family counseling",
        "Communication skills",
        "Conflict resolution",
        "Relationship building"
      ],
      color: "bg-pink-50 border-pink-200",
      iconBg: "bg-pink-100",
      textColor: "text-pink-800"
    },
    {
      id: 7,
      title: "Stress Management",
      description: "Develop effective coping strategies for managing work stress, life transitions, and daily pressures through proven therapeutic techniques.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      features: [
        "Stress assessment",
        "Coping strategies",
        "Time management",
        "Work-life balance",
        "Resilience building"
      ],
      color: "bg-orange-50 border-orange-200",
      iconBg: "bg-orange-100",
      textColor: "text-orange-800"
    },
    {
      id: 8,
      title: "Trauma Therapy",
      description: "Specialized trauma-informed care using evidence-based approaches like EMDR and trauma-focused CBT to help process and heal from traumatic experiences.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      features: [
        "EMDR therapy",
        "Trauma-focused CBT",
        "PTSD treatment",
        "Safety planning",
        "Healing support"
      ],
      color: "bg-red-50 border-red-200",
      iconBg: "bg-red-100",
      textColor: "text-red-800"
    }
  ];

  const additionalServices = [
    {
      title: "Crisis Intervention",
      description: "Immediate support during mental health crises",
      icon: "🚨"
    },
    {
      title: "Group Therapy",
      description: "Connect with others facing similar challenges",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      title: "Medication Management",
      description: "Professional guidance on psychiatric medications",
      icon: "💊"
    },
    {
      title: "Wellness Coaching",
      description: "Holistic approach to mental wellness and self-care",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Care for Every Need
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our evidence-based services are designed to support you through every aspect of your mental health journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className={`${service.color} border-2 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group`}
                onClick={() => {
                  // Could add modal or detailed view functionality here
                  console.log(`Clicked on ${service.title}`);
                }}
              >
                <div className={`w-16 h-16 ${service.iconBg} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-3xl">{service.icon}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-mentra-primary transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {service.description}
                </p>
                
                <div className="space-y-2">
                  <h4 className={`font-semibold ${service.textColor} text-sm uppercase tracking-wide`}>
                    Key Features:
                  </h4>
                  <ul className="space-y-1">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 bg-mentra-primary rounded-full mr-2 flex-shrink-0"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Hover indicator */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center text-mentra-primary text-sm font-medium">
                    <span>Learn more</span>
                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Additional Support Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Beyond our core services, we offer specialized support to ensure comprehensive care.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalServices.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-mentra-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{service.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How Mentra Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting started with your mental health journey is simple and secure.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-mentra-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Create Your Account
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Sign up securely and complete a brief assessment to help us understand your needs and match you with the right support.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-mentra-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Choose Your Support
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Access our AI chatbot for immediate support, browse verified therapists, or explore our self-help resources and tools.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-mentra-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Start Your Journey
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Begin your personalized mental health journey with ongoing support, progress tracking, and professional guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CallToAction />

      <Footer />
    </div>
  );
};

export default ServicesPage;