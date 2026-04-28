import express from "express";
import { registerPatient, loginPatient, getPatientProfile, updatePatientProfile, sendEmailVerification, verifyEmailOTP, changePassword, deleteAccount } from "../controllers/patientController.js";
import { validatePatientRegistration, validateLogin } from "../middleware/validation.js";
import { verifyToken, verifyPatient } from "../middleware/auth.js";

const router = express.Router();

// Email verification (before registration)
router.post("/send-verification", sendEmailVerification);
router.post("/verify-email", verifyEmailOTP);

// Public routes
router.post("/register", validatePatientRegistration, registerPatient);

// Protected routes
router.get("/profile", verifyToken, verifyPatient, getPatientProfile);
router.put("/profile", verifyToken, verifyPatient, updatePatientProfile);
router.put("/change-password", verifyToken, verifyPatient, changePassword);
router.delete("/account", verifyToken, verifyPatient, deleteAccount);

export default router;
 
