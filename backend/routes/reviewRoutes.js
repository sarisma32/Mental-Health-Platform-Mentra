import express from "express";
import {
  submitReview,
  checkReviewExists,
  getReviewsForAdmin,
  updateReviewVisibility,
  deleteReview,
  getDoctorReviews
} from "../controllers/reviewController.js";

const router = express.Router();

// Patient routes
router.post("/submit", submitReview);
router.get("/check/:appointmentId", checkReviewExists);

// Admin routes
router.get("/admin/all", getReviewsForAdmin);
router.put("/admin/:reviewId/visibility", updateReviewVisibility);
router.delete("/admin/:reviewId", deleteReview);

// Doctor routes
router.get("/doctor/:doctorId", getDoctorReviews);

export default router;
