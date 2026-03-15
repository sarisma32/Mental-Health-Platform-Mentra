// import express from "express";
// import { loginAdmin } from "../controllers/adminController.js";

// const router = express.Router();

// router.post("/login", loginAdmin);

// export default router;





import express from "express";
import { 
  getAllDoctors,
  getAllPatients,
  updateDoctorStatus,
  updatePatientStatus,
  getDoctorById,
  getAdminStats,
  deleteDoctor,
  getAllAppointments
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

console.log('✅ Admin routes configured:', router.stack.map(r => r.route?.path).filter(Boolean));

export default router;

