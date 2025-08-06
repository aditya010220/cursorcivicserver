import mongoose from 'mongoose';

const campaignEvidenceSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  
  // Evidence classification
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    maxlength: 1000
  },
  
  // Type of evidence
  evidenceType: {
    type: String,
    enum: ['photo', 'video', 'document', 'audio', 'testimonial', 'official_record', 'news_article', 'social_media'],
    required: true
  },
  
  // Source of the evidence
  source: {
    type: String,
    enum: ['victim', 'witness', 'official', 'media', 'investigation', 'self_collected', 'other'],
    required: true
  },
  
  // Date when the evidence was collected/created
  dateCollected: {
    type: Date,
    default: Date.now
  },
  
  // Location where the evidence was collected/created
  locationCollected: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Media file attributes
  mediaFile: {
    url: String, // URL to stored file
    fileName: String,
    fileSize: Number, // in bytes
    fileType: String, // MIME type
    dimensions: {
      width: Number,
      height: Number
    },
    duration: Number, // For video/audio in seconds
    thumbnailUrl: String // For videos
  },
  
  // For testimonial type evidence
  testimonialContent: {
    type: String,
    maxlength: 10000
  },
  
  // For document type evidence
  documentDetails: {
    documentType: {
      type: String,
      enum: ['official_report', 'court_document', 'medical_record', 'police_report', 
             'scientific_study', 'contract', 'correspondence', 'other']
    },
    issuer: String,
    referenceNumber: String,
    numberOfPages: Number
  },
  
  // For news article or social media evidence
  externalSource: {
    sourceName: String, // e.g., "New York Times" or "Twitter"
    sourceUrl: String,
    authorName: String,
    publicationDate: Date
  },
  
  // Evidence permissions and verification
  permissions: {
    isPublic: {
      type: Boolean,
      default: true // Whether this evidence can be publicly displayed
    },
    restrictedTo: [{
      type: String,
      enum: ['team_members', 'authorities', 'researchers', 'supporters']
    }]
  },
  
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verificationDate: Date,
    verificationMethod: {
      type: String,
      enum: ['expert_review', 'cross_reference', 'official_confirmation', 'technical_analysis', 'other']
    },
    verificationNotes: String
  },
  
  // Related victim(s) if this evidence is connected to specific victims
  relatedVictims: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CampaignVictim'
  }],
  
  // Evidence relevance and status
  relevanceRating: {
    type: Number,
    min: 1,
    max: 10
  },
  
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'accepted', 'rejected', 'pending_more_info', 'pending_verification'],
    default: 'submitted'
  },
  
  reviewNotes: String,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  // Added by which team member
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Pre-save middleware to update timestamps
campaignEvidenceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if evidence is suitable for public display
campaignEvidenceSchema.methods.isSuitableForPublic = function() {
  // Logic to determine if evidence is suitable for public viewing
  // based on content, verification status, etc.
  if (!this.permissions.isPublic) return false;
  
  // Don't show sensitive victim-related evidence unless verified
  if (this.relatedVictims && this.relatedVictims.length > 0 && !this.verification.isVerified) {
    return false;
  }
  
  // Always require verification for certain types of evidence
  if (['medical_record', 'police_report', 'court_document'].includes(this.documentDetails?.documentType) 
      && !this.verification.isVerified) {
    return false;
  }
  
  return true;
};

// Virtual for getting a preview or thumbnail version
campaignEvidenceSchema.virtual('preview').get(function() {
  switch(this.evidenceType) {
    case 'photo':
      return this.mediaFile.url;
    case 'video':
      return this.mediaFile.thumbnailUrl || this.mediaFile.url;
    case 'document':
      return null; // Could return a document icon or first page preview
    case 'testimonial':
      return this.testimonialContent.substring(0, 150) + '...';
    case 'news_article':
      return this.externalSource.sourceUrl;
    default:
      return null;
  }
});

// Compound index for efficient querying
campaignEvidenceSchema.index({ campaign: 1, evidenceType: 1, createdAt: -1 });
campaignEvidenceSchema.index({ campaign: 1, status: 1 });
campaignEvidenceSchema.index({ addedBy: 1 });

const CampaignEvidence = mongoose.model('CampaignEvidence', campaignEvidenceSchema);
export default CampaignEvidence;