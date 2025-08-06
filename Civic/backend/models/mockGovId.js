import mongoose from 'mongoose';

const mockGovIdSchema = new mongoose.Schema({
  // Basic identifier informationnnnnnnn lol kar lo verify 
  idNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  idType: { 
    type: String, 
    enum: ['aadhaar', 'pan'], 
    required: true 
  },
  
  fullName: { 
    type: String, 
    required: true 
  },
  dateOfBirth: { 
    type: Date, 
    required: true 
  },
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other'] 
  },
  
  // Address information
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  
  // Verification status
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  // Mock verification data
  mockVerificationData: {
    hasValidAddress: { type: Boolean, default: true },
    hasValidAge: { type: Boolean, default: true },
    hasActiveStatus: { type: Boolean, default: true }
  },
  
  mockVerificationScenario: {
    type: String,
    enum: ['success', 'address_mismatch', 'expired', 'not_found', 'server_error'],
    default: 'success'
  },
  
  // Timestamps
  issuedDate: { 
    type: Date, 
    default: function() {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 5);
      return date;
    }
  },
  expiryDate: { 
    type: Date, 
    default: function() {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 5);
      return date;
    }
  },
  
  // For audit purposes
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

//indexinggggggggggggggggggggggggggggggggggggggggggg lol
mockGovIdSchema.index({ idNumber: 1, idType: 1 });

// Pre-save middleware to update the updatedAt field
mockGovIdSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to verify a user against this ID
mockGovIdSchema.methods.verifyUser = function(userData) {
  switch(this.mockVerificationScenario) {
    case 'success':
      return { success: true, message: 'Verification successful' };
    case 'address_mismatch':
      return { success: false, message: 'Address does not match records' };
    case 'expired':
      return { success: false, message: 'ID has expired' };
    case 'not_found':
      return { success: false, message: 'ID not found in database' };
    case 'server_error':
      return { success: false, message: 'Server error during verification' };
    default:
      return { success: true, message: 'Verification successful' };
  }
};

const MockGovId = mongoose.model('MockGovId', mockGovIdSchema);
export default MockGovId;