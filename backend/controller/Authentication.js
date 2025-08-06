import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Campaign from '../models/campaign.js';
import mongoose from 'mongoose';
import transporter from '../config/nodemailer.js'; // Import the configured transporter

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const SALT_ROUNDS = 10;

/**
 * Function to send verification email
 */
const sendVerificationEmail = async (email, fullName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'no-reply@civic-platform.com',
      to: email,
      subject: 'Welcome to Civic Platform - Verify Your Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="color: #333;">Welcome to Civic Platform, ${fullName}!</h2>
          <p>Thank you for joining our community of changemakers. We're excited to see the impact you'll make!</p>
          <p>Your account has been created successfully. You can now sign in and start exploring campaigns or create your own.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Explore Campaigns
            </a>
          </div>
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          <p>Best regards,<br>The Civic Platform Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error, just log it - we don't want email failure to break registration
  }
};

/**
 * Register a new user
 */
export const registerUser = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Create new user
    const newUser = new User({
      email,
      passwordHash,
      fullName,
      lastLogin: new Date(),
      loginCount: 1
    });
    
    await newUser.save();
    
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Send welcome email - using the imported transporter
    sendVerificationEmail(newUser.email, newUser.fullName);
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

/**
 * Login user
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Update login stats
    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.userId; 
    const user = await User.findById(userId)
      .select('-passwordHash') // Exclude password
      .populate('campaignsCreated', 'title shortDescription status')
      .populate('campaignsSupported', 'title shortDescription status')
      .populate('campaignsSigned', 'title shortDescription status');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile', error: error.message });
  }
};


export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.userId; // Get from params or auth token
    
    // Ensure user can only update their own profile unless admin
    if (req.params.id && req.params.id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }
    
    // Fields that users are allowed to update
    const {
      fullName,
      bio,
      location,
      socialMedia,
      interests,
      expertise,
      profilePicture,
      notificationSettings
    } = req.body;
    
    // Create update object with only provided fields
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (bio) updateData.bio = bio;
    if (location) updateData.location = location;
    if (socialMedia) updateData.socialMedia = socialMedia;
    if (interests) updateData.interests = interests;
    if (expertise) updateData.expertise = expertise;
    if (profilePicture) updateData.profilePicture = profilePicture;
    if (notificationSettings) updateData.notificationSettings = notificationSettings;
    
    // Update user with new data
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

/**
 * Change user password
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    // Update password
    user.passwordHash = passwordHash;
    await user.save();
    
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password', error: error.message });
  }
};

/**
 * Submit government ID for verification
 */
export const submitGovVerification = async (req, res) => {
  try {
    const { method, govId } = req.body;
    const userId = req.userId;
    
    // Validate verification method
    if (!['aadhaar', 'pan'].includes(method)) {
      return res.status(400).json({ message: 'Invalid verification method' });
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update verification details
    user.govVerification = {
      method,
      govId,
      isVerified: false 
    };
    
    await user.save();
    
    
    res.status(200).json({
      message: 'Verification details submitted successfully',
      status: 'pending'
    });
  } catch (error) {
    console.error('Gov verification error:', error);
    res.status(500).json({ message: 'Failed to submit verification', error: error.message });
  }
};


export const getUserActivity = async (req, res) => {
  try {
    const userId = req.params.id || req.userId;
    
    // Ensure user can only access their own activity unless admin
    if (req.params.id && req.params.id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this activity' });
    }
    
    const user = await User.findById(userId)
      .select('activityLog')
      .populate({
        path: 'activityLog.campaignId',
        select: 'title shortDescription'
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Sort activities by timestamp, newest first
    const sortedActivities = user.activityLog.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    res.status(200).json(sortedActivities);
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ message: 'Failed to get activity', error: error.message });
  }
};


/**
 * Delete user account
 */
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Optional: Require password confirmation for deletion
    const { password } = req.body;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (password) {
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Password is incorrect' });
      }
    }
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    // Here you might want to handle cleanup of user data:
    // - Remove user from campaign teams
    // - Handle or anonymize their campaign contributions
    // - etc.
    
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Failed to delete account', error: error.message });
  }
};




export const updateImpactScore = async (req, res) => {
  try {
    const userId = req.params.id || req.userId;
    
    // Only admins can update other users' impact scores
    if (req.params.id && req.params.id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this impact score' });
    }
    
    const user = await User.findById(userId)
      .populate('campaignsCreated')
      .populate('campaignsSupported')
      .populate('campaignsSigned');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate impact score based on various factors
    let impactScore = 0;
    
    // Campaigns created
    impactScore += user.campaignsCreated.length * 10;
    
    // Campaigns supported
    impactScore += user.campaignsSupported.length * 5;
    
    // Campaigns signed
    impactScore += user.campaignsSigned.length * 2;
    
    // Activity count
    impactScore += user.activityLog.length;
    
    // Adjust for verified status
    if (user.govVerification && user.govVerification.isVerified) {
      impactScore *= 1.2; // 20% bonus for verified users
    }
    
    // If expert in any field
    if (user.expertise && user.expertise.some(e => e.verified)) {
      impactScore *= 1.1; // 10% bonus for verified expertise
    }
    
    // Update user's impact score
    user.impactScore = Math.round(impactScore);
    await user.save();
    
    res.status(200).json({
      message: 'Impact score updated successfully',
      impactScore: user.impactScore
    });
  } catch (error) {
    console.error('Update impact score error:', error);
    res.status(500).json({ message: 'Failed to update impact score', error: error.message });
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal that the email doesn't exist
      return res.status(200).json({ message: 'If your email exists in our system, you will receive a password reset link' });
    }
    
    // Create reset token
    const resetToken = jwt.sign(
      { id: user._id },
      JWT_SECRET + user.passwordHash.substring(0, 10), // Add part of their password hash for extra security
      { expiresIn: '1h' }
    );
    
    // Email with reset link
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'no-reply@civic-platform.com',
      to: user.email,
      subject: 'Password Reset Request - Civic Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="color: #333;">Reset Your Password</h2>
          <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
          <p>To reset your password, click the button below:</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${resetUrl}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>Best regards,<br>The Civic Platform Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ message: 'If your email exists in our system, you will receive a password reset link' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process password reset request', error: error.message });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired reset token' });
    }
    
    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    // Update password
    user.passwordHash = passwordHash;
    await user.save();
    
    // Send confirmation email
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'no-reply@civic-platform.com',
      to: user.email,
      subject: 'Password Reset Successful - Civic Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="color: #333;">Password Reset Successful</h2>
          <p>Your password has been reset successfully.</p>
          <p>If you did not request this change, please contact our support team immediately.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Sign In
            </a>
          </div>
          <p>Best regards,<br>The Civic Platform Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
};


export default {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  submitGovVerification,
 
  getUserActivity,
  
  deleteAccount,
 
  updateImpactScore,
  forgotPassword,
  resetPassword
};