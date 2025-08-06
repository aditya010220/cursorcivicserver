import CampaignVictim from '../models/CompaignVictim.js';
import Campaign from '../models/Campaign.js';
import mongoose from 'mongoose';
import { uploadToBlob } from '../config/vercelBlob.js'; // Import the blob upload utility
import multer from 'multer';

// Configure multer for memory storage
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('victimImage');

// Create a new victim with image upload support
export const createVictim = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user._id;
    
    console.log('Creating victim:', req.body);
    
    // Validate campaign ID
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }

    // Check if campaign exists and user has permission
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Process uploaded image if any
    let imageUrl = null;
    if (req.file) {
      try {
        const blob = await uploadToBlob(req.file, {
          access: 'public',
          addRandomSuffix: true,
          folder: `campaigns/${campaignId}/victims`
        });
        
        imageUrl = blob.url;
        console.log('Image uploaded:', imageUrl);
      } catch (uploadError) {
        console.error('Error uploading victim image:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Error uploading victim image'
        });
      }
    }

    // Create new victim document
    const victimData = {
      ...req.body,
      campaign: campaignId,
      picture: imageUrl, // Add the image URL
      anonymousIdentifier: req.body.privacyLevel === 'anonymous' 
        ? `Victim-${Date.now().toString(36)}` 
        : undefined
    };

    const victim = new CampaignVictim(victimData);
    await victim.save();

    // Update campaign with new victim
    await Campaign.findByIdAndUpdate(
      campaignId,
      { $push: { victims: victim._id } }
    );

    res.status(201).json({
      success: true,
      data: victim
    });

  } catch (error) {
    console.error('Error creating victim:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating victim'
    });
  }
};

// Get all victims for a campaign
export const getCampaignVictims = async (req, res) => {
  try {
    const { campaignId } = req.params;
    console.log('Request params:', req.params);
    console.log('Fetching victims for campaign:', campaignId);

    // Validate campaign ID
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid campaign ID format',
        receivedId: campaignId
      });
    }

    // Build query
    const query = { campaign: campaignId };
    console.log('Query:', query);

    const victims = await CampaignVictim.find(query)
      .select('-contactInformation')
      .sort('-addedAt');

    console.log('Found victims:', victims.length);

    res.status(200).json({
      success: true,
      count: victims.length,
      data: victims
    });

  } catch (error) {
    console.error('Error in getCampaignVictims:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching victims',
      error: error.toString()
    });
  }
};

// Get single victim details
export const getVictimDetails = async (req, res) => {
  try {
    const { campaignId, victimId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(campaignId) || 
        !mongoose.Types.ObjectId.isValid(victimId)) {
      return res.status(400).json({ message: 'Invalid ID provided' });
    }

    const victim = await CampaignVictim.findOne({
      _id: victimId,
      campaign: campaignId
    });

    if (!victim) {
      return res.status(404).json({ message: 'Victim not found' });
    }

    // Check if user has permission to view sensitive information
    const canViewSensitive = req.user && (
      campaign.team.includes(req.user._id) || 
      campaign.creator.equals(req.user._id)
    );

    // Remove sensitive information if necessary
    if (!canViewSensitive) {
      victim.contactInformation = undefined;
    }

    res.status(200).json({
      success: true,
      data: victim
    });

  } catch (error) {
    console.error('Error fetching victim details:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching victim details'
    });
  }
};

// Update victim with image support
export const updateVictim = async (req, res) => {
  try {
    const { campaignId, victimId } = req.params;
    const updateData = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(campaignId) || 
        !mongoose.Types.ObjectId.isValid(victimId)) {
      return res.status(400).json({ message: 'Invalid ID provided' });
    }

    // Process uploaded image if any
    if (req.file) {
      try {
        const blob = await uploadToBlob(req.file, {
          access: 'public',
          addRandomSuffix: true,
          folder: `campaigns/${campaignId}/victims`
        });
        
        updateData.picture = blob.url;
      } catch (uploadError) {
        console.error('Error uploading victim image:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Error uploading victim image'
        });
      }
    }

    const victim = await CampaignVictim.findOneAndUpdate(
      { _id: victimId, campaign: campaignId },
      { 
        ...updateData,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!victim) {
      return res.status(404).json({ message: 'Victim not found' });
    }

    res.status(200).json({
      success: true,
      data: victim
    });

  } catch (error) {
    console.error('Error updating victim:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating victim'
    });
  }
};

// Delete victim
export const deleteVictim = async (req, res) => {
  try {
    const { campaignId, victimId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(campaignId) || 
        !mongoose.Types.ObjectId.isValid(victimId)) {
      return res.status(400).json({ message: 'Invalid ID provided' });
    }

    const victim = await CampaignVictim.findOneAndDelete({
      _id: victimId,
      campaign: campaignId
    });

    if (!victim) {
      return res.status(404).json({ message: 'Victim not found' });
    }

    // Remove victim from campaign
    await Campaign.findByIdAndUpdate(
      campaignId,
      { $pull: { victims: victimId } }
    );

    res.status(200).json({
      success: true,
      message: 'Victim deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting victim:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting victim'
    });
  }
};

// Update victim status
export const updateVictimStatus = async (req, res) => {
  try {
    const { campaignId, victimId } = req.params;
    const { status } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(campaignId) || 
        !mongoose.Types.ObjectId.isValid(victimId)) {
      return res.status(400).json({ message: 'Invalid ID provided' });
    }

    const victim = await CampaignVictim.findOneAndUpdate(
      { _id: victimId, campaign: campaignId },
      { 
        status,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!victim) {
      return res.status(404).json({ message: 'Victim not found' });
    }

    res.status(200).json({
      success: true,
      data: victim
    });

  } catch (error) {
    console.error('Error updating victim status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating victim status'
    });
  }
};