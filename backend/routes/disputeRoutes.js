import express from "express";
import {
  submitDispute,
  getPatientDisputes,
  getDoctorDisputes,
  getAllDisputes,
  updateDisputeStatus,
  checkDisputeExists,
  getDoctorWarnings,
  markWarningRead,
} from "../controllers/disputeController.js";

const router = express.Router();

// Patient routes
router.post("/submit", submitDispute);
router.get("/patient/:patientId", getPatientDisputes);
router.get("/check/:appointmentId", checkDisputeExists);

// Doctor routes
router.get("/doctor/:doctorId", getDoctorDisputes);
router.get("/doctor/:doctorId/warnings", getDoctorWarnings);
router.put("/warnings/:warningId/read", markWarningRead);

// Admin routes
router.get("/admin/all", getAllDisputes);
router.put("/admin/:disputeId/status", updateDisputeStatus);

export default router;
