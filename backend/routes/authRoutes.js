import express from "express";
import { unifiedLogin, forgotPassword, verifyOTP, resetPassword, checkDoctorStatus } from "../controllers/authController.js";
import { validateLogin, validateForgotPassword, validateVerifyOTP, validateResetPassword } from "../middleware/validation.js";

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  console.log(' Auth test route called');
  res.json({ success: true, message: "Auth routes working" });
});

// Unified login route that checks both patients and doctors tables
router.post("/login", validateLogin, unifiedLogin);

// Forgot password routes
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/verify-otp", validateVerifyOTP, verifyOTP);
router.post("/reset-password", validateResetPassword, resetPassword);

// Check doctor approval status
router.get("/check-doctor-status", checkDoctorStatus);

export default router;