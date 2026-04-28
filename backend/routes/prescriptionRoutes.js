import express from 'express';
import { verifyToken, verifyDoctor, verifyPatient } from '../middleware/auth.js';
import { savePrescription, getPrescriptionByAppointment, getPatientPrescriptions, getDoctorPrescriptions } from '../controllers/prescriptionController.js';

const router = express.Router();

router.post('/save', verifyToken, verifyDoctor, savePrescription);
router.get('/appointment/:appointmentId', verifyToken, getPrescriptionByAppointment);
router.get('/patient', verifyToken, verifyPatient, getPatientPrescriptions);
router.get('/doctor', verifyToken, verifyDoctor, getDoctorPrescriptions);

export default router;
