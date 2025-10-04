"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.logout = exports.resendOTP = exports.verifyOTP = exports.sendOTP = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const otpService_1 = require("../services/otpService");
const authMiddleware_1 = require("../middleware/authMiddleware");
const sendOTP = async (req, res) => {
    let { mobile } = req.body;
    try {
        console.log('Received sendOTP request:', req.body);
        if (!mobile) {
            console.log('Mobile number is missing');
            return res.status(400).json({ error: 'Mobile number is required' });
        }
        mobile = mobile.replace(/[\s\-\(\)]/g, '');
        console.log('Normalized mobile:', mobile);
        if (!/^(\+91|91)?[6-9]\d{9}$/.test(mobile)) {
            console.log('Invalid mobile number format:', mobile);
            return res.status(400).json({ error: 'Please enter a valid Indian mobile number' });
        }
        const normalizedMobile = mobile.replace(/^(\+91|91)/, '');
        console.log('Final normalized mobile for DB:', normalizedMobile);
        const otp = otpService_1.OTPService.generateOTP();
        const otpExpiry = otpService_1.OTPService.getOTPExpiry();
        console.log('Generated OTP:', otp);
        let user = await user_1.default.findOne({ mobile: normalizedMobile });
        console.log('Existing user found:', !!user);
        if (user) {
            user.otp = otp;
            user.otpExpiry = otpExpiry;
            if (!user.fullName && req.body.fullName) {
                user.fullName = req.body.fullName;
            }
            await user.save();
            console.log('Updated existing user with new OTP');
        }
        else {
            user = new user_1.default({
                mobile: normalizedMobile,
                otp,
                otpExpiry,
                isVerified: false,
                fullName: req.body.fullName || undefined,
            });
            await user.save();
            console.log('Created new user with OTP');
        }
        console.log('Attempting to send OTP via SMS...');
        const otpSent = await otpService_1.OTPService.sendOTP(normalizedMobile, otp);
        console.log('OTP sent result:', otpSent);
        if (!otpSent) {
            console.log('Failed to send OTP via SMS');
            return res.status(500).json({ error: 'Failed to send OTP' });
        }
        console.log('OTP sent successfully');
        res.status(200).json({
            message: 'OTP sent successfully',
            userId: user._id,
        });
    }
    catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.sendOTP = sendOTP;
const verifyOTP = async (req, res) => {
    let { mobile, otp, fullName } = req.body;
    try {
        if (!mobile || !otp) {
            return res.status(400).json({ error: 'Mobile number and OTP are required' });
        }
        mobile = mobile.replace(/[\s\-\(\)]/g, '');
        const normalizedMobile = mobile.replace(/^(\+91|91)/, '');
        const user = await user_1.default.findOne({ mobile: normalizedMobile });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
        const isValidOTP = otpService_1.OTPService.verifyOTP(otp, user.otp, user.otpExpiry);
        if (!isValidOTP) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        if (fullName && !user.fullName) {
            user.fullName = fullName;
        }
        await user.save();
        const token = jsonwebtoken_1.default.sign({ id: user._id, mobile: user.mobile }, process.env.JWT_SECRET, { expiresIn: '24h' });
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
    }
    catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.verifyOTP = verifyOTP;
const resendOTP = async (req, res) => {
    let { mobile } = req.body;
    try {
        if (!mobile) {
            return res.status(400).json({ error: 'Mobile number is required' });
        }
        mobile = mobile.replace(/[\s\-\(\)]/g, '');
        const normalizedMobile = mobile.replace(/^(\+91|91)/, '');
        const user = await user_1.default.findOne({ mobile: normalizedMobile });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
        const otp = otpService_1.OTPService.generateOTP();
        const otpExpiry = otpService_1.OTPService.getOTPExpiry();
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();
        const otpSent = await otpService_1.OTPService.sendOTP(normalizedMobile, otp);
        if (!otpSent) {
            return res.status(500).json({ error: 'Failed to send OTP' });
        }
        res.status(200).json({ message: 'OTP resent successfully' });
    }
    catch (error) {
        console.error('Error resending OTP:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.resendOTP = resendOTP;
const logout = async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (token) {
            if (authMiddleware_1.tokenBlacklist.has(token)) {
                return res.status(200).json({ message: 'Already logged out' });
            }
            authMiddleware_1.tokenBlacklist.add(token);
        }
        res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.logout = logout;
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await user_1.default.findById(userId).select('-otp -otpExpiry');
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
    }
    catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getProfile = getProfile;
