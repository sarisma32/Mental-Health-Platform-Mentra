import express from 'express';
import { verifyToken, verifyPatient } from '../middleware/auth.js';
import {
  submitSystemReview,
  getPublicSystemReviews,
  getAdminSystemReviews,
  approveSystemReview,
  deleteSystemReview,
  getMySystemReview,
} from '../controllers/systemReviewController.js';

const router = express.Router();

router.get('/public', getPublicSystemReviews);
router.get('/admin', getAdminSystemReviews);
router.put('/admin/:id/approve', approveSystemReview);
router.delete('/admin/:id', deleteSystemReview);
router.get('/my', verifyToken, verifyPatient, getMySystemReview);
router.post('/', verifyToken, verifyPatient, submitSystemReview);

export default router;
