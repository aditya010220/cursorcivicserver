import mongoose from 'mongoose';

const campaignPollSchema = new mongoose.Schema({
  // Reference to campaign
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
    index: true
  },
  // Poll details
  title: {
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000
  },
  options: [{
    text: {
      type: String,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  }],
  // Dates
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  // Creator
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Status tracking
  isActive: {
    type: Boolean,
    default: true
  },
  // Vote tracking - stores individual votes
  votes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    optionIndex: {
      type: Number,
      required: true
    },
    votedAt: {
      type: Date,
      default: Date.now
    },
    ipAddress: String
  }],
  // Vote counts - for quick access
  voteCounts: [{
    optionIndex: Number,
    count: {
      type: Number,
      default: 0
    }
  }],
  totalVotes: {
    type: Number,
    default: 0
  },
  // Tags for searching/filtering
  tags: [String],
  // Visibility
  isPublic: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Indexes
campaignPollSchema.index({ campaignId: 1, createdAt: -1 });
campaignPollSchema.index({ isActive: 1, endTime: 1 });

const CampaignPoll = mongoose.models.CampaignPoll || mongoose.model('CampaignPoll', campaignPollSchema);

export default CampaignPoll;