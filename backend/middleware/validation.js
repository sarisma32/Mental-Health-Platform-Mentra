import { body, validationResult } from 'express-validator';

// Validation middleware to handle errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Patient registration validation
export const validatePatientRegistration = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 3 })
    .withMessage('Full name must be at least 3 characters')
    .matches(/^[a-zA-Z\s\.]+$/)
    .withMessage('Full name should only contain letters, spaces, and periods')
    .custom((value) => {
      const nameParts = value.trim().split(/\s+/);
      if (nameParts.length < 2) {
        throw new Error('Please enter both first and last name');
      }
      if (nameParts.some(part => part.length < 2 && part !== 'Dr.' && part !== 'Mr.' && part !== 'Ms.' && part !== 'Mrs.')) {
        throw new Error('Each name part must be at least 2 characters');
      }
      return true;
    }),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[\d\s\-\(\)]{10,15}$/)
    .withMessage('Please enter a valid phone number (10-15 digits)'),

  body('age')
    .isInt({ min: 13, max: 120 })
    .withMessage('Please enter a valid age between 13 and 120'),

  handleValidationErrors
];

// Doctor registration validation
export const validateDoctorRegistration = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 3 })
    .withMessage('Full name must be at least 3 characters')
    .matches(/^[a-zA-Z\s\.]+$/)
    .withMessage('Full name should only contain letters, spaces, and periods')
    .custom((value) => {
      const nameParts = value.trim().split(/\s+/);
      if (nameParts.length < 2) {
        throw new Error('Please enter both first and last name');
      }
      if (nameParts.some(part => part.length < 2 && part !== 'Dr.' && part !== 'Mr.' && part !== 'Ms.' && part !== 'Mrs.')) {
        throw new Error('Each name part must be at least 2 characters');
      }
      return true;
    }),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[\d\s\-\(\)]{10,15}$/)
    .withMessage('Please enter a valid phone number (10-15 digits)'),

  body('experience')
    .trim()
    .notEmpty()
    .withMessage('Experience is required')
    .matches(/^\d+\s*(years?|months?|yrs?)$/i)
    .withMessage('Please enter experience in format like "5 years" or "2 months"'),

  body('licenseNumber')
    .trim()
    .notEmpty()
    .withMessage('License/Registration number is required')
    .isLength({ min: 3 })
    .withMessage('License number must be at least 3 characters'),

  body('hospitalName')
    .trim()
    .notEmpty()
    .withMessage('Hospital/Clinic name is required')
    .isLength({ min: 2 })
    .withMessage('Hospital/Clinic name must be at least 2 characters'),

  body('specialization')
    .notEmpty()
    .withMessage('Please select a specialization')
    .isIn([
      'Clinical Psychology',
      'Counseling Psychology', 
      'Psychiatry',
      'Marriage & Family Therapy',
      'Addiction Counseling',
      'Child Psychology',
      'Cognitive Behavioral Therapy',
      'Trauma Therapy',
      'Other'
    ])
    .withMessage('Please select a valid specialization'),

  handleValidationErrors
];

// Login validation
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

// Appointment booking validation
export const validateAppointmentBooking = [
  body('patientId')
    .isInt({ min: 1 })
    .withMessage('Valid patient ID is required'),

  body('doctorId')
    .isInt({ min: 1 })
    .withMessage('Valid doctor ID is required'),

  body('appointmentDate')
    .isDate()
    .withMessage('Valid appointment date is required')
    .custom((value) => {
      const appointmentDate = new Date(value);
      const minDate = new Date();
      minDate.setHours(minDate.getHours() + 24);
      minDate.setHours(0, 0, 0, 0); // start of the minimum day

      if (appointmentDate < minDate) {
        throw new Error('Appointments must be booked at least 24 hours in advance');
      }

      // Check if appointment is within next 3 months
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

      if (appointmentDate > threeMonthsFromNow) {
        throw new Error('Appointment date cannot be more than 3 months in advance');
      }

      return true;
    }),

  body('appointmentTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid appointment time is required (HH:MM format)'),

  body('appointmentType')
    .isIn(['initial', 'followup'])
    .withMessage('Appointment type must be either "initial" or "followup"'),

  body('sessionFee')
    .isFloat({ min: 0 })
    .withMessage('Valid session fee is required'),

  body('patientFirstName')
    .trim()
    .notEmpty()
    .withMessage('Patient first name is required')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),

  body('patientLastName')
    .trim()
    .notEmpty()
    .withMessage('Patient last name is required')
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),

  body('patientEmail')
    .trim()
    .notEmpty()
    .withMessage('Patient email is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),

  body('patientPhone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\+?[\d\s\-\(\)]{7,15}$/)
    .withMessage('Please enter a valid phone number'),

  body('doctorName')
    .trim()
    .notEmpty()
    .withMessage('Doctor name is required'),

  body('doctorSpecialization')
    .trim()
    .notEmpty()
    .withMessage('Doctor specialization is required'),

  body('doctorLocation')
    .trim()
    .notEmpty()
    .withMessage('Doctor location is required'),

  body('doctorAddress')
    .trim()
    .notEmpty()
    .withMessage('Doctor address is required'),

  body('doctorPhone')
    .trim()
    .notEmpty()
    .withMessage('Doctor phone is required'),

  handleValidationErrors
];
// Forgot password validation
export const validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  handleValidationErrors
];

// Verify OTP validation
export const validateVerifyOTP = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('otp')
    .trim()
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),

  handleValidationErrors
];

// Reset password validation
export const validateResetPassword = [
  body('resetToken')
    .trim()
    .notEmpty()
    .withMessage('Reset token is required'),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Please confirm your password')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  handleValidationErrors
];