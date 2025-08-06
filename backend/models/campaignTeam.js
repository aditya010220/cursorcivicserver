import mongoose from 'mongoose';

const campaignTeamSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  
  // Team Lead (required)
  leader: {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
    name: String,
    email: String,
    phone: String,
    acceptedInvite: { 
      type: Boolean, 
      default: true 
    }, // Team lead is usually the creator
    joinedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  
  // Co-Leader (optional)
  coLeader: {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    name: String,
    email: String,
    phone: String,
    invitedAt: Date,
    acceptedInvite: { 
      type: Boolean, 
      default: false 
    },
    joinedAt: Date,
    permissions: {
      canEditCampaign: { type: Boolean, default: true },
      canPostUpdates: { type: Boolean, default: true },
      canManageTeam: { type: Boolean, default: false },
      canManageMedia: { type: Boolean, default: true }
    }
  },
  
  // Social Media Coordinator (optional)
  socialMediaCoordinator: {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    name: String,
    email: String,
    phone: String,
    invitedAt: Date,
    acceptedInvite: { 
      type: Boolean, 
      default: false 
    },
    joinedAt: Date,
    permissions: {
      canPostUpdates: { type: Boolean, default: true },
      canManageMedia: { type: Boolean, default: true }
    }
  },
  
  // Volunteer Coordinator (optional)
  volunteerCoordinator: {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    name: String,
    email: String,
    phone: String,
    invitedAt: Date,
    acceptedInvite: { 
      type: Boolean, 
      default: false 
    },
    joinedAt: Date,
    permissions: {
      canManageVolunteers: { type: Boolean, default: true }
    }
  },
  
  // Finance Manager (optional)
  financeManager: {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    name: String,
    email: String,
    phone: String,
    invitedAt: Date,
    acceptedInvite: { 
      type: Boolean, 
      default: false 
    },
    joinedAt: Date,
    permissions: {
      canManageFinances: { type: Boolean, default: true }
    }
  },
  
  // Additional team members (optional)
  additionalMembers: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    name: String,
    email: String,
    phone: String,
    role: { 
      type: String,
      enum: [
        'content-creator', 
        'local-organizer', 
        'outreach-coordinator', 
        'media-liaison',
        'researcher',
        'legal-advisor',
        'technical-support',
        'general-support'
      ]
    },
    customRoleTitle: String,
    invitedAt: Date,
    acceptedInvite: { 
      type: Boolean, 
      default: false 
    },
    joinedAt: Date,
    permissions: {
      canEditCampaign: { type: Boolean, default: false },
      canPostUpdates: { type: Boolean, default: false },
      canManageTeam: { type: Boolean, default: false },
      canManageMedia: { type: Boolean, default: false },
      canManageVolunteers: { type: Boolean, default: false },
      canManageFinances: { type: Boolean, default: false }
    }
  }],
  
  // Team communication
  communicationChannels: {
    email: String,
    slack: String,
    discord: String,
    whatsapp: String,
    telegram: String,
    other: [{
      platform: String,
      link: String
    }]
  },
  
  // Team activity
  meetingSchedule: String,
  nextMeeting: Date,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to update timestamps
campaignTeamSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for getting all team members
campaignTeamSchema.virtual('allMembers').get(function() {
  const members = [];
  
  if (this.leader && this.leader.userId) {
    members.push({
      userId: this.leader.userId,
      name: this.leader.name,
      role: 'leader',
      joined: this.leader.joinedAt
    });
  }
  
  if (this.coLeader && this.coLeader.userId && this.coLeader.acceptedInvite) {
    members.push({
      userId: this.coLeader.userId,
      name: this.coLeader.name,
      role: 'co-leader',
      joined: this.coLeader.joinedAt
    });
  }
  
  if (this.socialMediaCoordinator && this.socialMediaCoordinator.userId && this.socialMediaCoordinator.acceptedInvite) {
    members.push({
      userId: this.socialMediaCoordinator.userId,
      name: this.socialMediaCoordinator.name,
      role: 'social-media-coordinator',
      joined: this.socialMediaCoordinator.joinedAt
    });
  }
  
  if (this.volunteerCoordinator && this.volunteerCoordinator.userId && this.volunteerCoordinator.acceptedInvite) {
    members.push({
      userId: this.volunteerCoordinator.userId,
      name: this.volunteerCoordinator.name,
      role: 'volunteer-coordinator',
      joined: this.volunteerCoordinator.joinedAt
    });
  }
  
  if (this.financeManager && this.financeManager.userId && this.financeManager.acceptedInvite) {
    members.push({
      userId: this.financeManager.userId,
      name: this.financeManager.name,
      role: 'finance-manager',
      joined: this.financeManager.joinedAt
    });
  }
  
  if (this.additionalMembers && this.additionalMembers.length > 0) {
    this.additionalMembers.forEach(member => {
      if (member.userId && member.acceptedInvite) {
        members.push({
          userId: member.userId,
          name: member.name,
          role: member.customRoleTitle || member.role,
          joined: member.joinedAt
        });
      }
    });
  }
  
  return members;
});

const CampaignTeam = mongoose.model('CampaignTeam', campaignTeamSchema);
export default CampaignTeam;