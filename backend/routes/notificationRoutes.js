import express from "express";
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notificationController.js";

const router = express.Router();

// More specific routes first
router.put("/read/:notificationId", markAsRead);
router.put("/:recipientType/:recipientId/read-all", markAllAsRead);
router.get("/:recipientType/:recipientId", getNotifications);

export default router;
