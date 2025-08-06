import mongoose from 'mongoose';
import CampaignActivity from '../models/Activity.js';
import Campaign from '../models/campaign.js';
import { uploadToBlob } from '../config/vercelBlob.js';
import CampaignTeam from '../models/campaignTeam.js';

/**
 * Add a new activity to a campaign
 * @route POST /api/campaigns/:campaignId/activities
 */
export const addCampaignActivity = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

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

    // Check if campaign exists and user has permission
    const campaign = await Campaign.findById(campaignId).session(session);
    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        message: 'Campaign not found' 
      });
    }

    // Check if user is authorized (creator or team member)
    const isCreator = campaign.createdBy.toString() === userId.toString();
    const isTeamMember = campaign.team && 
      await CampaignTeam.findOne({ 
        campaign: campaignId, 
        $or: [
          { 'leader.userId': userId },
          { 'coLeader.userId': userId },
          { 'socialMediaCoordinator.userId': userId },
          { 'volunteerCoordinator.userId': userId },
          { 'financeManager.userId': userId },
          { 'additionalMembers.userId': userId }
        ]
      }).session(session);

    if (!isCreator && !isTeamMember) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to add activities to this campaign' 
      });
    }

    // Process uploaded files if any
    let mediaFiles = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const blob = await uploadToBlob(file, {
          access: 'public',
          addRandomSuffix: true,
          folder: `campaigns/${campaignId}/activities`
        });
        
        return {
          type: file.mimetype.startsWith('image') ? 'image' : 
                file.mimetype.startsWith('video') ? 'video' : 'document',
          url: blob.url,
          caption: '',
          uploadedAt: new Date()
        };
      });

      mediaFiles = await Promise.all(uploadPromises);
    }

    // Create activity with form data and uploaded media
    const activityData = {
      campaignId,
      createdBy: userId,
      
      // Basic details
      title: req.body.title,
      description: req.body.description,
      type: req.body.type || 'update',
      status: req.body.status || 'planned',
      
      // Media content
      media: mediaFiles,

      // Location information if provided
      location: {
        name: req.body.location?.name || '',
        address: req.body.location?.address || '',
        city: req.body.location?.city || '',
        state: req.body.location?.state || '',
        country: req.body.location?.country || '',
        isVirtual: req.body.location?.isVirtual || false
      },

      // Tags
      tags: Array.isArray(req.body.tags) ? req.body.tags : 
            req.body.tags ? [req.body.tags] : []
    };

    // Add type-specific details based on activity type
    if (req.body.type === 'event') {
      activityData.eventDetails = {
        startTime: req.body.eventDetails?.startTime || null,
        endTime: req.body.eventDetails?.endTime || null,
        maxParticipants: req.body.eventDetails?.maxParticipants || 0,
        requiresRegistration: req.body.eventDetails?.requiresRegistration || false,
        isPublic: req.body.eventDetails?.isPublic !== false
      };
    } else if (req.body.type === 'donation') {
      activityData.donationDetails = {
        amount: req.body.donationDetails?.amount || 0,
        currency: req.body.donationDetails?.currency || 'INR',
        donor: {
          name: req.body.donationDetails?.donor?.name || '',
          isAnonymous: req.body.donationDetails?.donor?.isAnonymous || false
        },
        purpose: req.body.donationDetails?.purpose || ''
      };
    } else if (req.body.type === 'milestone') {
      activityData.milestoneDetails = {
        targetValue: req.body.milestoneDetails?.targetValue || 0,
        achievedValue: req.body.milestoneDetails?.achievedValue || 0,
        metricType: req.body.milestoneDetails?.metricType || '',
        isAchieved: req.body.milestoneDetails?.isAchieved || false
      };
    } else if (req.body.type === 'media_coverage') {
      activityData.mediaCoverage = {
        source: req.body.mediaCoverage?.source || '',
        url: req.body.mediaCoverage?.url || '',
        type: req.body.mediaCoverage?.type || 'article',
        sentiment: req.body.mediaCoverage?.sentiment || 'neutral',
        reach: req.body.mediaCoverage?.reach || 0
      };
    }

    // Add impact data if provided
    if (req.body.impact) {
      activityData.impact = {
        peopleImpacted: req.body.impact.peopleImpacted || 0,
        resourcesUsed: req.body.impact.resourcesUsed || '',
        costInvolved: req.body.impact.costInvolved || 0,
        donationsReceived: req.body.impact.donationsReceived || 0,
        volunteerHours: req.body.impact.volunteerHours || 0,
        mediaReach: req.body.impact.mediaReach || 0
      };
    }

    // Create and save the activity
    const newActivity = new CampaignActivity(activityData);
    await newActivity.save({ session });

    // Update campaign's activities list if needed
    // This assumes your Campaign model has an activities array
    if (!campaign.activities) campaign.activities = [];
    campaign.activities.push(newActivity._id);
    campaign.lastActivityAt = new Date();
    await campaign.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Return success response with created activity
    res.status(201).json({
      success: true,
      message: 'Activity added successfully',
      data: newActivity
    });

  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error adding campaign activity:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding campaign activity',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get activities for a specific campaign
 * @route GET /api/campaigns/:campaignId/activities
 */
export const getCampaignActivities = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { type, status, page = 1, limit = 10 } = req.query;
    
    // Validate campaign ID
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ success: false, message: 'Invalid campaign ID format' });
    }
    
    // Build filter
    const filter = { campaignId };
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    // Count total documents
    const total = await CampaignActivity.countDocuments(filter);
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get activities with pagination
    const activities = await CampaignActivity.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'fullName profilePicture');
      
    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching campaign activities:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching campaign activities'
    });
  }
};

/**
 * Get a single activity by ID
 * @route GET /api/campaigns/:campaignId/activities/:activityId
 */
export const getActivityById = async (req, res) => {
  try {
    const { activityId } = req.params;
    
    // Validate activity ID
    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      return res.status(400).json({ success: false, message: 'Invalid activity ID format' });
    }
    
    const activity = await CampaignActivity.findById(activityId)
      .populate('createdBy', 'fullName profilePicture');
      
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }
    
    res.status(200).json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching activity'
    });
  }
};