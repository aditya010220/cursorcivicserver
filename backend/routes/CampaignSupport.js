import express from 'express';
import { 
  addSupporter, 
  removeSupporter, 
  getCampaignSupporters,
  checkUserSupport
} from '../controller/CampaignSupport.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

// This is critical for accessing parent route parameters
const router = express.Router({ mergeParams: true });

// Routes
router.post('/', authMiddleware, addSupporter);
router.delete('/', authMiddleware, removeSupporter);
router.get('/', getCampaignSupporters);
router.get('/check', authMiddleware, checkUserSupport);

export default router;