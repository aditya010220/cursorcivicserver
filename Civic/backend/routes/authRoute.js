import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  submitGovVerification,
  getUserActivity,
  deleteAccount,
  updateImpactScore,
  forgotPassword,
  resetPassword
} from '../controller/Authentication.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes (authentication required)
router.get('/profile', authMiddleware, getUserProfile);
router.get('/profile/:id', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.put('/profile/:id', authMiddleware, updateUserProfile);
router.post('/change-password', authMiddleware, changePassword);
router.post('/verify-government-id', authMiddleware, submitGovVerification);
router.get('/activity', authMiddleware, getUserActivity);
router.get('/activity/:id', authMiddleware, getUserActivity);
router.delete('/account', authMiddleware, deleteAccount);
router.post('/impact-score', authMiddleware, updateImpactScore);
router.post('/impact-score/:id', authMiddleware, adminMiddleware, updateImpactScore);

export default router;