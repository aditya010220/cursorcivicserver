import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ['user', 'campaign_creator', 'admin'], default: 'user' },
  
  // Profile information
  profilePicture: { 
    type: String, 
    default: null, 
    
  },

  bio: { type: String, maxlength: 500 },
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Social media links
  socialMedia: {
    twitter: String,
    facebook: String,
    instagram: String,
    linkedin: String
  },

  govVerification: {
    isVerified: { type: Boolean, default: false },
    method: { type: String, enum: ['aadhaar', 'pan', null], default: null },
    govId: { type: String, default: null },
  },

  // Activity tracking
  campaignsCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' }],
  campaignsSupported: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' }],
  campaignsSigned: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' }],
  
  // Engagement metrics
  activityLog: [{
    action: { type: String, enum: ['create', 'sign', 'comment', 'share', 'donate', 'support'] },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    timestamp: { type: Date, default: Date.now }
  }],
  
  notificationSettings: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    campaignUpdates: { type: Boolean, default: true },
    newCampaigns: { type: Boolean, default: true }
  },
  
  impactScore: { type: Number, default: 0 }, 
  lastLogin: Date,
  loginCount: { type: Number, default: 0 },

  preferences: [String],
  followersCount: { type: Number, default: 0 },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Tags/causes user is interested in
  interests: [String],
  
  // User's credentials/expertise that might be relevant to campaigns
  expertise: [{
    field: String,
    description: String,
    verified: { type: Boolean, default: false }
  }],

  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
export default User;