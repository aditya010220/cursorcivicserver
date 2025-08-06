import express from 'express';
import multer from 'multer';
import { 
  addCampaignActivity, 
  getCampaignActivities,
  getActivityById 
} from '../controller/ActivityController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Max 5 files per upload
  }
});

// Routes for campaign activities
router.post(
  '/:campaignId/activities', 
  authMiddleware, 
  upload.array('files'), 
  addCampaignActivity
);

router.get(
  '/:campaignId/activities',
  getCampaignActivities
);

router.get(
  '/:campaignId/activities/:activityId',
  getActivityById
);

export default router;