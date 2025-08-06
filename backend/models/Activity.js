import mongoose from 'mongoose';

const campaignActivitySchema = new mongoose.Schema({
  // Basic identifiers
  campaignId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Campaign', 
    required: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // Activity details
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  // Media content
  media: [{
    type: { 
      type: String, 
      enum: ['image', 'video', 'document', 'link'], 
      required: true 
    },
    url: { 
      type: String, 
      required: true 
    },
    caption: String,
    uploadedAt: { 
      type: Date, 
      default: Date.now 
    }
  }],

  // Activity status and scheduling
  status: { 
    type: String, 
    enum: ['planned', 'in-progress', 'completed', 'cancelled'], 
    default: 'planned' 
  },
  scheduledDate: Date,
  completedDate: Date,
  
  // Location information
  location: {
    name: String,
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    isVirtual: { type: Boolean, default: false }
  },

  // Impact data
  impact: {
    peopleImpacted: Number,
    resourcesUsed: String,
    costInvolved: Number,
    donationsReceived: Number,
    volunteerHours: Number,
    mediaReach: Number,
    outcomes: [String],
    evidenceLinks: [String], 
    testimonials: [{
      content: String,
      source: String,
      date: Date
    }],
    customFields: mongoose.Schema.Types.Mixed,
  },

  // Categorization
  tags: [String],
  type: { 
    type: String, 
    enum: [
      'event', 
      'milestone', 
      'update', 
      'incident', 
      'donation', 
      'protest', 
      'meeting', 
      'media_coverage', 
      'policy_change',
      'legal_action',
      'volunteer_activity'
    ], 
    default: 'update' 
  },
  
  // Engagement
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String,
    attendance: { type: Boolean, default: false },
    contributionNotes: String
  }],
  
  // For events
  eventDetails: {
    startTime: Date,
    endTime: Date,
    maxParticipants: Number,
    registeredParticipants: { type: Number, default: 0 },
    requiresRegistration: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: true }
  },
  
  // For donations
  donationDetails: {
    amount: Number,
    currency: { type: String, default: 'INR' },
    donor: {
      name: String,
      isAnonymous: { type: Boolean, default: false }
    },
    purpose: String,
    receipt: {
      id: String,
      url: String,
      issuedAt: Date
    }
  },
  
  // For media coverage
  mediaCoverage: {
    source: String,
    url: String,
    type: { type: String, enum: ['article', 'video', 'audio', 'social'] },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
    reach: Number, // Estimated audience reach
    highlights: [String]
  },
  
  // For milestones
  milestoneDetails: {
    targetValue: Number,
    achievedValue: Number,
    metricType: String, // e.g., "signatures", "donations", "participants"
    isAchieved: { type: Boolean, default: false },
    achievedOn: Date
  },
  
  // Visibility settings
  visibility: {
    isPublic: { type: Boolean, default: true },
    showOnTimeline: { type: Boolean, default: true },
    showInReports: { type: Boolean, default: true },
    notifyFollowers: { type: Boolean, default: false }
  },
  
  // Related activities
  relatedActivities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CampaignActivity' }],
  
  // Comments on this activity
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now },
    isHidden: { type: Boolean, default: false }
  }],
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to update timestamps
campaignActivitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for efficient querying
campaignActivitySchema.index({ campaignId: 1, createdAt: -1 });
campaignActivitySchema.index({ type: 1 });
campaignActivitySchema.index({ tags: 1 });
campaignActivitySchema.index({ 'location.city': 1, 'location.state': 1 });
campaignActivitySchema.index({ 'eventDetails.startTime': 1 });

// Method to check if an activity is upcoming
campaignActivitySchema.methods.isUpcoming = function() {
  if (this.type === 'event' && this.eventDetails && this.eventDetails.startTime) {
    return new Date(this.eventDetails.startTime) > new Date();
  }
  return false;
};

// Method to calculate activity impact score
campaignActivitySchema.methods.calculateImpactScore = function() {
  let score = 0;
  
  // Base score by type
  const typeScores = {
    'event': 10,
    'milestone': 15,
    'update': 5,
    'incident': 8,
    'donation': 7,
    'protest': 12,
    'meeting': 5,
    'media_coverage': 10,
    'policy_change': 20,
    'legal_action': 15,
    'volunteer_activity': 8
  };
  
  score += typeScores[this.type] || 5;
  
  // Add impact factors
  if (this.impact) {
    if (this.impact.peopleImpacted) score += Math.min(this.impact.peopleImpacted / 100, 20);
    if (this.impact.mediaReach) score += Math.min(this.impact.mediaReach / 1000, 15);
    if (this.impact.volunteerHours) score += Math.min(this.impact.volunteerHours / 10, 10);
    if (this.impact.testimonials && this.impact.testimonials.length) {
      score += Math.min(this.impact.testimonials.length * 2, 10);
    }
  }
  
  // Consider participants
  if (this.participants && this.participants.length) {
    score += Math.min(this.participants.length, 15);
  }
  
  // Media content bonus
  if (this.media && this.media.length) {
    score += Math.min(this.media.length * 3, 15);
  }
  
  return score;
};

const CampaignActivity = mongoose.model('CampaignActivity', campaignActivitySchema);
export default CampaignActivity;