import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  getAllAnalysts,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/analysts', protect, getAllAnalysts);

export default router;
