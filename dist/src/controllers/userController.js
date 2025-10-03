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
exports.updateAvatar = exports.verifyPin = exports.setPin = exports.checkBalance = exports.updateSettings = exports.getProfile = void 0;
const user_1 = __importDefault(require("../models/user"));
// Get User Profile
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findById(req.user.id).select('-password');
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});
exports.getProfile = getProfile;
// Update Settings (e.g., language, bank details)
const updateSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { language, bankName, upiId } = req.body;
    try {
        const user = yield user_1.default.findByIdAndUpdate(req.user.id, { language, bankName, upiId }, { new: true }).select('-password');
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});
exports.updateSettings = updateSettings;
// Check Balance
const checkBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findById(req.user.id);
        res.json({ balance: user === null || user === void 0 ? void 0 : user.balance });
    }
    catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});
exports.checkBalance = checkBalance;
// Set/Update UPI PIN
const setPin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pin, confirmPin } = req.body;
    try {
        // Validation
        if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
            return res.status(400).json({ msg: 'PIN must be exactly 4 digits' });
        }
        if (pin !== confirmPin) {
            return res.status(400).json({ msg: 'PINs do not match' });
        }
        const user = yield user_1.default.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        // In production, hash the PIN
        user.pin = pin;
        yield user.save();
        res.json({ msg: 'PIN set successfully' });
    }
    catch (err) {
        console.error('Set PIN error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});
exports.setPin = setPin;
// Verify UPI PIN
const verifyPin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pin } = req.body;
    try {
        if (!pin || pin.length !== 4) {
            return res.status(400).json({ msg: 'Invalid PIN format' });
        }
        const user = yield user_1.default.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        if (!user.pin) {
            return res.status(400).json({ msg: 'PIN not set. Please set your PIN first.' });
        }
        // In production, compare hashed PIN
        if (user.pin !== pin) {
            return res.status(400).json({ msg: 'Incorrect PIN' });
        }
        res.json({ msg: 'PIN verified successfully', verified: true });
    }
    catch (err) {
        console.error('Verify PIN error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});
exports.verifyPin = verifyPin;
// Update Avatar
const updateAvatar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const user = yield user_1.default.findByIdAndUpdate(req.user.id, { avatar: `/uploads/avatars/${req.file.filename}` }, // save path
        { new: true }).select("-password");
        console.log("Avatar updated successfully for user:", req.user.id);
        res.json(user);
    }
    catch (err) {
        console.error("Avatar upload error:", err);
        res.status(500).json({ msg: "Server error" });
    }
});
exports.updateAvatar = updateAvatar;
