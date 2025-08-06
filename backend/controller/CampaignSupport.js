import mongoose from 'mongoose';
import Campaign from '../models/Campaign.js';
import User from '../models/User.js';

/**
 * Add a supporter to a campaign
 * @route POST /api/campaigns/:campaignId/supporters
 */
export const addSupporter = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user._id;
    const { supportType, message, isAnonymous = false } = req.body;

    // Validate campaign ID
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid campaign ID format' 
      });
    }

    // Find campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        message: 'Campaign not found' 
      });
    }

    // Check if user has already supported this campaign
    const alreadySupported = campaign.supporters.some(
      supporter => supporter.userId.toString() === userId.toString()
    );

    if (alreadySupported) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already supported this campaign' 
      });
    }

    // Create new supporter object
    const newSupporter = {
      userId,
      supportType,
      supportedAt: new Date(),
      isAnonymous,
      message: message || ''
    };

    // Add supporter to campaign
    campaign.supporters.push(newSupporter);

    // Update campaign engagement metrics
    if (!campaign.engagementMetrics) {
      campaign.engagementMetrics = {};
    }

    campaign.engagementMetrics.supporters = (campaign.engagementMetrics.supporters || 0) + 1;

    // Update signature count if support type is signature
    if (supportType === 'signature') {
      campaign.engagementMetrics.signatureCount = (campaign.engagementMetrics.signatureCount || 0) + 1;
    }

    await campaign.save();

    // Update user's supported campaigns
    await User.findByIdAndUpdate(userId, {
      $addToSet: { campaignsSupported: campaignId }
    });

    // If support type is signature, also add to campaignsSigned
    if (supportType === 'signature') {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { campaignsSigned: campaignId }
      });
    }

    // Add to user activity log
    await User.findByIdAndUpdate(userId, {
      $push: {
        activityLog: {
          action: supportType === 'signature' ? 'sign' : 'support',
          campaignId,
          timestamp: new Date()
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Campaign supported successfully',
      data: newSupporter
    });

  } catch (error) {
    console.error('Error supporting campaign:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error supporting campaign'
    });
  }
};

/**
 * Remove supporter from campaign
 * @route DELETE /api/campaigns/:campaignId/supporters
 */
export const removeSupporter = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user._id;

    // Validate campaign ID
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid campaign ID format' 
      });
    }

    // Find campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        message: 'Campaign not found' 
      });
    }

    // Find the supporter
    const supporterIndex = campaign.supporters.findIndex(
      supporter => supporter.userId.toString() === userId.toString()
    );

    if (supporterIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'You are not supporting this campaign' 
      });
    }

    // Check if it was a signature
    const wasSignature = campaign.supporters[supporterIndex].supportType === 'signature';

    // Remove the supporter
    campaign.supporters.splice(supporterIndex, 1);

    // Update campaign engagement metrics
    if (campaign.engagementMetrics) {
      campaign.engagementMetrics.supporters = Math.max(0, (campaign.engagementMetrics.supporters || 0) - 1);
      
      // Update signature count if it was a signature
      if (wasSignature) {
        campaign.engagementMetrics.signatureCount = Math.max(0, (campaign.engagementMetrics.signatureCount || 0) - 1);
      }
    }

    await campaign.save();

    // Remove from user's supported campaigns
    await User.findByIdAndUpdate(userId, {
      $pull: { campaignsSupported: campaignId }
    });

    // If it was a signature, also remove from campaignsSigned
    if (wasSignature) {
      await User.findByIdAndUpdate(userId, {
        $pull: { campaignsSigned: campaignId }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Support removed successfully'
    });

  } catch (error) {
    console.error('Error removing support:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error removing support'
    });
  }
};

/**
 * Get all supporters for a campaign
 * @route GET /api/campaigns/:campaignId/supporters
 */
export const getCampaignSupporters = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { page = 1, limit = 10, supportType } = req.query;

    // Validate campaign ID
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid campaign ID format' 
      });
    }

    // Find campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        message: 'Campaign not found' 
      });
    }

    // Filter supporters by type if specified
    let supporters = campaign.supporters;
    if (supportType) {
      supporters = supporters.filter(s => s.supportType === supportType);
    }

    // Sort by newest first
    supporters = supporters.sort((a, b) => new Date(b.supportedAt) - new Date(a.supportedAt));

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedSupporters = supporters.slice(startIndex, endIndex);

    // Get user details for non-anonymous supporters
    const supportersWithDetails = await Promise.all(
      paginatedSupporters.map(async (supporter) => {
        if (supporter.isAnonymous) {
          return {
            ...supporter.toObject(),
            user: { isAnonymous: true }
          };
        } else {
          const user = await User.findById(supporter.userId).select('fullName profilePicture');
          return {
            ...supporter.toObject(),
            user: user ? {
              fullName: user.fullName,
              profilePicture: user.profilePicture
            } : null
          };
        }
      })
    );

    res.status(200).json({
      success: true,
      data: supportersWithDetails,
      pagination: {
        total: supporters.length,
        page: parseInt(page),
        pages: Math.ceil(supporters.length / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching campaign supporters:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching campaign supporters'
    });
  }
};

/**
 * Check if user is supporting a campaign
 * @route GET /api/campaigns/:campaignId/supporters/check
 */
export const checkUserSupport = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user._id;

    // Validate campaign ID
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid campaign ID format' 
      });
    }

    // Find campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        message: 'Campaign not found' 
      });
    }

    // Check if user is supporting
    const supporter = campaign.supporters.find(
      s => s.userId.toString() === userId.toString()
    );

    res.status(200).json({
      success: true,
      isSupporting: !!supporter,
      supportDetails: supporter || null
    });

  } catch (error) {
    console.error('Error checking campaign support status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error checking campaign support status'
    });
  }
};