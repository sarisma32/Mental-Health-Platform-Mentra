import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

import patientRoutes from "./routes/patientRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import therapyRoutes from "./routes/therapyRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import crisisMessageRoutes from "./routes/crisisMessageRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import disputeRoutes from "./routes/disputeRoutes.js";
import chatHistoryRoutes from "./routes/chatHistoryRoutes.js";
import systemReviewRoutes from "./routes/systemReviewRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/therapy', therapyRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/crisis-messages', crisisMessageRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/chat-history', chatHistoryRoutes);
app.use('/api/system-reviews', systemReviewRoutes);
console.log('✓ System review routes mounted at /api/system-reviews');

export default app;
