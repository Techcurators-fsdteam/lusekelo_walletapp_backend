"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const upload_1 = __importDefault(require("../models/upload"));
const router = express_1.default.Router();
router.get('/profile', authMiddleware_1.protect, userController_1.getProfile);
router.put('/settings', authMiddleware_1.protect, userController_1.updateSettings);
router.get('/balance', authMiddleware_1.protect, userController_1.checkBalance);
router.post('/set-pin', authMiddleware_1.protect, userController_1.setPin);
router.post('/verify-pin', authMiddleware_1.protect, userController_1.verifyPin);
router.post("/avatar", authMiddleware_1.protect, upload_1.default.single("avatar"), userController_1.updateAvatar);
exports.default = router;
