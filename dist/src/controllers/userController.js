"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAvatar = exports.verifyPin = exports.setPin = exports.checkBalance = exports.updateSettings = exports.getProfile = void 0;
const user_1 = __importDefault(require("../models/user"));
const getProfile = async (req, res) => {
    try {
        const user = await user_1.default.findById(req.user.id).select('-password');
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};
exports.getProfile = getProfile;
const updateSettings = async (req, res) => {
    const { language, bankName, upiId } = req.body;
    try {
        const user = await user_1.default.findByIdAndUpdate(req.user.id, { language, bankName, upiId }, { new: true }).select('-password');
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};
exports.updateSettings = updateSettings;
const checkBalance = async (req, res) => {
    try {
        const user = await user_1.default.findById(req.user.id);
        res.json({ balance: user?.balance });
    }
    catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};
exports.checkBalance = checkBalance;
const setPin = async (req, res) => {
    const { pin, confirmPin } = req.body;
    try {
        if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
            return res.status(400).json({ msg: 'PIN must be exactly 4 digits' });
        }
        if (pin !== confirmPin) {
            return res.status(400).json({ msg: 'PINs do not match' });
        }
        const user = await user_1.default.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        user.pin = pin;
        await user.save();
        res.json({ msg: 'PIN set successfully' });
    }
    catch (err) {
        console.error('Set PIN error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};
exports.setPin = setPin;
const verifyPin = async (req, res) => {
    const { pin } = req.body;
    try {
        if (!pin || pin.length !== 4) {
            return res.status(400).json({ msg: 'Invalid PIN format' });
        }
        const user = await user_1.default.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        if (!user.pin) {
            return res.status(400).json({ msg: 'PIN not set. Please set your PIN first.' });
        }
        if (user.pin !== pin) {
            return res.status(400).json({ msg: 'Incorrect PIN' });
        }
        res.json({ msg: 'PIN verified successfully', verified: true });
    }
    catch (err) {
        console.error('Verify PIN error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};
exports.verifyPin = verifyPin;
const updateAvatar = async (req, res) => {
    try {
        console.log("Avatar upload request received");
        console.log("Request body:", req.body);
        console.log("Request file:", req.file);
        console.log("Request files:", req.files);
        if (!req.file) {
            console.log("No file found in request");
            return res.status(400).json({ msg: "No file uploaded" });
        }
        console.log("File details:", {
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });
        const user = await user_1.default.findByIdAndUpdate(req.user.id, { avatar: `/uploads/avatars/${req.file.filename}` }, { new: true }).select("-password");
        console.log("Avatar updated successfully for user:", req.user.id);
        res.json(user);
    }
    catch (err) {
        console.error("Avatar upload error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};
exports.updateAvatar = updateAvatar;
