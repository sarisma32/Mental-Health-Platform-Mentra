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
import dashboardRoutes from "./routes/dashboardRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import therapyRoutes from "./routes/therapyRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import crisisMessageRoutes from "./routes/crisisMessageRoutes.js";
import disputeRoutes from "./routes/disputeRoutes.js";
import chatHistoryRoutes from "./routes/chatHistoryRoutes.js";
import systemReviewRoutes from "./routes/systemReviewRoutes.js";
import { testConnection, initializeDatabase } from "./db/init.js";
import { startAppointmentScheduler } from "./utils/appointmentScheduler.js";
import addSampleData from "./add-sample-data.js";


// ES6 module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests from any localhost port or no origin (like mobile apps or curl)
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});//print every request in terminal

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));//Allows access to uploaded files like: http://localhost:5002/uploads/photo.jpg



// Routes
console.log(' Setting up routes...');
app.use("/api/admin", adminRoutes);
console.log(' Admin routes mounted at /api/admin');
app.use("/api/auth", authRoutes);
console.log(' Auth routes mounted at /api/auth');
app.use("/api/patients", patientRoutes);
console.log(' Patient routes mounted at /api/patients');
app.use("/api/doctors", doctorRoutes);
console.log(' Doctor routes mounted at /api/doctors');
app.use("/api/appointments", appointmentRoutes);
console.log(' Appointment routes mounted at /api/appointments');
app.use("/api/dashboard", dashboardRoutes);
console.log(' Dashboard routes mounted at /api/dashboard');
app.use("/api/schedules", scheduleRoutes);
console.log(' Schedule routes mounted at /api/schedules');
app.use("/api/reviews", reviewRoutes);
console.log(' Review routes mounted at /api/reviews');
app.use("/api/notifications", notificationRoutes);
console.log(' Notification routes mounted at /api/notifications');
app.use("/api/chatbot", chatbotRoutes);
console.log(' Chatbot routes mounted at /api/chatbot');
app.use("/api/therapy", therapyRoutes);
console.log(' Therapy routes mounted at /api/therapy');
app.use("/api/prescriptions", prescriptionRoutes);
console.log(' Prescription routes mounted at /api/prescriptions');
app.use("/api/crisis-messages", crisisMessageRoutes);
console.log(' Crisis message routes mounted at /api/crisis-messages');
app.use("/api/disputes", disputeRoutes);
console.log(' Dispute routes mounted at /api/disputes');
app.use("/api/chat-history", chatHistoryRoutes);
console.log(' Chat history routes mounted at /api/chat-history');
app.use("/api/system-reviews", systemReviewRoutes);
console.log(' System review routes mounted at /api/system-reviews');

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Mentra Backend API is running...",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});//Health check endpoint is used to verify that the backend server is running properly.

// Temporary route to add sample data
app.get("/api/add-sample-data", async (req, res) => {
  try {
    await addSampleData();
    res.json({
      success: true,
      message: "Sample doctors added successfully"
    });
  } catch (error) {
    console.error('Error adding sample data:', error);
    res.status(500).json({
      success: false,
      message: "Failed to add sample data",
      error: error.message
    });
  }
});

// Default route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Mentra Backend API",
    version: "1.0.0",
    endpoints: {
      patients: "/api/patients",
      doctors: "/api/doctors", 
      admin: "/api/admin",
      health: "/api/health"
    }
  });
});//When someone opens: http://localhost:5002/ They see API info.

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});//Global error handler is used to handle server errors and send a proper response to the client.

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error(' Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Initialize database tables
    await initializeDatabase();

    // Start appointment auto-confirm scheduler
    startAppointmentScheduler();

    // Start server
    const PORT = process.env.PORT || 5002;
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
      console.log(` Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` API Documentation: http://localhost:${PORT}/`);
    });

  } catch (error) {
    console.error(' Failed to start server:', error);
    process.exit(1);
  }
};

//These handlers catch unexpected errors and prevent the server from crashing.

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});


//When server stops → close properly.

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

startServer();

