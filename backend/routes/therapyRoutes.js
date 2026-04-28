import express from 'express';
import { verifyToken, verifyDoctor, verifyPatient } from '../middleware/auth.js';
import {
  assignTask, getDoctorTasks, deleteTask, updateTask,
  getPatientTasks, completeTask, submitFeedback,
  getPatientProgress, getDoctorPatientProgress,
} from '../controllers/therapyController.js';

const router = express.Router();

// Doctor routes
router.post('/assign', verifyToken, verifyDoctor, assignTask);
router.get('/doctor/tasks', verifyToken, verifyDoctor, getDoctorTasks);
router.put('/doctor/tasks/:taskId', verifyToken, verifyDoctor, updateTask);
router.delete('/doctor/tasks/:taskId', verifyToken, verifyDoctor, deleteTask);
router.get('/doctor/patient/:patientId/progress', verifyToken, verifyDoctor, getDoctorPatientProgress);

// Patient routes
router.get('/patient/tasks', verifyToken, verifyPatient, getPatientTasks);
router.put('/patient/tasks/:taskId/complete', verifyToken, verifyPatient, completeTask);
router.post('/patient/tasks/:taskId/feedback', verifyToken, verifyPatient, submitFeedback);
router.get('/patient/progress', verifyToken, verifyPatient, getPatientProgress);

export default router;
