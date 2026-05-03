import express from "express";
import { 
  registerDoctor, 
  loginDoctor, 
  getDoctorProfile, 
  updateDoctorProfile, 
  getApprovedDoctors,
  updateDoctorProfileInfo,
  uploadProfilePhoto,
  getDoctorById,
  updateCompleteProfile,
  uploadDoctorVideo,
  getDoctorVideos,
  deleteDoctorVideo,
  sendDoctorEmailVerification,
  verifyDoctorEmailOTP,
  changePassword,
  checkUpcomingAppointments,
  deleteAccount
} from "../controllers/doctorController.js";
import { validateDoctorRegistration, validateLogin } from "../middleware/validation.js";
import { verifyToken, verifyDoctor } from "../middleware/auth.js";
import { uploadDocument, uploadProfileImage, uploadVideo, handleUploadError } from "../middleware/upload.js";



const router = express.Router();

// Email verification (before registration)
router.post("/send-verification", sendDoctorEmailVerification);
router.post("/verify-email", verifyDoctorEmailOTP);

// Public routes
router.post("/register", uploadDocument, handleUploadError, validateDoctorRegistration, registerDoctor);
router.get("/approved", getApprovedDoctors);

// Protected routes
router.get("/profile", verifyToken, verifyDoctor, getDoctorProfile);
router.put("/profile", verifyToken, verifyDoctor, updateDoctorProfile);
router.put("/profile/info", verifyToken, verifyDoctor, updateDoctorProfileInfo);
router.put("/profile/complete", verifyToken, verifyDoctor, updateCompleteProfile);
router.put("/change-password", verifyToken, verifyDoctor, changePassword);
router.get("/check-upcoming", verifyToken, verifyDoctor, checkUpcomingAppointments);
router.delete("/account", verifyToken, verifyDoctor, deleteAccount);
router.post("/profile/photo", verifyToken, verifyDoctor, uploadProfileImage, handleUploadError, uploadProfilePhoto);

// Video routes
router.post("/videos", verifyToken, verifyDoctor, uploadVideo, handleUploadError, uploadDoctorVideo);
router.delete("/videos/:videoId", verifyToken, verifyDoctor, deleteDoctorVideo);
router.get("/:doctorId/videos", getDoctorVideos); // public

// Dynamic routes — MUST be last
router.get("/:doctorId", getDoctorById);

export default router;

