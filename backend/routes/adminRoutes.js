import express from "express";
import { 
  getAllDoctors,
  getAllPatients,
  updateDoctorStatus,
  updatePatientStatus,
  getDoctorById,
  getAdminStats,
  deleteDoctor,
  getAllAppointments,
  getSpecializations,
  createSpecialization,
  updateSpecialization,
  deleteSpecialization,
  warnPatientNoShow
} from "../controllers/adminController.js";

const router = express.Router();

// Simple test route
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Admin routes working" });
});

// Admin routes (temporarily without auth for demo)
router.get("/doctors", getAllDoctors);
router.get("/doctors/:doctorId", getDoctorById);
router.put("/doctors/:doctorId/status", updateDoctorStatus);
router.delete("/doctors/:doctorId", deleteDoctor);
router.get("/users", getAllPatients);
router.put("/users/:patientId/status", updatePatientStatus);
router.get("/stats", getAdminStats);
router.get("/appointments", getAllAppointments);
router.post("/appointments/:appointmentId/warn", warnPatientNoShow);

// Specializations
router.get("/specializations", getSpecializations);
router.post("/specializations", createSpecialization);
router.put("/specializations/:id", updateSpecialization);
router.delete("/specializations/:id", deleteSpecialization);

console.log(' Admin routes configured:', router.stack.map(r => r.route?.path).filter(Boolean));

export default router;

