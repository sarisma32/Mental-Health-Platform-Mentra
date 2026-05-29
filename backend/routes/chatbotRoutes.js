import express from 'express';
import { chat, recommendDoctor, copingStrategies, escalateCrisis } from '../controllers/chatbotController.js';

const router = express.Router();

router.post('/chat', chat);
router.post('/escalate-crisis', escalateCrisis);   // patient-initiated crisis escalation
router.post('/recommend-doctor', recommendDoctor);  // legacy
router.post('/coping-strategies', copingStrategies); // legacy

export default router;
