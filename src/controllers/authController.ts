import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import { OTPService } from '../services/otpService';
import { tokenBlacklist } from '../middleware/authMiddleware';

// Send OTP for signup/login
export const sendOTP = async (req: Request, res: Response) => {
  let { mobile } = req.body;

  try {
    console.log('Received sendOTP request:', req.body);

    if (!mobile) {
      console.log('Mobile number is missing');
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    // Normalize mobile number - remove spaces and format consistently
    mobile = mobile.replace(/[\s\-\(\)]/g, '');
    console.log('Normalized mobile:', mobile);
    
    // Validate Indian mobile number format
    if (!/^(\+91|91)?[6-9]\d{9}$/.test(mobile)) {
      console.log('Invalid mobile number format:', mobile);
      return res.status(400).json({ error: 'Please enter a valid Indian mobile number' });
    }

    // Ensure consistent storage format (without country code for database)
    const normalizedMobile = mobile.replace(/^(\+91|91)/, '');
    console.log('Final normalized mobile for DB:', normalizedMobile);

    const otp = OTPService.generateOTP();
    const otpExpiry = OTPService.getOTPExpiry();
    console.log('Generated OTP:', otp);

    // Check if user exists
    let user = await User.findOne({ mobile: normalizedMobile });
    console.log('Existing user found:', !!user);

    if (user) {
      // Update existing user with new OTP
      user.otp = otp;
      user.otpExpiry = otpExpiry;

      // Only set fullName if it's provided and not already set
      if (!user.fullName && req.body.fullName) {
        user.fullName = req.body.fullName;
      }

      await user.save();
      console.log('Updated existing user with new OTP');
    } else {
      // Create new user with OTP and make sure fullName is handled
      user = new User({
        mobile: normalizedMobile,
        otp,
        otpExpiry,
        isVerified: false,
        fullName: req.body.fullName || undefined, // Use undefined instead of null
      });
      await user.save();
      console.log('Created new user with OTP');
    }

    // Send OTP via SMS (this will add +91 automatically)
    console.log('Attempting to send OTP via SMS...');
    const otpSent = await OTPService.sendOTP(normalizedMobile, otp);
    console.log('OTP sent result:', otpSent);
    console.log('Twilio response:', otpSent);

    if (!otpSent) {
      console.log('Failed to send OTP via SMS');
      return res.status(500).json({ error: 'Failed to send OTP' });
    }

    console.log('OTP sent successfully');
    res.status(200).json({
      message: 'OTP sent successfully',
      userId: user._id,
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};


// Verify OTP and complete signup/login
export const verifyOTP = async (req: Request, res: Response) => {
  let { mobile, otp, fullName } = req.body;

  try {
    if (!mobile || !otp) {
      return res.status(400).json({ error: 'Mobile number and OTP are required' });
    }

    // Normalize mobile number - same as in sendOTP
    mobile = mobile.replace(/[\s\-\(\)]/g, '');
    const normalizedMobile = mobile.replace(/^(\+91|91)/, '');

    // Find user by mobile number
    const user = await User.findOne({ mobile: normalizedMobile });
    
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Verify OTP using Twilio Verify API
    console.log('Verifying OTP with Twilio Verify API...');
    const isValidOTP = await OTPService.verifyOTPWithTwilio(normalizedMobile, otp);
    
    if (!isValidOTP) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Update user verification status
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    
    // If fullName is provided (signup), update it
    if (fullName && !user.fullName) {
      user.fullName = fullName;
    }
    
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, mobile: user.mobile },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        mobile: user.mobile,
        balance: user.balance,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Resend OTP
export const resendOTP = async (req: Request, res: Response) => {
  let { mobile } = req.body;

  try {
    if (!mobile) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    // Normalize mobile number - same as in sendOTP
    mobile = mobile.replace(/[\s\-\(\)]/g, '');
    const normalizedMobile = mobile.replace(/^(\+91|91)/, '');

    // Find user by mobile number
    const user = await User.findOne({ mobile: normalizedMobile });
    
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Generate new OTP
    const otp = OTPService.generateOTP();
    const otpExpiry = OTPService.getOTPExpiry();

    // Update user with new OTP
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP via SMS
    const otpSent = await OTPService.sendOTP(normalizedMobile, otp);
    
    if (!otpSent) {
      return res.status(500).json({ error: 'Failed to send OTP' });
    }

    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Logout
export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
  if (tokenBlacklist.has(token)) {
    return res.status(200).json({ message: 'Already logged out' });
  }
  tokenBlacklist.add(token);
}

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId).select('-otp -otpExpiry');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        fullName: user.fullName,
        mobile: user.mobile,
        balance: user.balance,
        isVerified: user.isVerified,
        language: user.language,
      },
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
