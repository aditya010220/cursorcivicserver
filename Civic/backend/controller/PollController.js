import mongoose from 'mongoose';
import CampaignPoll from '../models/campaignPollSchema.js';
import Campaign from '../models/campaign.js';

// Helper to check if user can manage polls for a campaign
const canManageCampaignPolls = async (userId, campaignId) => {
  try {
    const campaign = await Campaign.findById(campaignId);
    
    // Check if user is creator or team member
    if (campaign.createdBy.toString() === userId.toString()) {
      return true;
    }
    
    // Check if user is part of the team (simplified - update based on your team structure)
    if (campaign.team && campaign.team.includes(userId)) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking poll management permissions:', error);
    return false;
  }
};


// Create a new poll
export const createPoll = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { title, description, options, durationInDays } = req.body;
    const userId = req.user._id;
    
    // Validate campaignId
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid campaign ID format' 
      });
    }
    
    // Validate required fields
    if (!title || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Poll requires a title and at least 2 options'
      });
    }
    
    // Check if user can create polls for this campaign
    const canManage = await canManageCampaignPolls(userId, campaignId);
    if (!canManage) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to create polls for this campaign'
      });
    }
    
    // Create poll
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (durationInDays || 7)); // Default 7 days if not specified
    
    // Format options with indexes
    const formattedOptions = options.map((text, index) => ({
      text,
      index
    }));
    
    // Initialize voteCounts array
    const voteCounts = formattedOptions.map((option) => ({
      optionIndex: option.index,
      count: 0
    }));
    
    const newPoll = new CampaignPoll({
      campaignId,
      title,
      description,
      options: formattedOptions,
      startTime: new Date(),
      endTime: endDate,
      createdBy: userId,
      isActive: true,
      votes: [],
      voteCounts,
      totalVotes: 0,
      isPublic: req.body.isPublic !== false // Default to public if not specified
    });
    
    await newPoll.save();
    
    // Optionally update campaign with poll reference
    await updateCampaignWithPoll(campaignId, newPoll._id);
    
    res.status(201).json({
      success: true,
      data: newPoll
    });
    
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating poll'
    });
  }
};

// Cast a vote on a poll
export const castVote = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { optionIndex } = req.body;
    const userId = req.user._id;
    
    // Validate pollId
    if (!mongoose.Types.ObjectId.isValid(pollId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid poll ID format' 
      });
    }
    
    // Find the poll
    const poll = await CampaignPoll.findById(pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        error: 'Poll not found'
      });
    }
    
    // Check if poll is active
    if (!poll.isActive) {
      return res.status(400).json({
        success: false,
        error: 'This poll is not active'
      });
    }
    
    // Check if poll has ended
    if (new Date() > poll.endTime) {
      return res.status(400).json({
        success: false,
        error: 'This poll has ended'
      });
    }
    
    // Check if option index is valid
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({
        success: false,
        error: 'Invalid option selected'
      });
    }
    
    // Check if user has already voted
    const existingVote = poll.votes.find(vote => 
      vote.userId && vote.userId.toString() === userId.toString()
    );
    
    if (existingVote) {
      return res.status(400).json({
        success: false,
        error: 'You have already voted in this poll'
      });
    }
    
    // Record the vote
    poll.votes.push({
      userId,
      optionIndex,
      votedAt: new Date(),
      ipAddress: req.ip
    });
    
    // Update vote count for the selected option
    const voteCountIndex = poll.voteCounts.findIndex(vc => 
      vc.optionIndex === optionIndex
    );
    
    if (voteCountIndex >= 0) {
      poll.voteCounts[voteCountIndex].count += 1;
    } else {
      poll.voteCounts.push({
        optionIndex,
        count: 1
      });
    }
    
    // Update total votes
    poll.totalVotes += 1;
    
    await poll.save();
    
    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        pollId: poll._id,
        selectedOption: optionIndex,
        voteCounts: poll.voteCounts
      }
    });
    
  } catch (error) {
    console.error('Error casting vote:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while processing vote'
    });
  }
};

// Get polls for a campaign
export const getCampaignPolls = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    // Validate campaignId
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid campaign ID format' 
      });
    }
    
    const polls = await CampaignPoll.find({ 
      campaignId,
      isPublic: true // Only return public polls
    }).sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: polls.length,
      data: polls
    });
    
  } catch (error) {
    console.error('Error fetching campaign polls:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching polls'
    });
  }
};

// Get single poll with details
export const getPollDetails = async (req, res) => {
  try {
    const { pollId } = req.params;
    const userId = req.user ? req.user._id : null;
    
    // Validate pollId
    if (!mongoose.Types.ObjectId.isValid(pollId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid poll ID format' 
      });
    }
    
    const poll = await CampaignPoll.findById(pollId);
    
    if (!poll) {
      return res.status(404).json({
        success: false,
        error: 'Poll not found'
      });
    }
    
    // If poll is not public, check permissions
    if (!poll.isPublic) {
      const canAccess = await canManageCampaignPolls(userId, poll.campaignId);
      if (!canAccess) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to view this poll'
        });
      }
    }
    
    // Check if the user has voted
    let userVote = null;
    if (userId) {
      userVote = poll.votes.find(vote => 
        vote.userId && vote.userId.toString() === userId.toString()
      );
    }
    
    // Format response
    const response = {
      _id: poll._id,
      campaignId: poll.campaignId,
      title: poll.title,
      description: poll.description,
      options: poll.options,
      startTime: poll.startTime,
      endTime: poll.endTime,
      isActive: poll.isActive,
      voteCounts: poll.voteCounts,
      totalVotes: poll.totalVotes,
      createdAt: poll.createdAt,
      hasVoted: !!userVote,
      userVote: userVote ? userVote.optionIndex : null
    };
    
    res.status(200).json({
      success: true,
      data: response
    });
    
  } catch (error) {
    console.error('Error fetching poll details:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching poll details'
    });
  }
};

// Update poll status (active/inactive)
export const updatePollStatus = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { isActive } = req.body;
    const userId = req.user._id;
    
    // Validate pollId
    if (!mongoose.Types.ObjectId.isValid(pollId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid poll ID format' 
      });
    }
    
    // Find poll
    const poll = await CampaignPoll.findById(pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        error: 'Poll not found'
      });
    }
    
    // Check permissions
    const canManage = await canManageCampaignPolls(userId, poll.campaignId);
    if (!canManage) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to manage this poll'
      });
    }
    
    // Update status
    poll.isActive = isActive;
    await poll.save();
    
    res.status(200).json({
      success: true,
      message: `Poll ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: poll
    });
    
  } catch (error) {
    console.error('Error updating poll status:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating poll status'
    });
  }
};

// Add poll reference to campaign
export const updateCampaignWithPoll = async (campaignId, pollId) => {
  try {
    await Campaign.findByIdAndUpdate(
      campaignId,
      { $push: { polls: pollId } },
      { new: true }
    );
    return true;
  } catch (error) {
    console.error('Error updating campaign with poll:', error);
    return false;
  }
};