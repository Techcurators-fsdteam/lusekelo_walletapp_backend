"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/send-otp', authController_1.sendOTP);
router.post('/verify-otp', authController_1.verifyOTP);
router.post('/resend-otp', authController_1.resendOTP);
router.post('/logout', authMiddleware_1.protect, authController_1.logout);
router.get('/profile', authMiddleware_1.protect, authController_1.getProfile);
exports.default = router;
