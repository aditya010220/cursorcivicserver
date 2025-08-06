import express from 'express';
import { 
  createPoll, 
  getCampaignPolls, 
  getPollDetails, 
  castVote, 
  updatePollStatus 
} from '../controller/PollController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

// Create a new poll (requires auth)
router.post('/', authMiddleware, createPoll);

// Get all polls for a campaign
router.get('/', getCampaignPolls);

// Get details for a single poll
router.get('/:pollId', getPollDetails);

// Cast a vote (requires auth)
router.post('/:pollId/vote', authMiddleware, castVote);

// Update poll status (requires auth)
router.patch('/:pollId/status', authMiddleware, updatePollStatus);

export default router;