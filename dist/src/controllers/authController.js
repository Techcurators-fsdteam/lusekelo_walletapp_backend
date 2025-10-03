"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.logout = exports.resendOTP = exports.verifyOTP = exports.sendOTP = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const otpService_1 = require("../services/otpService");
const authMiddleware_1 = require("../middleware/authMiddleware");
// Send OTP for signup/login
const sendOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const otp = otpService_1.OTPService.generateOTP();
        const otpExpiry = otpService_1.OTPService.getOTPExpiry();
        console.log('Generated OTP:', otp);
        // Check if user exists
        let user = yield user_1.default.findOne({ mobile: normalizedMobile });
        console.log('Existing user found:', !!user);
        if (user) {
            // Update existing user with new OTP
            user.otp = otp;
            user.otpExpiry = otpExpiry;
            // Only set fullName if it's provided and not already set
            if (!user.fullName && req.body.fullName) {
                user.fullName = req.body.fullName;
            }
            yield user.save();
            console.log('Updated existing user with new OTP');
        }
        else {
            // Create new user with OTP and make sure fullName is handled
            user = new user_1.default({
                mobile: normalizedMobile,
                otp,
                otpExpiry,
                isVerified: false,
                fullName: req.body.fullName || undefined, // Use undefined instead of null
            });
            yield user.save();
            console.log('Created new user with OTP');
        }
        // Send OTP via SMS (this will add +91 automatically)
        console.log('Attempting to send OTP via SMS...');
        const otpSent = yield otpService_1.OTPService.sendOTP(normalizedMobile, otp);
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
});
exports.sendOTP = sendOTP;
// Verify OTP and complete signup/login
const verifyOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { mobile, otp, fullName } = req.body;
    try {
        if (!mobile || !otp) {
            return res.status(400).json({ error: 'Mobile number and OTP are required' });
        }
        // Normalize mobile number - same as in sendOTP
        mobile = mobile.replace(/[\s\-\(\)]/g, '');
        const normalizedMobile = mobile.replace(/^(\+91|91)/, '');
        // Find user by mobile number
        const user = yield user_1.default.findOne({ mobile: normalizedMobile });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
        // Verify OTP
        const isValidOTP = otpService_1.OTPService.verifyOTP(otp, user.otp, user.otpExpiry);
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
        yield user.save();
        // Generate JWT token
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
});
exports.verifyOTP = verifyOTP;
// Resend OTP
const resendOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { mobile } = req.body;
    try {
        if (!mobile) {
            return res.status(400).json({ error: 'Mobile number is required' });
        }
        // Normalize mobile number - same as in sendOTP
        mobile = mobile.replace(/[\s\-\(\)]/g, '');
        const normalizedMobile = mobile.replace(/^(\+91|91)/, '');
        // Find user by mobile number
        const user = yield user_1.default.findOne({ mobile: normalizedMobile });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
        // Generate new OTP
        const otp = otpService_1.OTPService.generateOTP();
        const otpExpiry = otpService_1.OTPService.getOTPExpiry();
        // Update user with new OTP
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        yield user.save();
        // Send OTP via SMS
        const otpSent = yield otpService_1.OTPService.sendOTP(normalizedMobile, otp);
        if (!otpSent) {
            return res.status(500).json({ error: 'Failed to send OTP' });
        }
        res.status(200).json({ message: 'OTP resent successfully' });
    }
    catch (error) {
        console.error('Error resending OTP:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.resendOTP = resendOTP;
// Logout
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
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
});
exports.logout = logout;
// Get user profile
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const user = yield user_1.default.findById(userId).select('-otp -otpExpiry');
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
});
exports.getProfile = getProfile;
