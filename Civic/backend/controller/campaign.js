import Campaign from '../models/campaign.js';
import CampaignTeam from '../models/campaignTeam.js';
import CampaignVictim from '../models/campaignVictim.js';
import CampaignEvidence from '../models/campaignEvidence.js';
import cloudinary from '../config/cloudinary.js';
import { uploadToBlob, deleteFromBlob } from '../config/vercelBlob.js';
import { validateEvidence } from '../config/gemini.js'; // Keep if you have this service
import mongoose from 'mongoose';
import { promises as fs } from 'fs'; // Standard Node.js module
import path from 'path'; // Standard Node.js module
import { Readable } from 'stream';

/**
 * Create a new campaign (Step 1) - Enhanced
 */
export const createCampaign = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  console.log(`[INFO] User ${req.user._id} is creating a new campaign`);

  try {
    // Validate required fields for Step 1
    const { title, description, shortDescription, category } = req.body;

    if (!title || !description || !shortDescription || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields for Step 1',
        requiredFields: ['title', 'description', 'shortDescription', 'category']
      });
    }

    // Create the campaign with initial data and set the creationStep to 1
    const campaign = new Campaign({
      title,
      description,
      shortDescription,
      category,
      tags: req.body.tags || [],
      location: req.body.location || {},
      createdBy: req.user._id,
      creationStep: 1, // Set initial step to 1 (not 0)
      status: 'draft'
    });

    await campaign.save({ session });

    // Create a team for the campaign with proper leader structure
    const team = new CampaignTeam({
      campaign: campaign._id,
      // Set the leader with a proper structure containing userId
      leader: {
        userId: req.user._id, // This is what was missing
        name: req.user.fullName || req.user.email,
        role: 'Campaign Leader',
        acceptedInvite: true,
        invitedAt: new Date()
      },
      coLeader: null,
      socialMediaCoordinator: null,
      volunteerCoordinator: null,
      financeManager: null,
      additionalMembers: []
    });

    await team.save({ session });

    // Update campaign with team reference
    campaign.team = team._id;
    await campaign.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: 'Campaign created successfully with initial data',
      data: campaign
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Create campaign error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating campaign',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Update campaign step by step - Enhanced
 */
export const updateCampaignStep = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { step, data } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid campaign ID' });
    }

    if (!step || !data) {
        return res.status(400).json({ success: false, message: 'Missing step or data in request body' });
    }

    const campaign = await Campaign.findById(id).session(session);

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // Check permissions - Only creator can update during creation steps
    if (campaign.createdBy.toString() !== req.user._id.toString()) {
      console.warn(`[WARN] Unauthorized campaign update attempt: User ${req.user._id} tried to update campaign ${id} owned by ${campaign.createdBy}`);
      return res.status(403).json({ success: false, message: 'Not authorized to update this campaign' });
    }

    // Ensure steps are completed in order (or allow returning to step 1)
    const currentStep = parseInt(step);
    if (currentStep !== campaign.creationStep && currentStep !== 1) {
      return res.status(400).json({
        success: false,
        message: `Cannot jump to step ${currentStep}. Current step is ${campaign.creationStep}. Please complete steps sequentially.`
      });
    }

    let nextStep = campaign.creationStep; // Default to current step

    switch (currentStep) {
      case 1: // Basic info update
        if (data.title) campaign.title = data.title.trim();
        if (data.description) campaign.description = data.description.trim();
        if (data.shortDescription) campaign.shortDescription = data.shortDescription.trim();
        if (data.category) campaign.category = data.category;
        if (data.tags) {
          campaign.tags = Array.isArray(data.tags)
            ? data.tags.filter(tag => tag && tag.trim()).map(tag => tag.trim())
            : [];
        }
        if (data.endDate) campaign.endDate = new Date(data.endDate);
        if (data.location) campaign.location = data.location;
        // Add other step 1 fields as needed

        nextStep = 2; // Move to step 2 after updating step 1
        break;

      case 2: // Team setup
        if (!campaign.team) {
          return res.status(400).json({ success: false, message: 'Campaign team not initialized. Cannot proceed to step 2.' });
        }
        const team = await CampaignTeam.findById(campaign.team).session(session);
        if (!team) {
          return res.status(404).json({ success: false, message: 'Campaign team not found' });
        }

        // Update team roles
        const roleUpdates = ['coLeader', 'socialMediaCoordinator', 'volunteerCoordinator', 'financeManager'];

        for (const role of roleUpdates) {
          if (data[role]) {
            // Handle invitations for new team members
            if (data[role].userId && data[role].userId !== team[role]?.userId?.toString()) {
              data[role].invitedAt = new Date();
              data[role].acceptedInvite = false;

              // TODO: Send invitation email or notification to the user
            }

            team[role] = data[role];
          }
        }

        if (data.additionalMembers) {
          // Update existing members and add new ones
          const existingMembers = team.additionalMembers || [];
          const updatedMembers = [];

          // Process existing members first
          for (const existingMember of existingMembers) {
            const matchingUpdatedMember = data.additionalMembers.find(
              m => m._id === existingMember._id?.toString() ||
                  (m.userId && m.userId === existingMember.userId?.toString())
            );

            if (matchingUpdatedMember) {
              // Update existing member
              updatedMembers.push({
                ...existingMember.toObject(),
                ...matchingUpdatedMember,
                userId: existingMember.userId // Keep the original userId as ObjectId
              });
            } else {
              // Keep the existing member
              updatedMembers.push(existingMember);
            }
          }

          // Add new members
          for (const newMember of data.additionalMembers) {
            const isNewMember = !existingMembers.some(
              m => m._id?.toString() === newMember._id ||
                  (m.userId && m.userId.toString() === newMember.userId)
            );

            if (isNewMember) {
              updatedMembers.push({
                ...newMember,
                invitedAt: new Date(),
                acceptedInvite: false
                // TODO: Send invitation
              });
            }
          }

          team.additionalMembers = updatedMembers;
        }

        if (data.communicationChannels) {
          team.communicationChannels = data.communicationChannels;
        }

        await team.save({ session });
        nextStep = 3; // Move to step 3 after updating team
        break;

      case 3: // Victims information
        campaign.hasVictims = data.hasVictims || false;

        // If campaign has victims, save victim records
        if (data.hasVictims && data.victims && data.victims.length > 0) {
          // Get existing victims to avoid duplicates
          const existingVictims = campaign.victims ?
            await CampaignVictim.find({ _id: { $in: campaign.victims } }).session(session) :
            [];

          const victimIds = [];

          for (const victimData of data.victims) {
            // Check if this is an existing victim being updated
            let victim;

            if (victimData._id) {
              victim = existingVictims.find(v => v._id.toString() === victimData._id);

              if (victim) {
                // Update existing victim
                Object.assign(victim, {
                  ...victimData,
                  updatedAt: new Date()
                });
                await victim.save({ session });
                victimIds.push(victim._id);
                continue;
              }
            }

            // Create new victim
            victim = new CampaignVictim({
              ...victimData,
              campaign: campaign._id,
              addedBy: req.user._id
            });

            await victim.save({ session });
            victimIds.push(victim._id);
          }

          // Delete any victims that were removed
          const removedVictims = existingVictims.filter(
            existing => !victimIds.some(id => id.toString() === existing._id.toString())
          );

          for (const victim of removedVictims) {
            await CampaignVictim.findByIdAndDelete(victim._id, { session });
          }

          campaign.victims = victimIds;
        } else {
          // If hasVictims is false, remove any existing victims
          if (campaign.victims && campaign.victims.length > 0) {
            await CampaignVictim.deleteMany({
              _id: { $in: campaign.victims }
            }, { session });

            campaign.victims = [];
          }
        }

        nextStep = 4; // Move to step 4 after updating victims
        break;

      case 4: // Evidence has been added and campaign is complete
        const evidenceCount = await CampaignEvidence.countDocuments({ campaign: campaign._id });

        if (evidenceCount === 0 && !data.skipEvidenceRequirement) {
          return res.status(400).json({
            success: false,
            message: 'At least one piece of evidence is required to complete campaign creation'
          });
        }

        campaign.creationComplete = true;

        // If publishNow is true, make the campaign active
        if (data.publishNow === true) {
          campaign.status = 'active';
          // Update campaign metrics
          campaign.engagementMetrics = {
            ...campaign.engagementMetrics,
            views: 0,
            supporters: 0
          };
        }

        nextStep = 5; // Mark as complete
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid step number'
        });
    }

    campaign.creationStep = nextStep; // Update the campaign's creation step
    campaign.updatedAt = new Date();
    await campaign.save({ session });

    await session.commitTransaction();

    // Log campaign update
    console.log(`[INFO] Campaign ${id} updated to step ${step} by user ${req.user._id}`);

    // Prepare response with populated data
    const populatedCampaign = await Campaign.findById(id)
      .populate('team')
      .populate('victims')
      .populate('evidence')
      .lean();

    res.json({
      success: true,
      message: `Campaign updated to step ${step}`,
      data: populatedCampaign
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(`[ERROR] Campaign step update error: ${error.message}`, {
      error,
      userId: req.user?._id,
      campaignId: req.params.id
    });

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Error updating campaign',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    session.endSession();
  }
};

/**
 * Upload evidence for a campaign - improved with direct blob upload and async validation
 */
export const uploadEvidence = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    console.log(`[INFO] User ${req.user._id} is uploading evidence for campaign ${campaignId}`);
    console.log('Request body:', req.body);
    console.log('Files received:', req.files ? `${req.files.length} files` : (req.file ? "1 file" : "no files"));
    
    if (!campaignId || !mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing campaign ID' });
    }
    
    // Check if request body is missing
    if (!req.body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing request body. Make sure you\'re sending form data correctly.' 
      });
    }
    
    const { title, description, source, evidenceType } = req.body;
    const relatedVictims = req.body.relatedVictims || [];
    
    // Handle both single file and multiple files
    const files = req.files || (req.file ? [req.file] : []);
    
    if (files.length === 0 && evidenceType !== 'testimonial') {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded. For testimonial evidence, please provide testimonialContent.'
      });
    }
    
    if (!title || !description || !source || !evidenceType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        requiredFields: ['title', 'description', 'source', 'evidenceType'],
        received: { title, description, source, evidenceType }
      });
    }
    
    // Verify campaign exists and user has permission
    const campaign = await Campaign.findById(campaignId)
      .populate({
        path: 'team',
        select: 'leader coLeader socialMediaCoordinator volunteerCoordinator financeManager additionalMembers'
      });

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // Check permissions - Allow team members to upload
    const isCreator = campaign.createdBy.toString() === req.user._id.toString();
    let isTeamMember = false;

    if (!isCreator && campaign.team) {
      const team = campaign.team;

      // Check if user is in any team role
      isTeamMember = [
        team.leader?.userId,
        team.coLeader?.userId,
        team.socialMediaCoordinator?.userId,
        team.volunteerCoordinator?.userId,
        team.financeManager?.userId
      ].some(id => id && id.toString() === req.user._id.toString());

      // Check additional members if not found in primary roles
      if (!isTeamMember && team.additionalMembers && team.additionalMembers.length > 0) {
        isTeamMember = team.additionalMembers.some(
          member => member.userId && member.userId.toString() === req.user._id.toString() && member.acceptedInvite
        );
      }
    }

    if (!isCreator && !isTeamMember) {
      console.warn(`[WARN] Unauthorized evidence upload attempt: User ${req.user._id} tried to upload evidence for campaign ${campaignId}`);
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload evidence for this campaign'
      });
    }

    // For testimonial evidence
    if (evidenceType === 'testimonial') {
      if (!req.body.testimonialContent) {
        return res.status(400).json({
          success: false,
          message: 'Testimonial evidence requires testimonialContent field'
        });
      }
      
      // Create testimonial evidence
      const evidence = new CampaignEvidence({
        campaign: campaignId,
        title,
        description,
        evidenceType: 'testimonial',
        source,
        dateCollected: new Date(),
        testimonialContent: req.body.testimonialContent,
        relatedVictims: relatedVictims.length > 0 ? relatedVictims : undefined,
        addedBy: req.user._id,
        status: 'pending_verification',
        permissions: {
          isPublic: req.body.isPublic === 'true'
        }
      });

      await evidence.save();
      
      // Add to campaign's evidence array immediately
      await Campaign.findByIdAndUpdate(campaignId, {
        $push: { evidence: evidence._id },
        $set: {
          updatedAt: new Date(),
          creationStep: Math.max(campaign.creationStep || 0, 3)
        }
      });
      
      // Schedule AI validation in the background without blocking the response
      if (process.env.ENABLE_AI_VALIDATION === 'true') {
        // We don't want to await this - let it run in the background
        validateEvidence(evidence)
          .then(async (validationResults) => {
            // Update evidence with validation results
            evidence.verification = {
              isVerified: validationResults.isVerified,
              verificationMethod: 'technical_analysis',
              verificationDate: new Date(),
              verificationNotes: validationResults.verificationNotes,
              confidenceScore: validationResults.confidenceScore
            };
            
            evidence.status = validationResults.isFlagged ? 'under_review' : 'accepted';
            
            await evidence.save();
            console.log(`[INFO] Testimonial evidence ${evidence._id} validated in background`);
          })
          .catch(err => {
            console.error(`[ERROR] Failed to validate testimonial evidence ${evidence._id}:`, err);
          });
      }

      return res.status(201).json({
        success: true,
        message: 'Testimonial evidence added successfully',
        data: evidence
      });
    }

    // For file uploads - process directly without creating temp files
    const evidenceList = [];
    
    // Process files in parallel
    await Promise.all(files.map(async (file) => {
      try {
        let uploadResult;
        
        // Upload directly from buffer to either Cloudinary or Vercel Blob
        if (evidenceType === 'photo' || evidenceType === 'image') {
          // For images, upload to Cloudinary directly from buffer
          uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: `campaign-evidence/${campaignId}`,
                resource_type: 'image'
              },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            );
            
            // Create a stream from the buffer using the imported Readable
            const bufferStream = Readable.from(file.buffer);
            bufferStream.pipe(uploadStream);
          });
        } else {
          // For other file types, upload to Vercel Blob
          // Pass the buffer directly to the uploadToBlob function
          uploadResult = await uploadToBlob(
            file.buffer, 
            {
              filename: file.originalname,
              contentType: file.mimetype,
              directory: `campaign-evidence/${campaignId}`
            }
          );
        }
        
        // Create evidence record
        const evidence = new CampaignEvidence({
          campaign: campaignId,
          title,
          description,
          evidenceType,
          source,
          dateCollected: new Date(),
          mediaFile: {
            url: uploadResult.secure_url || uploadResult.url,
            fileName: file.originalname,
            fileSize: file.size,
            fileType: file.mimetype,
            dimensions: uploadResult.width && uploadResult.height ? {
              width: uploadResult.width,
              height: uploadResult.height
            } : undefined,
            duration: uploadResult.duration,
            thumbnailUrl: uploadResult.thumbnail_url
          },
          addedBy: req.user._id,
          status: 'pending_verification',
          permissions: {
            isPublic: req.body.isPublic === 'true'
          }
        });
        
        await evidence.save();
        evidenceList.push(evidence);
        
        // Add to campaign's evidence array
        await Campaign.findByIdAndUpdate(campaignId, {
          $push: { evidence: evidence._id },
          $set: { 
            updatedAt: new Date(),
            creationStep: Math.max(campaign.creationStep || 0, 3)
          }
        });
        
        // Schedule async validation if enabled
        if (process.env.ENABLE_AI_VALIDATION === 'true') {
          // Start validation in background without blocking response
          setTimeout(() => {
            validateEvidence(evidence)
              .then(async (validationResults) => {
                evidence.verification = {
                  isVerified: validationResults.isVerified,
                  verificationMethod: 'technical_analysis',
                  verificationDate: new Date(),
                  verificationNotes: validationResults.verificationNotes,
                  confidenceScore: validationResults.confidenceScore
                };
                
                evidence.status = validationResults.isFlagged ? 'under_review' : 'accepted';
                await evidence.save();
                console.log(`[INFO] File evidence ${evidence._id} validated in background`);
              })
              .catch(error => {
                console.error(`[ERROR] Failed to validate file evidence ${evidence._id}:`, error);
              });
          }, 100); // Small delay to not block the main thread
        }
      } catch (fileError) {
        console.error(`[ERROR] Processing file upload error:`, fileError);
        // Continue with other files even if one fails
      }
    }));
    
    res.status(201).json({
      success: true,
      message: `${evidenceList.length} evidence item(s) uploaded successfully`,
      data: evidenceList
    });
    
  } catch (error) {
    console.error('Upload evidence error:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading evidence',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get detailed information about a campaign
 */
export const getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('createdBy', 'fullName email')
      .populate('team')
      .populate('victims')
      .populate('evidence');

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all campaigns created by the currently authenticated user
 */
export const getUserCampaigns = async (req, res) => {
  console.log(`[INFO] User ${req.user._id} requested their campaigns`);
  try {
    // Extract query parameters for pagination and filtering
    const { 
      page = 1, 
      limit = 10, 
      status, 
      sort = 'createdAt', 
      order = 'desc',
      search
    } = req.query;

    // Build query filters
    const filter = { createdBy: req.user._id };
    
    // Add status filter if provided
    if (status) {
      if (Array.isArray(status)) {
        filter.status = { $in: status };
      } else {
        filter.status = status;
      }
    }
    
    // Add text search if provided
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' }},
        { description: { $regex: search, $options: 'i' }},
        { shortDescription: { $regex: search, $options: 'i' }},
        { tags: { $regex: search, $options: 'i' }}
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Determine sort order
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;
    
    // Execute query with pagination
    const campaigns = await Campaign.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('title shortDescription status creationStep creationComplete category coverImage updatedAt startDate endDate')
      .lean();
    
    // Get total count for pagination
    const totalCampaigns = await Campaign.countDocuments(filter);
    
    // Calculate pages
    const totalPages = Math.ceil(totalCampaigns / parseInt(limit));
    
    // Get some basic analytics
    const statusCounts = await Campaign.aggregate([
      { $match: { createdBy: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Format status counts into an object
    const statusAnalytics = {};
    statusCounts.forEach(item => {
      statusAnalytics[item._id] = item.count;
    });
    
    // Return paginated results with metadata
    res.json({
      success: true,
      data: campaigns,
      pagination: {
        total: totalCampaigns,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: totalPages,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      },
      analytics: {
        statusCounts: statusAnalytics,
        total: totalCampaigns
      }
    });
  } catch (error) {
    console.error(`[ERROR] Get user campaigns error: ${error.message}`, { 
      error, 
      userId: req.user?._id 
    });
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving user campaigns',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get all campaigns where user is a team member (but not creator)
 */
export const getTeamMemberCampaigns = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all campaign teams where user is a member
    const teams = await CampaignTeam.find({
      $or: [
        { 'leader.userId': userId },
        { 'coLeader.userId': userId },
        { 'socialMediaCoordinator.userId': userId },
        { 'volunteerCoordinator.userId': userId },
        { 'financeManager.userId': userId },
        { 'additionalMembers.userId': userId }
      ]
    }).select('campaign');
    
    // Extract campaign IDs
    const campaignIds = teams.map(team => team.campaign);
    
    // Get all these campaigns excluding ones created by the user
    const campaigns = await Campaign.find({
      _id: { $in: campaignIds },
      createdBy: { $ne: userId } // Exclude campaigns where user is the creator
    })
    .select('title shortDescription status category coverImage updatedAt createdBy')
    .populate('createdBy', 'fullName email')
    .lean();
    
    res.json({
      success: true,
      data: campaigns
    });
  } catch (error) {
    console.error(`[ERROR] Get team member campaigns error: ${error.message}`, { 
      error, 
      userId: req.user?._id 
    });
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving team member campaigns',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get campaign statistics for the user
 */
export const getUserCampaignStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get basic counts
    const campaignCounts = await Campaign.aggregate([
      { $match: { createdBy: userId } },
      { 
        $group: { 
          _id: null, 
          total: { $sum: 1 },
          active: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "active"] }, 1, 0] 
            } 
          },
          draft: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "draft"] }, 1, 0] 
            } 
          },
          completed: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0] 
            } 
          }
        } 
      }
    ]);
    
    // Get engagement metrics across all campaigns
    const engagementStats = await Campaign.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$engagementMetrics.views" },
          totalShares: { $sum: "$engagementMetrics.shares" },
          totalLikes: { $sum: "$engagementMetrics.likes" },
          totalComments: { $sum: "$engagementMetrics.comments" },
          totalSupporters: { $sum: "$engagementMetrics.supporters" },
          totalSignatures: { $sum: "$engagementMetrics.signatureCount" }
        }
      }
    ]);
    
    // Get most popular campaigns
    const popularCampaigns = await Campaign.find({ createdBy: userId })
      .sort({ "engagementMetrics.views": -1 })
      .limit(5)
      .select('title shortDescription engagementMetrics status')
      .lean();
    
    // Get recent team members across all campaigns
    const teamMembers = await CampaignTeam.aggregate([
      {
        $match: {
          "leader.userId": userId
        }
      },
      {
        $project: {
          campaign: 1,
          members: {
            $concatArrays: [
              [{ role: "coLeader", info: "$coLeader" }],
              [{ role: "socialMediaCoordinator", info: "$socialMediaCoordinator" }],
              [{ role: "volunteerCoordinator", info: "$volunteerCoordinator" }],
              [{ role: "financeManager", info: "$financeManager" }],
              {
                $map: {
                  input: "$additionalMembers",
                  as: "member",
                  in: {
                    role: { $ifNull: ["$$member.customRoleTitle", "$$member.role"] },
                    info: "$$member"
                  }
                }
              }
            ]
          }
        }
      },
      { $unwind: "$members" },
      { $match: { "members.info.userId": { $exists: true } } },
      { $sort: { "members.info.invitedAt": -1 } },
      { $limit: 10 },
      {
        $project: {
          campaign: 1,
          role: "$members.role",
          userId: "$members.info.userId",
          name: "$members.info.name",
          acceptedInvite: "$members.info.acceptedInvite",
          invitedAt: "$members.info.invitedAt"
        }
      }
    ]);
    
    // Construct the response
    const stats = {
      campaigns: campaignCounts.length > 0 ? campaignCounts[0] : { total: 0, active: 0, draft: 0, completed: 0 },
      engagement: engagementStats.length > 0 ? engagementStats[0] : { 
        totalViews: 0, totalShares: 0, totalLikes: 0, 
        totalComments: 0, totalSupporters: 0, totalSignatures: 0 
      },
      popularCampaigns,
      recentTeamMembers: teamMembers
    };
    
    // Remove _id from the stats objects
    if (stats.campaigns) delete stats.campaigns._id;
    if (stats.engagement) delete stats.engagement._id;
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error(`[ERROR] Get user campaign stats error: ${error.message}`, { 
      error, 
      userId: req.user?._id 
    });
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving campaign statistics',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get evidence for a campaign
 */
export const getCampaignEvidence = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    console.log(`[INFO] Getting evidence for campaign ${campaignId}`);
    
    if (!campaignId || !mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid campaign ID' 
      });
    }
    
    // Check if campaign exists
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        message: 'Campaign not found' 
      });
    }
    
    // Get evidence for this campaign
    const evidence = await CampaignEvidence.find({ campaign: campaignId })
      .sort({ createdAt: -1 });
    
    console.log(`[INFO] Found ${evidence.length} evidence items for campaign ${campaignId}`);
    
    return res.status(200).json({
      success: true,
      message: 'Evidence retrieved successfully',
      data: evidence
    });
  } catch (error) {
    console.error('Error fetching campaign evidence:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching campaign evidence',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Update campaign cover image - Fixed version
 */
export const updateCampaignCover = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid campaign ID format'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    // Verify campaign exists
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check user permission (only creator or team member with permission)
    const isCreator = campaign.createdBy.toString() === req.user._id.toString();
    
    // Check if user is a team member with appropriate permissions
    let isTeamMember = false;
    if (campaign.team) {
      const team = await CampaignTeam.findById(campaign.team);
      
      if (team) {
        if (team.leader && team.leader.userId && team.leader.userId.toString() === req.user._id.toString()) {
          isTeamMember = true;
        }
        
        if (team.coLeader && team.coLeader.userId && team.coLeader.userId.toString() === req.user._id.toString()) {
          isTeamMember = true;
        }
        
        if (team.additionalMembers && team.additionalMembers.length > 0) {
          const hasPermission = team.additionalMembers.some(member => 
            member.userId && 
            member.userId.toString() === req.user._id.toString() && 
            member.permissions && 
            member.permissions.canEditCampaign
          );
          
          if (hasPermission) {
            isTeamMember = true;
          }
        }
      }
    }
    
    if (!isCreator && !isTeamMember) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this campaign'
      });
    }

    // Upload to Cloudinary using the existing configuration
    let uploadResult;
    try {
      // Create upload stream - Fixed to use ES modules approach instead of require
      uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'campaign_covers',
            transformation: [
              { width: 1200, height: 630, crop: 'fill', quality: 'auto' }
            ],
            resource_type: 'auto'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        // Using the imported Readable stream from 'stream' module
        const readableStream = new Readable();
        readableStream.push(req.file.buffer);
        readableStream.push(null);
        readableStream.pipe(stream);
      });
      
      console.log('Cloudinary upload result:', uploadResult);
      
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      
      // Try Vercel Blob as fallback with fixed pathname parameter
      try {
        // Extract file extension from mimetype
        const fileExt = req.file.mimetype.split('/')[1] || 'jpg';
        const fileName = `campaign-cover-${campaignId}-${Date.now()}.${fileExt}`;
        
        const blobResult = await uploadToBlob(
          req.file.buffer, 
          {
            filename: fileName,
            contentType: req.file.mimetype,
            pathname: `/campaign_covers/${fileName}` // Add required pathname parameter
          }
        );
        
        uploadResult = { secure_url: blobResult.url };
        console.log('Vercel Blob upload result:', blobResult);
      } catch (blobError) {
        console.error('Vercel Blob upload error:', blobError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image to storage services'
        });
      }
    }

    // Update campaign with new cover URL
    campaign.coverImage = uploadResult.secure_url;
    await campaign.save();

    // Log successful update
    console.log(`[INFO] Campaign ${campaignId} cover image updated by user ${req.user._id}`);

    res.status(200).json({
      success: true,
      message: 'Cover image updated successfully',
      coverImage: campaign.coverImage
    });
    
  } catch (error) {
    console.error('Error updating cover image:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating cover image',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get all campaigns with filters
 * @route GET /api/campaigns
 */
export const getAllCampaigns = async (req, res) => {
  try {
    const { 
      category, 
      location, 
      status = 'active', 
      sort = 'recent',
      search,
      page = 1,
      limit = 10 
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Add filters if they exist
    if (category) filter.category = category;
    if (location) filter['location.type'] = location;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate skip for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Determine sort configuration
    let sortConfig = {};
    switch (sort) {
      case 'recent':
        sortConfig = { createdAt: -1 };
        break;
      case 'supporters':
        sortConfig = { 'engagementMetrics.supporters': -1 };
        break;
      case 'trending':
        sortConfig = { 'engagementMetrics.views': -1 };
        break;
      case 'endingSoon':
        sortConfig = { endDate: 1 };
        break;
      default:
        sortConfig = { createdAt: -1 };
    }

    // Get campaigns with pagination
    const campaigns = await Campaign.find(filter)
      .sort(sortConfig)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'fullName email')
      .populate('team', 'leader coLeader');

    // Get total count for pagination
    const total = await Campaign.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: campaigns,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching campaigns'
    });
  }
};