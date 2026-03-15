import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import { buildApiUrl, API_ENDPOINTS } from '../config/api.js';

const ProfessionalRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    experience: '',
    licenseNumber: '',
    hospitalName: '',
    specialization: '',
    location: '',
    document: null,
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [specializations, setSpecializations] = useState([]);

  useEffect(() => {
    fetch(buildApiUrl('/api/admin/specializations'))
      .then(r => r.json())
      .then(data => { if (data.success) setSpecializations(data.specializations.map(s => s.name)); })
      .catch(() => {});
  }, []);

  const validateForm = () => {
    const newErrors = {};

    // Full Name validation - must have at least 2 words (first and last name)
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else {
      const nameParts = formData.fullName.trim().split(/\s+/);
      if (nameParts.length < 2) {
        newErrors.fullName = 'Please enter both first and last name';
      } else if (formData.fullName.trim().length < 3) {
        newErrors.fullName = 'Full name must be at least 3 characters';
      } else if (!/^[a-zA-Z\s\.]+$/.test(formData.fullName.trim())) {
        newErrors.fullName = 'Full name should only contain letters, spaces, and periods';
      } else if (nameParts.some(part => part.length < 2 && part !== 'Dr.' && part !== 'Mr.' && part !== 'Ms.' && part !== 'Mrs.')) {
        newErrors.fullName = 'Each name part must be at least 2 characters';
      }
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number (10-15 digits)';
    }

    // Experience validation
    if (!formData.experience.trim()) {
      newErrors.experience = 'Experience is required';
    } else if (!/^\d+\s*(years?|months?|yrs?)$/i.test(formData.experience.trim())) {
      newErrors.experience = 'Please enter experience in format like "5 years" or "2 months"';
    }

    // License number validation
    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License/Registration number is required';
    } else if (formData.licenseNumber.trim().length < 3) {
      newErrors.licenseNumber = 'License number must be at least 3 characters';
    }

    // Hospital name validation
    if (!formData.hospitalName.trim()) {
      newErrors.hospitalName = 'Hospital/Clinic name is required';
    } else if (formData.hospitalName.trim().length < 2) {
      newErrors.hospitalName = 'Hospital/Clinic name must be at least 2 characters';
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (formData.location.trim().length < 2) {
      newErrors.location = 'Location must be at least 2 characters';
    }

    // Specialization validation
    if (!formData.specialization) {
      newErrors.specialization = 'Please select a specialization';
    }

    // Document validation
    if (!formData.document) {
      newErrors.document = 'Please upload your license/certificate document';
    } else {
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!allowedTypes.includes(formData.document.type)) {
        newErrors.document = 'Please upload a PDF, PNG, or JPG file';
      } else if (formData.document.size > maxSize) {
        newErrors.document = 'File size must be less than 10MB';
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const password = formData.password;
      const passwordErrors = [];
      
      if (password.length < 8) {
        passwordErrors.push('at least 8 characters');
      }
      if (!/[A-Z]/.test(password)) {
        passwordErrors.push('one uppercase letter');
      }
      if (!/[a-z]/.test(password)) {
        passwordErrors.push('one lowercase letter');
      }
      if (!/\d/.test(password)) {
        passwordErrors.push('one number');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        passwordErrors.push('one special character');
      }
      
      if (passwordErrors.length > 0) {
        newErrors.password = `Password must contain ${passwordErrors.join(', ')}`;
      }
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and privacy policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (validateForm()) {
      try {
        // Create FormData for file upload
        const formDataToSend = new FormData();
        formDataToSend.append('fullName', formData.fullName);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('password', formData.password);
        formDataToSend.append('phoneNumber', formData.phoneNumber);
        formDataToSend.append('experience', formData.experience);
        formDataToSend.append('licenseNumber', formData.licenseNumber);
        formDataToSend.append('hospitalName', formData.hospitalName);
        formDataToSend.append('specialization', formData.specialization);
        
        if (formData.document) {
          formDataToSend.append('document', formData.document);
        }

        console.log('Submitting doctor registration with data:', {
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          experience: formData.experience,
          licenseNumber: formData.licenseNumber,
          hospitalName: formData.hospitalName,
          specialization: formData.specialization,
          hasDocument: !!formData.document
        });

        const response = await fetch(buildApiUrl(API_ENDPOINTS.DOCTOR_REGISTER), {
          method: 'POST',
          body: formDataToSend // Don't set Content-Type header for FormData
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (data.success) {
          // Store doctor data temporarily for the pending page
          localStorage.setItem('pendingDoctor', JSON.stringify(data.doctor));
          
          // Redirect to pending status page
          navigate('/doctor-pending');
        } else {
          console.error('Registration failed:', data);
          alert(data.message || 'Registration failed. Please try again.');
        }
      } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please check your connection and try again.');
      }
    } else {
      console.log('Form validation failed:', errors);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-mentra-white">
      {/* Reuse Header Component */}
      <Header />

      {/* Main Content */}
      <div className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-8">
            <button 
              onClick={handleGoBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-mentra-primary transition-colors group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Side - Illustration and Information */}
            <div className="space-y-8">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Your space for healing, growth, and mental well-being.
                </h2>
              </div>

              {/* Professional Illustration */}
              <div className="flex justify-center lg:justify-start">
                <div className="relative">
                  <div className="w-80 h-80 bg-mentra-secondary rounded-3xl flex items-center justify-center overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face" 
                      alt="Mental health professional" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Information Points */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-mentra-primary mt-1">•</span>
                  <p className="text-gray-600">
                    Your profile must be approved before appearing to patients.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-mentra-primary mt-1">•</span>
                  <p className="text-gray-600">
                    We review credentials within 24-72 hours. You'll be notified via email once approved.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-mentra-primary mt-1">•</span>
                  <p className="text-gray-600">
                    Your documents are stored securely and never shared without consent.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Register as a Mental Health Professional
                </h1>
                <p className="text-gray-600">
                  Verified Professionals only. Your profile will be reviewed by Mentra's admin.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name and Experience Row */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your first and last name"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-mentra-primary focus:border-transparent transition-colors ${
                          errors.fullName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                    </div>
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        placeholder="e.g., 5 years, 2 months"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-mentra-primary focus:border-transparent transition-colors ${
                          errors.experience ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                    </div>
                    {errors.experience && (
                      <p className="mt-1 text-sm text-red-600">{errors.experience}</p>
                    )}
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your professional email"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-mentra-primary focus:border-transparent transition-colors ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* License Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Number/ Registration Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your license/registration number"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-mentra-primary focus:border-transparent transition-colors ${
                        errors.licenseNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                  {errors.licenseNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>
                  )}
                </div>

                {/* Password and Phone Number Row */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Create a strong password"
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-mentra-primary focus:border-transparent transition-colors ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                    {/* Password strength indicator */}
                    <div className="mt-2 text-xs text-gray-500">
                      Must contain: 8+ characters, uppercase, lowercase, number, special character
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-mentra-primary focus:border-transparent transition-colors ${
                          errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                    )}
                  </div>
                </div>

                {/* Hospital/Clinic Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hospital/ clinic Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="hospitalName"
                      value={formData.hospitalName}
                      onChange={handleInputChange}
                      placeholder="Enter hospital/clinic name"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-mentra-primary focus:border-transparent transition-colors ${
                        errors.hospitalName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                  {errors.hospitalName && (
                    <p className="mt-1 text-sm text-red-600">{errors.hospitalName}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Enter city or address (e.g., Kathmandu, Nepal)"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-mentra-primary focus:border-transparent transition-colors ${
                        errors.location ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                  )}
                </div>

                {/* Specialization */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization
                  </label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-mentra-primary focus:border-transparent transition-colors ${
                      errors.specialization ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select your specialization</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                  {errors.specialization && (
                    <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>
                  )}
                </div>

                {/* Document Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Document(License/ Certificate)
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-mentra-primary transition-colors ${
                    errors.document ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    <input
                      type="file"
                      name="document"
                      onChange={handleInputChange}
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      id="document-upload"
                      required
                    />
                    <label htmlFor="document-upload" className="cursor-pointer">
                      <div className="space-y-2">
                        <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-600">
                          {formData.document ? formData.document.name : 'Click to upload'}<br />
                          PDF, PNG or JPG (max 10MB)
                        </p>
                      </div>
                    </label>
                  </div>
                  {errors.document && (
                    <p className="mt-1 text-sm text-red-600">{errors.document}</p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className={`w-4 h-4 text-mentra-primary border-gray-300 rounded focus:ring-mentra-primary mt-1 ${
                      errors.agreeToTerms ? 'border-red-500' : ''
                    }`}
                    required
                  />
                  <div>
                    <label className="text-sm text-gray-600">
                      I agree to terms & Privacy policy and confirm that all information provided is accurate
                    </label>
                    {errors.agreeToTerms && (
                      <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-full font-semibold transition-all duration-300 transform shadow-lg ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-mentra-primary hover:bg-mentra-primary-hover text-white hover:scale-105'
                  }`}
                >
                  {isSubmitting ? 'Submitting for verification...' : 'Submit for verification'}
                </button>

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-gray-600">
                    Already have an Account? 
                    <Link to="/login" className="text-mentra-primary hover:text-mentra-primary-hover ml-1 underline font-medium">
                      Login
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalRegister;