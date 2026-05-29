// API Configuration
export const API_BASE_URL = 'http://localhost:5002';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/api/auth/login',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  VERIFY_OTP: '/api/auth/verify-otp',
  RESET_PASSWORD: '/api/auth/reset-password',
  CHECK_DOCTOR_STATUS: '/api/auth/check-doctor-status',
  
  // Patient endpoints
  PATIENT_REGISTER: '/api/patients/register',
  
  // Doctor endpoints
  DOCTOR_REGISTER: '/api/doctors/register',
  DOCTOR_LOGIN: '/api/doctors/login',
  DOCTOR_APPROVED: '/api/doctors/approved',
  DOCTOR_PROFILE: '/api/doctors/profile',
  DOCTOR_PROFILE_INFO: '/api/doctors/profile/info',
  DOCTOR_PROFILE_PHOTO: '/api/doctors/profile/photo',
  
  // Dashboard endpoints
  DOCTOR_STATS: '/api/dashboard/doctor/stats',
  
  // Admin endpoints
  ADMIN_DOCTORS: '/api/admin/doctors',
  ADMIN_DOCTOR_STATUS: '/api/admin/doctors',
  ADMIN_STATS: '/api/admin/stats',
  
  // Appointment endpoints
  BOOK_APPOINTMENT: '/api/appointments/book',
  DOCTOR_APPOINTMENTS: '/api/appointments/doctor',
  PATIENT_APPOINTMENTS: '/api/appointments/patient',
  CANCEL_APPOINTMENT: '/api/appointments',
  UPDATE_APPOINTMENT_STATUS: '/api/appointments',
  COMPLETE_SESSION: '/api/appointments',
  DOCTOR_PATIENTS: '/api/appointments/doctor',
  PATIENT_SESSION_HISTORY: '/api/appointments/doctor',
  
  // Schedule endpoints
  DOCTOR_SCHEDULE: '/api/schedules/doctor',
  ADD_SCHEDULE_SLOT: '/api/schedules',
  UPDATE_SCHEDULE_SLOT: '/api/schedules',
  DELETE_SCHEDULE_SLOT: '/api/schedules',
  AVAILABLE_TIME_SLOTS: '/api/schedules/doctor',

  // Review endpoints
  SUBMIT_REVIEW: '/api/reviews/submit',
  CHECK_REVIEW: '/api/reviews/check',
  ADMIN_REVIEWS: '/api/reviews/admin/all',
  ADMIN_REVIEW_VISIBILITY: '/api/reviews/admin',
  ADMIN_DELETE_REVIEW: '/api/reviews/admin',
  DOCTOR_REVIEWS: '/api/reviews/doctor',

  // Notification endpoints
  NOTIFICATIONS: '/api/notifications',

  // Video endpoints
  DOCTOR_VIDEOS: '/api/doctors',
  UPLOAD_VIDEO: '/api/doctors/videos',
  DELETE_VIDEO: '/api/doctors/videos',

  // Dispute endpoints
  SUBMIT_DISPUTE: '/api/disputes/submit',
  CHECK_DISPUTE: '/api/disputes/check',
  PATIENT_DISPUTES: '/api/disputes/patient',
  DOCTOR_DISPUTES: '/api/disputes/doctor',
  ADMIN_DISPUTES: '/api/disputes/admin/all',
  ADMIN_UPDATE_DISPUTE: '/api/disputes/admin',
  DOCTOR_WARNINGS: '/api/disputes/doctor',
  MARK_WARNING_READ: '/api/disputes/warnings',

  // Therapy Homework endpoints
  THERAPY_ASSIGN: '/api/therapy/assign',
  THERAPY_DOCTOR_TASKS: '/api/therapy/doctor/tasks',
  THERAPY_PATIENT_TASKS: '/api/therapy/patient/tasks',
  THERAPY_COMPLETE: '/api/therapy/patient/tasks',
  THERAPY_FEEDBACK: '/api/therapy/patient/tasks',
  THERAPY_PATIENT_PROGRESS: '/api/therapy/patient/progress',
  THERAPY_DOCTOR_PROGRESS: '/api/therapy/doctor/patient',
};

// Helper function to build full URL
export const buildApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

// Enhanced fetch function with automatic logout on account status errors
export const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    
    // Check for 403 errors with account status
    if (response.status === 403) {
      const data = await response.json();
      
      // Check if it's an account status issue
      if (data.accountStatus) {
        // Clear all auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        localStorage.removeItem('doctor');
        
        // Store the error message for display on login page
        localStorage.setItem('accountStatusError', JSON.stringify({
          message: data.message,
          status: data.accountStatus
        }));
        
        // Redirect to login page
        window.location.href = '/login';
        return null;
      }
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};