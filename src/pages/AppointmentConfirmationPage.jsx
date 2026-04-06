import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AppointmentConfirmationPage = () => {
  const location = useLocation();
  const { professional, appointmentDetails } = location.state || {};

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!professional || !appointmentDetails) {
    return (
      <div className="min-h-screen bg-mentra-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Appointment Not Found</h1>
          <p className="text-gray-600 mb-8">We couldn't find your appointment details.</p>
          <Link to="/professionals">
            <button className="bg-mentra-primary hover:bg-mentra-primary-hover text-white px-6 py-3 rounded-lg font-semibold">
              Back to Professionals
            </button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const generateConfirmationNumber = () => {
    // Use the confirmation number from the appointment data if available
    if (appointmentDetails && appointmentDetails.confirmationNumber) {
      return appointmentDetails.confirmationNumber;
    }
    // Fallback to generating one (for backward compatibility)
    return 'MEN' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const confirmationNumber = generateConfirmationNumber();

  return (
    <div className="min-h-screen bg-mentra-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Appointment Confirmed!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your appointment has been successfully booked. You will receive a confirmation email shortly with all the details.
          </p>
        </div>

        {/* Confirmation Details */}
        <div id="printable-content" className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-mentra-primary text-white px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Appointment Confirmation</h2>
                <p className="text-mentra-white/80">Confirmation #: {confirmationNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-mentra-white/80">Booked on</p>
                <p className="font-semibold">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* Professional Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Therapist</h3>
                <div className="flex items-start space-x-4">
                  <img 
                    src={professional.image} 
                    alt={professional.name}
                    className="w-16 h-16 rounded-full ring-4 ring-mentra-secondary"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{professional.name}</h4>
                    <p className="text-mentra-primary font-medium">{professional.specialization}</p>
                    <div className="mt-3 space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-mentra-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{professional.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-mentra-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{professional.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h3>
                <div className="space-y-4">
                  <div className="bg-mentra-secondary/30 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 block">Date</span>
                        <span className="font-semibold text-gray-900">{formatDate(appointmentDetails.appointmentDate || appointmentDetails.date)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block">Time</span>
                        <span className="font-semibold text-gray-900">{appointmentDetails.appointmentTime || appointmentDetails.time}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 block">Type</span>
                        <span className="font-semibold text-gray-900">
                          {(appointmentDetails.appointmentType || appointmentDetails.type) === 'initial' ? 'Initial Session' : 'Follow-up Session'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 block">Duration</span>
                        <span className="font-semibold text-gray-900">
                          {(appointmentDetails.appointmentType || appointmentDetails.type) === 'initial' ? '60 minutes' : '50 minutes'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-2xl font-bold text-mentra-primary">
                      {(appointmentDetails.appointmentType || appointmentDetails.type) === 'initial' ? 'Rs 2,500' : 'Rs 2,200'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Patient Information */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-gray-600 block">Name</span>
                  <span className="font-medium text-gray-900">{(appointmentDetails.patientFirstName && appointmentDetails.patientLastName) ? `${appointmentDetails.patientFirstName} ${appointmentDetails.patientLastName}` : `${appointmentDetails.firstName} ${appointmentDetails.lastName}`}</span>
                </div>
                <div>
                  <span className="text-gray-600 block">Email</span>
                  <span className="font-medium text-gray-900">{appointmentDetails.patientEmail || appointmentDetails.email}</span>
                </div>
                <div>
                  <span className="text-gray-600 block">Phone</span>
                  <span className="font-medium text-gray-900">{appointmentDetails.patientPhone || appointmentDetails.phone}</span>
                </div>
                {(appointmentDetails.patientDateOfBirth || appointmentDetails.dateOfBirth) && (
                  <div>
                    <span className="text-gray-600 block">Date of Birth</span>
                    <span className="font-medium text-gray-900">{appointmentDetails.patientDateOfBirth || appointmentDetails.dateOfBirth}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location & Directions */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Directions</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <span className="text-mentra-primary text-xl mt-1">ðŸ“</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{professional.location}</h4>
                    <p className="text-gray-600 mt-1">{professional.address}</p>
                    <div className="mt-3 flex space-x-4 print:hidden">
                      <a 
                        href={`https://maps.google.com/?q=${encodeURIComponent(professional.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-mentra-primary hover:text-mentra-primary-hover font-medium text-sm"
                      >
                        Get Directions â†’
                      </a>
                      <a 
                        href={`tel:${professional.phone}`}
                        className="text-mentra-primary hover:text-mentra-primary-hover font-medium text-sm"
                      >
                        Call Clinic ’
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 print:hidden">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Important Reminders</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">Before Your Appointment:</h4>
              <ul className="space-y-1">
                <li> Arrive 15 minutes early</li>
                <li> Bring a valid photo ID</li>
                <li> Bring insurance card (if applicable)</li>
                <li> Complete intake forms if sent via email</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Cancellation Policy:</h4>
              <ul className="space-y-1">
                <li> 24-hour notice required for cancellations</li>
                <li> $50 fee for no-shows or late cancellations</li>
                <li> Reschedule by calling the clinic directly</li>
                <li> Emergency situations are handled case-by-case</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden">
          <button 
            onClick={() => {
              const printContent = document.getElementById('printable-content');
              const originalContent = document.body.innerHTML;
              document.body.innerHTML = printContent.outerHTML;
              window.print();
              document.body.innerHTML = originalContent;
              window.location.reload(); // Reload to restore event listeners
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
          >
            Print Confirmation
          </button>
          <Link to="/professionals">
            <button className="bg-mentra-primary hover:bg-mentra-primary-hover text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200">
              Book Another Appointment
            </button>
          </Link>
          <Link to="/">
            <button className="border-2 border-mentra-primary text-mentra-primary hover:bg-mentra-primary hover:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200">
              Back to Home
            </button>
          </Link>
        </div>

        {/* Contact Support */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200 print:hidden">
          <p className="text-gray-600 mb-4">
            Need help or have questions about your appointment?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
            <a 
              href="mailto:support@mentra.com" 
              className="text-mentra-primary hover:text-mentra-primary-hover font-medium flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Email Support</span>
            </a>
            <a 
              href="tel:+15551234567" 
              className="text-mentra-primary hover:text-mentra-primary-hover font-medium flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Call (555) 123-4567</span>
            </a>
            <span className="text-gray-500">Available 24/7</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AppointmentConfirmationPage;



