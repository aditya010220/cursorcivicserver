import express from 'express';
import multer from 'multer';
import {
  createCampaign,
  updateCampaignStep,
  uploadEvidence,
  getCampaign,
  getUserCampaigns,
  getTeamMemberCampaigns,
  getUserCampaignStats,
  getCampaignEvidence,
  updateCampaignCover, // Add this import
  getAllCampaigns // Add this import
} from '../controller/Campaign.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for file storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per upload
  }
});

// --- Campaign Creation & Management ---
router.post('/', authMiddleware, createCampaign);
router.put('/:id/step', authMiddleware, updateCampaignStep);

// --- Campaign Retrieval --- (Add this new route)
router.get('/', getAllCampaigns);

// --- User Campaign Management ---
router.get('/my-campaigns', authMiddleware, getUserCampaigns);
router.get('/team-campaigns', authMiddleware, getTeamMemberCampaigns);
router.get('/campaign-stats', authMiddleware, getUserCampaignStats);

// --- Evidence Management ---
router.post(
  '/:campaignId/evidence',
  authMiddleware,
  upload.array('files'),
  uploadEvidence
);

// --- Cover Image Management --- (Add this new route)
router.post(
  '/:campaignId/cover-image',
  authMiddleware,
  upload.single('coverImage'),
  updateCampaignCover
);

// --- Generic/Parameter routes ---
router.get('/:id', getCampaign);
router.get('/:campaignId/evidence', getCampaignEvidence);

export default router;