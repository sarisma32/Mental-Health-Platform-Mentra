import express from "express";
import {
  createAppointment, 
  getPatientAppointments, 
  getDoctorAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  confirmAppointment,
  completeSession,
  getDoctorPatients,
  getPatientSessionHistory,
  checkReturningPatient
} from "../controllers/appointmentController.js";
import { validateAppointmentBooking } from "../middleware/validation.js";
import { verifyToken, verifyPatient, verifyDoctor } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/book", validateAppointmentBooking, createAppointment);

// Check if patient is returning (before booking)
router.get("/check-returning/:patientId/:doctorId", verifyToken, checkReturningPatient);

// Protected routes
router.get("/patient/:patientId", verifyToken, verifyPatient, getPatientAppointments);
router.get("/doctor/:doctorId", verifyToken, verifyDoctor, getDoctorAppointments);
router.get("/:appointmentId", verifyToken, getAppointmentById);
router.put("/:appointmentId/status", verifyToken, updateAppointmentStatus);
router.put("/:appointmentId/confirm", verifyToken, verifyDoctor, confirmAppointment);
router.put("/:appointmentId/complete", verifyToken, verifyDoctor, completeSession);
router.delete("/:appointmentId", verifyToken, cancelAppointment);

// Doctor's patients
router.get("/doctor/:doctorId/patients", verifyToken, verifyDoctor, getDoctorPatients);
router.get("/doctor/:doctorId/patient/:patientId/history", verifyToken, verifyDoctor, getPatientSessionHistory);

export default router;