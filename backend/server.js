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
console.log('📦 Schedule routes imported:', typeof scheduleRoutes, scheduleRoutes ? 'OK' : 'UNDEFINED');
import { testConnection, initializeDatabase } from "./db/init.js";

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
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
console.log('🔧 Setting up routes...');
app.use("/api/admin", adminRoutes);
console.log('✅ Admin routes mounted at /api/admin');
app.use("/api/auth", authRoutes);
console.log('✅ Auth routes mounted at /api/auth');
app.use("/api/patients", patientRoutes);
console.log('✅ Patient routes mounted at /api/patients');
app.use("/api/doctors", doctorRoutes);
console.log('✅ Doctor routes mounted at /api/doctors');
app.use("/api/appointments", appointmentRoutes);
console.log('✅ Appointment routes mounted at /api/appointments');
app.use("/api/dashboard", dashboardRoutes);
console.log('✅ Dashboard routes mounted at /api/dashboard');
app.use("/api/schedules", scheduleRoutes);
console.log('✅ Schedule routes mounted at /api/schedules');
app.use("/api/reviews", reviewRoutes);
console.log('✅ Review routes mounted at /api/reviews');

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Mentra Backend API is running...",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
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
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

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
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Initialize database tables
    await initializeDatabase();

    // Start server
    const PORT = process.env.PORT || 5002;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
      console.log(`🏥 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 API Documentation: http://localhost:${PORT}/`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

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
