import express from 'express';
import { verifyToken, verifyPatient } from '../middleware/auth.js';
import {
  getConversations,
  getMessages,
  createConversation,
  updateConversation,
  saveMessage,
  deleteConversation,
} from '../controllers/chatHistoryController.js';

const router = express.Router();

// All routes require a logged-in patient
router.use(verifyToken, verifyPatient);

router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.patch('/conversations/:id', updateConversation);
router.delete('/conversations/:id', deleteConversation);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/messages', saveMessage);

export default router;
