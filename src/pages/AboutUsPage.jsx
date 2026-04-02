import React, { useEffect } from 'react';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const AboutUsPage = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const teamMembers = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer",
      specialization: "Clinical Psychology",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face",
      bio: "15+ years in mental health care, specializing in anxiety and depression treatment.",
      credentials: "PhD in Clinical Psychology, Licensed Psychologist"
    },
    {
      name: "Dr. Michael Chen",
      role: "Head of Psychiatry",
      specialization: "Psychiatry & Medication Management",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face",
      bio: "Board-certified psychiatrist with expertise in trauma therapy and PTSD treatment.",
      credentials: "MD Psychiatry, Board Certified"
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Director of Therapy Services",
      specialization: "Marriage & Family Therapy",
      image: "https://images.unsplash.com/photo-1594824388853-d0c2d5e5b6b8?w=300&h=300&fit=crop&crop=face",
      bio: "Specializes in couples counseling and family dynamics with 12 years of experience.",
      credentials: "LMFT, PhD in Family Psychology"
    },
    {
      name: "Dr. James Wilson",
      role: "Research Director",
      specialization: "Behavioral Psychology",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face",
      bio: "Leading research in digital mental health interventions and AI-assisted therapy.",
      credentials: "PhD in Behavioral Psychology"
    }
  ];

  const values = [
    {
      title: "Accessibility",
      description: "Mental health care should be available to everyone, regardless of location, schedule, or financial situation.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-blue-50 border-blue-200"
    },
    {
      title: "Privacy & Security",
      description: "Your mental health journey is deeply personal. We protect your privacy with the highest security standards.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      color: "bg-green-50 border-green-200"
    },
    {
      title: "Evidence-Based Care",
      description: "All our treatments and interventions are grounded in scientific research and proven therapeutic methods.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: "bg-purple-50 border-purple-200"
    },
    {
      title: "Compassionate Support",
      description: "We approach every interaction with empathy, understanding, and genuine care for your wellbeing.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      color: "bg-pink-50 border-pink-200"
    },
    {
      title: "Innovation",
      description: "We leverage cutting-edge technology to make mental health care more effective and accessible.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: "bg-indigo-50 border-indigo-200"
    },
    {
      title: "Holistic Wellness",
      description: "We address mental health as part of overall wellness, considering all aspects of your life.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: "bg-teal-50 border-teal-200"
    }
  ];

  const stats = [
    { number: "10,000+", label: "People Helped", icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ) },
    { number: "500+", label: "Licensed Professionals", icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ) },
    { number: "24/7", label: "Support Available", icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) },
    { number: "98%", label: "Satisfaction Rate", icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ) }
  ];

  const milestones = [
    {
      year: "2020",
      title: "Mentra Founded",
      description: "Started with a vision to make mental health care accessible to everyone through technology."
    },
    {
      year: "2021",
      title: "AI Chatbot Launch",
      description: "Introduced our first AI-powered mental health support chatbot with 24/7 availability."
    },
    {
      year: "2022",
      title: "Professional Network",
      description: "Built a network of 100+ verified mental health professionals across various specializations."
    },
    {
      year: "2023",
      title: "Platform Expansion",
      description: "Expanded services to include group therapy, crisis intervention, and wellness coaching."
    },
    {
      year: "2024",
      title: "Research Partnership",
      description: "Partnered with leading universities to advance digital mental health research."
    },
    {
      year: "2025",
      title: "Global Impact",
      description: "Reached 10,000+ users and expanded our mission to serve communities worldwide."
    }
  ];

  return (
    <div className="min-h-screen bg-mentra-white">
      <Header />
      <Breadcrumb />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-mentra-secondary to-mentra-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              About Mentra
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              We're on a mission to make mental health care accessible, affordable, and effective for everyone. 
              Through innovative technology and compassionate care, we're transforming how people access mental health support.
            </p>
            <div className="flex items-center justify-center space-x-2 text-mentra-primary">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                <path d="M12 16L10.91 22.26L2 23L10.91 23.74L12 30L13.09 23.74L22 23L13.09 22.26L12 16Z" opacity="0.6"/>
              </svg>
              <span className="text-2xl font-bold">Growing minds, nurturing wellness</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                To democratize mental health care by combining cutting-edge technology with human compassion, 
                making professional mental health support accessible to everyone, everywhere, at any time.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We believe that mental health is just as important as physical health, and everyone deserves 
                access to quality care without barriers of cost, location, or stigma.
              </p>
            </div>
            <div className="relative">
              <div className="bg-mentra-secondary rounded-2xl p-8 text-center">
                <div className="w-24 h-24 bg-mentra-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed">
                  A world where mental health support is as accessible as calling a friend, 
                  where technology enhances human connection, and where seeking help is seen as a sign of strength.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These numbers represent real people whose lives have been touched by our mission.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="w-12 h-12 bg-mentra-secondary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-mentra-primary group-hover:text-white transition-all duration-300">{stat.icon}</div>
                <div className="text-3xl font-bold text-mentra-primary mb-2 group-hover:text-mentra-primary-hover transition-colors">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do and every decision we make.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className={`${value.color} border-2 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
                <div className="text-mentra-primary mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From a simple idea to a platform that's changing lives - here's how we got here.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-mentra-secondary hidden lg:block"></div>
            
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  <div className={`w-full lg:w-5/12 ${index % 2 === 0 ? 'lg:pr-8' : 'lg:pl-8'}`}>
                    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 bg-mentra-primary rounded-full flex items-center justify-center text-white font-bold mr-4">
                          {milestone.year.slice(-2)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{milestone.title}</h3>
                          <p className="text-mentra-primary font-medium">{milestone.year}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
                    </div>
                  </div>
                  
                  {/* Timeline dot */}
                  <div className="hidden lg:block w-4 h-4 bg-mentra-primary rounded-full border-4 border-mentra-white shadow-lg"></div>
                  
                  <div className="w-full lg:w-5/12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-mentra-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Mentra?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're not just another mental health platform - we're your partners in wellness.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Expert Team</h3>
              <p className="text-gray-600">Licensed professionals with years of experience in mental health care.</p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">HIPAA Compliant</h3>
              <p className="text-gray-600">Your privacy and data security are our top priorities.</p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Innovative Approach</h3>
              <p className="text-gray-600">Combining technology with human touch for better outcomes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* <CallToAction /> */}

      <Footer />
    </div>
  );
};

export default AboutUsPage;

