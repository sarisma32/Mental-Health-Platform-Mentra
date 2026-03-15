import express from "express";
import { 
  getDoctorDashboardStats, 
  getPatientDashboardStats,
  getDoctorPatients
} from "../controllers/dashboardController.js";
import { verifyToken, verifyDoctor, verifyPatient } from "../middleware/auth.js";

const router = express.Router();

// Doctor dashboard routes
router.get("/doctor/stats", verifyToken, verifyDoctor, getDoctorDashboardStats);
router.get("/doctor/patients", verifyToken, verifyDoctor, getDoctorPatients);

// Patient dashboard routes
router.get("/patient/stats", verifyToken, verifyPatient, getPatientDashboardStats);

export default router;