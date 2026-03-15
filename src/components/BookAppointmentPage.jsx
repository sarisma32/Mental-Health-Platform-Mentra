import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import Breadcrumb from './Breadcrumb';
import Footer from './Footer';
import { buildApiUrl, API_ENDPOINTS } from '../config/api.js';

const BookAppointmentPage = () => {
  const { professionalId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('initial');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    emergencyContact: '',
    emergencyPhone: '',
    reasonForVisit: '',
    previousTherapy: '',
    medications: '',
    specialRequests: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(0); // 0 = current month, 1 = next month, 2 = month after
  const [professional, setProfessional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch doctor data from API
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        const response = await fetch(buildApiUrl(`/api/doctors/${professionalId}`));
        const data = await response.json();
        
        if (data.success) {
          const doctor = data.doctor;
          setProfessional({
            id: doctor.id,
            name: doctor.full_name,
            specialization: doctor.specialization,
            image: doctor.profile_photo 
              ? `http://localhost:5002/${doctor.profile_photo}` 
              : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face",
            location: doctor.hospital_name,
            address: doctor.location || "Location not specified",
            phone: doctor.phone_number || "Contact not available",
            initialPrice: doctor.initial_session_fee || 0,
            followupPrice: doctor.followup_session_fee || 0,
            bio: doctor.bio || "",
            experience: doctor.years_experience || doctor.experience,
            credentials: doctor.credentials || "",
            languages: doctor.languages || ""
          });
        } else {
          alert('Doctor not found');
          navigate('/professionals');
        }
      } catch (error) {
        console.error('Error fetching doctor:', error);
        alert('Failed to load doctor information');
        navigate('/professionals');
      } finally {
        setLoading(false);
      }
    };

    if (professionalId) {
      fetchDoctorData();
    }
  }, [professionalId, navigate]);

  // Generate available months (current + next 2 months)
  const getAvailableMonths = () => {
    const months = [];
    const today = new Date();
    
    for (let i = 0; i < 3; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      months.push({
        name: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        year: date.getFullYear(),
        month: date.getMonth(),
        daysInMonth: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
        firstDayOfWeek: date.getDay()
      });
    }
    return months;
  };

  const availableMonths = getAvailableMonths();
  const currentMonthData = availableMonths[currentMonth];

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    const isCurrentMonth = currentMonth === 0;
    
    // Empty cells for days before month starts
    for (let i = 0; i < currentMonthData.firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= currentMonthData.daysInMonth; day++) {
      const isPastDate = isCurrentMonth && day < today.getDate();
      days.push({
        day,
        isPastDate,
        dateString: `${currentMonthData.year}-${(currentMonthData.month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Fetch available time slots when date is selected
  const fetchAvailableTimeSlots = async (date) => {
    if (!professionalId || !date) return;
    
    try {
      setLoadingSlots(true);
      const response = await fetch(
        buildApiUrl(`${API_ENDPOINTS.AVAILABLE_TIME_SLOTS}/${professionalId}/available?date=${date}`)
      );
      const data = await response.json();
      
      if (data.success) {
        setAvailableTimeSlots(data.availableSlots || []);
      } else {
        setAvailableTimeSlots([]);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Handle date selection
  const handleDateSelect = (dateString) => {
    setSelectedDate(dateString);
    setSelectedTime(''); // Reset selected time
    fetchAvailableTimeSlots(dateString);
  };

  const nextMonth = () => {
    if (currentMonth < 2) {
      setCurrentMonth(currentMonth + 1);
      setSelectedDate(''); // Reset selected date when changing months
      setSelectedTime(''); // Reset selected time
      setAvailableTimeSlots([]); // Clear time slots
    }
  };

  const prevMonth = () => {
    if (currentMonth > 0) {
      setCurrentMonth(currentMonth - 1);
      setSelectedDate(''); // Reset selected date when changing months
      setSelectedTime(''); // Reset selected time
      setAvailableTimeSlots([]); // Clear time slots
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    try {
      // Get current user info
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userRole = localStorage.getItem('userRole');
      
      if (!currentUser.id || userRole !== 'patient') {
        alert('Please log in as a patient to book appointments.');
        setIsSubmitting(false);
        return;
      }

      console.log('Current user:', currentUser); // Debug log

      // Convert time from 12-hour to 24-hour format
      const convertTo24Hour = (time12h) => {
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') {
          hours = '00';
        }
        if (modifier === 'PM') {
          hours = parseInt(hours, 10) + 12;
        }
        return `${hours.toString().padStart(2, '0')}:${minutes}`;
      };

      // Prepare appointment data
      const appointmentData = {
        patientId: currentUser.id,
        doctorId: professional.id,
        appointmentDate: selectedDate,
        appointmentTime: convertTo24Hour(selectedTime),
        appointmentType: appointmentType,
        sessionFee: appointmentType === 'initial' ? professional.initialPrice : professional.followupPrice,
        durationMinutes: appointmentType === 'initial' ? 60 : 50,
        
        // Patient information
        patientFirstName: formData.firstName,
        patientLastName: formData.lastName,
        patientEmail: formData.email,
        patientPhone: formData.phone,
        patientDateOfBirth: formData.dateOfBirth || null,
        emergencyContactName: formData.emergencyContact || null,
        emergencyContactPhone: formData.emergencyPhone || null,
        
        // Session details
        reasonForVisit: formData.reasonForVisit || null,
        previousTherapy: formData.previousTherapy || null,
        currentMedications: formData.medications || null,
        specialRequests: formData.specialRequests || null,
        
        // Professional information
        doctorName: professional.name,
        doctorSpecialization: professional.specialization,
        doctorLocation: professional.location,
        doctorAddress: professional.address,
        doctorPhone: professional.phone
      };

      const response = await fetch(buildApiUrl(API_ENDPOINTS.BOOK_APPOINTMENT), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(appointmentData)
      });

      const data = await response.json();
      console.log('Booking response:', data); // Debug log

      if (data.success) {
        // Navigate to confirmation page with appointment data
        navigate('/appointment-confirmation', {
          state: {
            professional,
            appointmentDetails: {
              ...appointmentData,
              confirmationNumber: data.appointment.confirmation_number,
              id: data.appointment.id,
              status: data.appointment.status,
              createdAt: data.appointment.created_at
            }
          }
        });
      } else {
        // Show detailed error message
        let errorMessage = data.message || 'Failed to book appointment. Please try again.';
        
        if (data.errors && data.errors.length > 0) {
          errorMessage += '\n\nValidation errors:\n';
          data.errors.forEach(error => {
            errorMessage += `• ${error.path}: ${error.msg}\n`;
          });
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Appointment booking error:', error);
      alert('Failed to book appointment. Please check your connection and try again.');
    }
    
    setIsSubmitting(false);
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return selectedDate && selectedTime;
      case 2:
        return formData.firstName && formData.lastName && formData.email && formData.phone;
      case 3:
        return true;
      default:
        return false;
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  if (loading) {
    return (
      <div className="min-h-screen bg-mentra-white">
        <Header />
        <Breadcrumb customTitle="Book Appointment" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mentra-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading doctor information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!professional) {
    return null;
  }

  return (
    <div className="min-h-screen bg-mentra-white">
      <Header />
      <Breadcrumb customTitle="Book Appointment" />
      
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= step 
                    ? 'bg-mentra-primary text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step ? 'text-mentra-primary' : 'text-gray-500'
                  }`}>
                    {step === 1 && 'Select Date & Time'}
                    {step === 2 && 'Personal Information'}
                    {step === 3 && 'Review & Confirm'}
                  </p>
                </div>
                {step < 3 && (
                  <div className={`ml-6 w-16 h-1 ${
                    currentStep > step ? 'bg-mentra-primary' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Professional Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-8">
              <div className="text-center mb-6">
                <img 
                  src={professional.image} 
                  alt={professional.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 ring-4 ring-mentra-secondary object-cover"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-1">{professional.name}</h3>
                <p className="text-mentra-primary font-medium mb-2">{professional.specialization}</p>
                {professional.initialPrice > 0 && (
                  <div className="text-sm text-gray-600">
                    <p>Initial: <span className="font-bold text-gray-900">Rs {professional.initialPrice}</span></p>
                    {professional.followupPrice > 0 && (
                      <p>Follow-up: <span className="font-bold text-gray-900">Rs {professional.followupPrice}</span></p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-mentra-primary mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">{professional.location}</p>
                    <p className="text-gray-600">{professional.address}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-mentra-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <p className="text-gray-700">{professional.phone}</p>
                </div>
                
                {selectedDate && selectedTime && (
                  <div className="mt-6 p-4 bg-mentra-secondary rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Selected Appointment</h4>
                    <p className="text-sm text-gray-700">
                      {formatDate(new Date(selectedDate))}
                    </p>
                    <p className="text-sm text-gray-700">{selectedTime}</p>
                    <p className="text-sm text-mentra-primary font-medium mt-2">
                      {appointmentType === 'initial' ? 'Initial Consultation' : 'Follow-up Session'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              
              {/* Step 1: Date & Time Selection */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Date & Time</h2>
                  <p className="text-gray-600 mb-6">Choose your preferred appointment slot</p>
                  
                  {/* Appointment Type */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Appointment Type
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setAppointmentType('initial')}
                        className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                          appointmentType === 'initial'
                            ? 'border-mentra-primary bg-mentra-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <h4 className="font-semibold text-gray-900">Initial Session</h4>
                        <p className="text-sm text-gray-600 mt-1">First-time therapy session (60 minutes)</p>
                        <p className="text-sm font-medium text-mentra-primary mt-2">
                          {professional.initialPrice > 0 ? `Rs ${professional.initialPrice}` : 'Contact for pricing'}
                        </p>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setAppointmentType('followup')}
                        className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                          appointmentType === 'followup'
                            ? 'border-mentra-primary bg-mentra-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <h4 className="font-semibold text-gray-900">Follow-up Session</h4>
                        <p className="text-sm text-gray-600 mt-1">Regular therapy session (50 minutes)</p>
                        <p className="text-sm font-medium text-mentra-primary mt-2">
                          {professional.followupPrice > 0 ? `Rs ${professional.followupPrice}` : 'Contact for pricing'}
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Date</h3>
                    
                    {/* Calendar Header */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <button 
                          type="button" 
                          onClick={prevMonth}
                          disabled={currentMonth === 0}
                          className={`p-2 rounded transition-colors ${
                            currentMonth === 0 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <h4 className="text-lg font-semibold text-gray-900">{currentMonthData.name}</h4>
                        <button 
                          type="button" 
                          onClick={nextMonth}
                          disabled={currentMonth === 2}
                          className={`p-2 rounded transition-colors ${
                            currentMonth === 2 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                            {day}
                          </div>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((dayData, index) => {
                          if (!dayData) {
                            return <div key={`empty-${index}`} className="p-3"></div>;
                          }
                          
                          const { day, isPastDate, dateString } = dayData;
                          const isSelected = selectedDate === dateString;
                          
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => !isPastDate && handleDateSelect(dateString)}
                              disabled={isPastDate}
                              className={`p-3 text-sm rounded-lg transition-all duration-200 ${
                                isPastDate
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-mentra-primary text-white font-semibold'
                                  : 'hover:bg-mentra-secondary text-gray-700'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Time Selection */}
                  {selectedDate && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Time Slots</h3>
                      
                      {loadingSlots ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mentra-primary mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading available slots...</p>
                        </div>
                      ) : availableTimeSlots.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-gray-600 font-medium">No available slots for this date</p>
                          <p className="text-sm text-gray-500 mt-2">Please select a different date</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {availableTimeSlots.map((slot) => (
                            <button
                              key={slot.time}
                              type="button"
                              onClick={() => setSelectedTime(slot.formatted)}
                              className={`p-3 text-sm rounded-lg border-2 transition-all duration-200 ${
                                selectedTime === slot.formatted
                                  ? 'border-mentra-primary bg-mentra-primary text-white font-semibold'
                                  : 'border-gray-200 hover:border-mentra-primary hover:bg-mentra-primary/5 text-gray-700'
                              }`}
                            >
                              {slot.formatted}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Personal Information */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mentra-primary focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mentra-primary focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mentra-primary focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mentra-primary focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mentra-primary focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact Name
                      </label>
                      <input
                        type="text"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mentra-primary focus:border-transparent"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact Phone
                      </label>
                      <input
                        type="tel"
                        name="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mentra-primary focus:border-transparent"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Visit
                      </label>
                      <textarea
                        name="reasonForVisit"
                        value={formData.reasonForVisit}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mentra-primary focus:border-transparent"
                        placeholder="Please briefly describe what brings you to therapy..."
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Previous Therapy Experience
                      </label>
                      <textarea
                        name="previousTherapy"
                        value={formData.previousTherapy}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mentra-primary focus:border-transparent"
                        placeholder="Have you been in therapy before? If yes, please provide brief details..."
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Medications
                      </label>
                      <textarea
                        name="medications"
                        value={formData.medications}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mentra-primary focus:border-transparent"
                        placeholder="Please list any medications you are currently taking..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Confirm */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Confirm</h2>
                  
                  <div className="space-y-6">
                    {/* Appointment Summary */}
                    <div className="bg-mentra-secondary/30 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Date:</span>
                          <span className="ml-2 font-medium">{formatDate(new Date(selectedDate))}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Time:</span>
                          <span className="ml-2 font-medium">{selectedTime}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Type:</span>
                          <span className="ml-2 font-medium">
                            {appointmentType === 'initial' ? 'Initial Session (60 min)' : 'Follow-up Session (50 min)'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Session Fee:</span>
                          <span className="ml-2 font-semibold text-mentra-primary text-lg">
                            {appointmentType === 'initial' 
                              ? (professional.initialPrice > 0 ? `Rs ${professional.initialPrice}` : 'Contact for pricing')
                              : (professional.followupPrice > 0 ? `Rs ${professional.followupPrice}` : 'Contact for pricing')
                            }
                          </span>
                        </div>
                      </div>
                      
                      {/* Fee Breakdown */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 font-medium">Total Amount:</span>
                          <span className="text-2xl font-bold text-mentra-primary">
                            {appointmentType === 'initial' 
                              ? (professional.initialPrice > 0 ? `Rs ${professional.initialPrice}` : 'Contact for pricing')
                              : (professional.followupPrice > 0 ? `Rs ${professional.followupPrice}` : 'Contact for pricing')
                            }
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Payment will be collected at the clinic during your visit
                        </p>
                      </div>
                    </div>

                    {/* Professional Summary */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Therapist</h3>
                      <div className="flex items-start space-x-4">
                        <img 
                          src={professional.image} 
                          alt={professional.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{professional.name}</h4>
                          <p className="text-mentra-primary text-sm font-medium">{professional.specialization}</p>
                          <div className="mt-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-2 mb-1">
                              <span>📍</span>
                              <span>{professional.location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span>{professional.phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Personal Information Summary */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <span className="ml-2 font-medium">{formData.firstName} {formData.lastName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <span className="ml-2 font-medium">{formData.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Phone:</span>
                          <span className="ml-2 font-medium">{formData.phone}</span>
                        </div>
                        {formData.dateOfBirth && (
                          <div>
                            <span className="text-gray-600">Date of Birth:</span>
                            <span className="ml-2 font-medium">{formData.dateOfBirth}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Special Requests */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Requests or Notes (Optional)
                      </label>
                      <textarea
                        name="specialRequests"
                        value={formData.specialRequests}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mentra-primary focus:border-transparent"
                        placeholder="Any special accommodations or additional information..."
                      />
                    </div>

                    {/* Terms and Conditions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Important Information</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Please arrive 15 minutes early for your appointment</li>
                        <li>• Bring a valid ID and any relevant medical documents</li>
                        <li>• Cancellations must be made 24 hours in advance</li>
                        <li>• Payment is due at the time of service</li>
                        <li>• A Rs 1,000 fee applies for no-shows or late cancellations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    currentStep === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  disabled={currentStep === 1}
                >
                  Previous
                </button>
                
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepValid()}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      isStepValid()
                        ? 'bg-mentra-primary hover:bg-mentra-primary-hover text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      isSubmitting
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-mentra-primary hover:bg-mentra-primary-hover text-white'
                    }`}
                  >
                    {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookAppointmentPage;