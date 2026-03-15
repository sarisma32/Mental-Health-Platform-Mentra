import express from "express";
import { 
  createAppointment, 
  getPatientAppointments, 
  getDoctorAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  completeSession,
  getDoctorPatients,
  getPatientSessionHistory
} from "../controllers/appointmentController.js";
import { validateAppointmentBooking } from "../middleware/validation.js";
import { verifyToken, verifyPatient, verifyDoctor } from "../middleware/auth.js";

const router = express.Router();

// Public routes (for booking without strict auth - using token from form)
router.post("/book", validateAppointmentBooking, createAppointment);

// Protected routes
router.get("/patient/:patientId", verifyToken, verifyPatient, getPatientAppointments);
router.get("/doctor/:doctorId", verifyToken, verifyDoctor, getDoctorAppointments);
router.get("/:appointmentId", verifyToken, getAppointmentById);
router.put("/:appointmentId/status", verifyToken, updateAppointmentStatus);
router.put("/:appointmentId/complete", verifyToken, verifyDoctor, completeSession);
router.delete("/:appointmentId", verifyToken, cancelAppointment);

// Doctor's patients
router.get("/doctor/:doctorId/patients", verifyToken, verifyDoctor, getDoctorPatients);
router.get("/doctor/:doctorId/patient/:patientId/history", verifyToken, verifyDoctor, getPatientSessionHistory);

export default router;