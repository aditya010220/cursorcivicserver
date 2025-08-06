import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  // Basic campaign information (Step 1)
  title: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 100
  },
  description: { 
    type: String, 
    required: true,
    maxlength: 5000
  },
  shortDescription: {
    type: String,
    maxlength: 200,
    required: true
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    
    
    ref: 'User',
    required: true 
  },
  category: { 
    type: String, 
    required: true,
    enum: [
      'environment', 'education', 'healthcare', 'human-rights', 
      'animal-welfare', 'poverty', 'equality', 'infrastructure', 
      'governance', 'public-safety', 'other'
    ]
  },
  tags: [String],
  startDate: { 
    type: Date, 
    default: Date.now 
  },
  endDate: Date,
  
  // Campaign status and creation progress tracking
  status: { 
    type: String, 
    enum: ['draft', 'active', 'completed', 'archived', 'rejected'], 
    default: 'draft' 
  },
  creationStep: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    default: 1
  },
  creationComplete: {
    type: Boolean,
    default: false
  },
  
  // Team management (Step 2)
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CampaignTeam'
  },
  
  // Victims information (Step 3)
  hasVictims: {
    type: Boolean,
    default: false
  },
  victims: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CampaignVictim'
  }],
  
  // Evidence and proof (Step 4)
  evidenceType: {
    type: String,
    enum: ['photos', 'videos', 'documents', 'testimonial', 'mixed'],
    default: 'mixed'
  },
  
  // Reference to evidence documents
  evidence: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CampaignEvidence'
  }],

  // Media content
  coverImage: { 
    type: String, // URL to image
    default: null
  },
  mediaGallery: [{
    type: { 
      type: String, 
      enum: ['image', 'video', 'document', 'audio'], 
      required: true 
    },
    url: { 
      type: String, 
      required: true 
    },
    caption: String,
    description: String,
    mimeType: String,
    fileSize: Number,
    order: { 
      type: Number, 
      default: 0 
    }, 
    uploadedAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  
  // Location information
  location: {
    type: {
      type: String,
      enum: ['local', 'state', 'national', 'international'],
      default: 'local'
    },
    city: String,
    state: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    radius: Number // Approximate radius of impact in km
  },

  // Verification and moderation
  isVerified: { type: Boolean, default: false },
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  moderationStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  moderationNotes: String,
  
  // Engagement metrics
  engagementMetrics: {
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    supporters: { type: Number, default: 0 },
    signatureCount: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 } // Percentage of viewers who signed
  },

  // Impact assessment
  impactReport: {
    goal: String,
    targetSignatures: Number,
    outcomeSummary: String,
    numberOfPeopleImpacted: Number,
    mediaLinks: [String],
    officialResponses: [{
      from: String, // e.g., "Ministry of Environment"
      responseType: { 
        type: String, 
        enum: ['acknowledgment', 'in-progress', 'resolved', 'rejected'] 
      },
      responseDate: Date,
      responseContent: String,
      documentLinks: [String]
    }]
  },

  // Campaign activities
  activities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CampaignActivity' }],
  
  // Resources
  resources: [{
    title: String,
    description: String,
    type: { 
      type: String, 
      enum: ['link', 'document', 'image', 'video'] 
    },
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Updates
  updates: [{
    title: String,
    content: String,
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    postedAt: { type: Date, default: Date.now },
    mediaLinks: [String]
  }],
  
  // Communication and social
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    postedAt: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
    isHidden: { type: Boolean, default: false }
  }],
  
  // Supporters - users who have signed or actively supported
  supporters: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    supportType: { 
      type: String, 
      enum: ['signature', 'donation', 'volunteer', 'share', 'participation'] 
    },
    supportedAt: { type: Date, default: Date.now },
    isAnonymous: { type: Boolean, default: false },
    message: String // Optional message of support
  }],

  polls: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'CampaignPoll'
}],
  
  // Brand Support & Sponsorships
  brandSupport: [{
    brandName: { 
      type: String, 
      required: true 
    },
    brandLogo: String, // URL to brand logo
    website: String,
    supportType: { 
      type: String, 
      enum: ['endorsement', 'sponsorship', 'partnership', 'resource_provider', 'media_partner'],
      required: true 
    },
    supportDetails: String, // Description of how the brand is supporting
    supportLevel: { 
      type: String, 
      enum: ['platinum', 'gold', 'silver', 'bronze', 'standard'],
      default: 'standard' 
    },
    contributionAmount: Number, // Optional financial contribution
    isVerified: { 
      type: Boolean, 
      default: false 
    }, // Admin verification of brand support
    verifiedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    contactPerson: {
      name: String,
      email: String,
      phone: String,
      position: String
    },
    startDate: { 
      type: Date, 
      default: Date.now 
    },
    endDate: Date, // Optional end date for the support
    isPublic: { 
      type: Boolean, 
      default: true 
    }, // Whether to display this support publicly
    resources: [{ 
      type: String,
      enum: ['financial', 'products', 'services', 'expertise', 'media', 'network', 'venue', 'equipment'],
    }], // Types of resources provided
    testimonial: String, // Brand statement about why they support
    impactGoals: [String], // What the brand hopes to achieve
    displayOrder: { 
      type: Number, 
      default: 0 
    } // For controlling display order of brands
  }],
  
  // Success metrics
  targetGoal: {
    type: String,
    enum: ['signatures', 'awareness', 'policy_change', 'fundraising', 'volunteer_recruitment'],
    default: 'signatures'
  },
  targetNumber: { type: Number, default: 1000 }, // e.g., number of signatures needed
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  // Featured status
  isFeatured: { type: Boolean, default: false },
  featuredUntil: Date
});

// Indexing
campaignSchema.index({ title: 'text', description: 'text', tags: 'text' });
campaignSchema.index({ status: 1, createdAt: -1 });
campaignSchema.index({ 'location.city': 1, 'location.state': 1, 'location.country': 1 });
campaignSchema.index({ category: 1 });
campaignSchema.index({ createdBy: 1 });
campaignSchema.index({ creationStep: 1, creationComplete: 1 });

// // Pre-save middleware to update timestamps
// campaignSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

// Virtual for calculating progress percentage
campaignSchema.virtual('progressPercentage').get(function() {
  if (!this.targetNumber || this.targetNumber === 0) return 0;
  
  let currentNumber = 0;
  switch(this.targetGoal) {
    case 'signatures':
      currentNumber = this.engagementMetrics.signatureCount;
      break;
    case 'awareness':
      currentNumber = this.engagementMetrics.views;
      break;
    default:
      currentNumber = 0;
  }
  
  return Math.min(Math.round((currentNumber / this.targetNumber) * 100), 100);
});

// Method to check if a campaign is trending
campaignSchema.methods.isTrending = function() {
  const daysSinceCreation = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  
  if (daysSinceCreation > 30) return false; // Only recent campaigns can trend
  
  const engagementScore = 
    this.engagementMetrics.views * 0.1 + 
    this.engagementMetrics.shares * 2 + 
    this.engagementMetrics.likes * 1 + 
    this.engagementMetrics.comments * 3 +
    this.engagementMetrics.supporters * 5;
  
  // Add brand support boost
  const brandBoost = this.brandSupport && this.brandSupport.length ? 
    this.brandSupport.length * 10 : 0; // Each brand adds significant boost
  
  return (engagementScore + brandBoost) / daysSinceCreation > 100;
};

// Check if the model already exists before defining it
const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);

export default Campaign;