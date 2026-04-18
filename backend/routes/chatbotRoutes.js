import express from 'express';
import { chat, recommendDoctor, copingStrategies } from '../controllers/chatbotController.js';

const router = express.Router();

router.post('/chat', chat);                          // unified endpoint
router.post('/recommend-doctor', recommendDoctor);   // legacy
router.post('/coping-strategies', copingStrategies); // legacy

export default router;
