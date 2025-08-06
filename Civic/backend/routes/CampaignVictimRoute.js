import express from 'express';
import { 
  createVictim, 
  getCampaignVictims,
  getVictimDetails,
  updateVictim,
  deleteVictim,
  updateVictimStatus,
  upload // Import the multer upload configuration
} from '../controller/CampaignVictimController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

// This is critical for accessing parent route parameters
const router = express.Router({ mergeParams: true });

// Routes
router.get('/', getCampaignVictims);

// Add multer upload middleware to POST and PUT routes
router.post('/', authMiddleware, upload, createVictim);
router.get('/:victimId', getVictimDetails);
router.put('/:victimId', authMiddleware, upload, updateVictim);
router.delete('/:victimId', authMiddleware, deleteVictim);
router.patch('/:victimId/status', authMiddleware, updateVictimStatus);

export default router;