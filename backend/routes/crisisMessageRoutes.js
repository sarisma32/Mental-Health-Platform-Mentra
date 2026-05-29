import express from 'express';
import {
  sendCrisisMessage,
  getPatientCrisisMessages,
  getDoctorCrisisMessages,
  markCrisisMessagesRead,
  getPatientEmergencyContact,
  getAdminCrisisAlerts,
} from '../controllers/crisisMessageController.js';

const router = express.Router();

router.post('/send', sendCrisisMessage);
router.get('/patient/:patientId', getPatientCrisisMessages);
router.get('/doctor/:doctorId/patient/:patientId', getDoctorCrisisMessages);
router.put('/patient/:patientId/read', markCrisisMessagesRead);
router.get('/emergency-contact/patient/:patientId', getPatientEmergencyContact);
router.get('/admin/all', getAdminCrisisAlerts);

export default router;
