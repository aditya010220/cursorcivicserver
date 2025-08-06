import mongoose from 'mongoose';

const campaignVictimSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },

  picture: {
    type: String, // URL to the victim's picture  
  },
  
  // Victim identity
  name: {
    type: String,
    required: true
  },
  age: Number,
  gender: {
    type: String,
    enum: ['male', 'female', 'non-binary', 'prefer-not-to-say', 'other']
  },
  
  // Contact information (optional, may be sensitive)
  contactInformation: {
    email: String,
    phone: String,
    address: String,
    isPublic: { 
      type: Boolean, 
      default: false 
    } // Whether contact info can be displayed publicly
  },
  
  // Victim's relationship to campaign
  relationshipToCampaign: {
    type: String,
    enum: [
      'direct-victim', 
      'family-member', 
      'witness', 
      'community-member',
      'advocate'
    ],
    required: true
  },
  
  // Description of impact or involvement
  impactDescription: {
    type: String,
    required: true,
    maxlength: 5000
  },
  
  // Evidence related specifically to this victim
  evidence: [{
    type: { 
      type: String, 
      enum: ['image', 'video', 'document', 'audio', 'testimonial'] 
    },
    url: String, // For media files
    content: String, // For testimonials or text evidence
    description: String,
    isVerified: { 
      type: Boolean, 
      default: false 
    },
    verifiedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    verifiedAt: Date,
    isPublic: { 
      type: Boolean, 
      default: false 
    } // Whether this evidence can be shown publicly
  }],
  
  // Consent and privacy
  hasConsented: {
    type: Boolean,
    required: true,
    default: false
  },
  consentProof: {
    type: String, // URL to consent document or description
    default: null
  },
  privacyLevel: {
    type: String,
    enum: ['public', 'anonymous', 'private'],
    default: 'anonymous'
  },
  
  // For anonymous victims, we might still need some identifier
  anonymousIdentifier: String,
  
  // Status of the victim within the campaign
  status: {
    type: String,
    enum: ['pending-verification', 'verified', 'disputed'],
    default: 'pending-verification'
  },
  
  // Additional medical, legal, or support information
  medicalInformation: String,
  legalStatus: String,
  supportReceived: String,
  supportNeeded: String,
  
  // Timestamps
  addedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to update timestamps
campaignVictimSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual to get a display name based on privacy settings
campaignVictimSchema.virtual('displayName').get(function() {
  if (this.privacyLevel === 'public') {
    return this.name;
  } else if (this.privacyLevel === 'anonymous') {
    return `Anonymous ${this.anonymousIdentifier || 'Victim'}`;
  } else {
    return 'Protected Identity';
  }
});

const CampaignVictim = mongoose.model('CampaignVictim', campaignVictimSchema);
export default CampaignVictim;