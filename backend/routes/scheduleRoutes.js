import express from "express";
import {
  getDoctorSchedule,
  addScheduleSlot,
  deleteScheduleSlot,
  updateScheduleSlot,
  getAvailableTimeSlots
} from "../controllers/scheduleController.js";
import { verifyToken, verifyDoctor } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/doctor/:doctorId", getDoctorSchedule); // Get doctor's schedule
router.get("/doctor/:doctorId/available", getAvailableTimeSlots); // Get available slots for a specific date

// Protected routes (doctor only)
router.post("/", verifyToken, verifyDoctor, addScheduleSlot); // Add schedule slot
router.put("/:slotId", verifyToken, verifyDoctor, updateScheduleSlot); // Update schedule slot
router.delete("/:slotId", verifyToken, verifyDoctor, deleteScheduleSlot); // Delete schedule slot

export default router;
