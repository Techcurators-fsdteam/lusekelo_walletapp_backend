"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payController_1 = require("../controllers/payController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/generate', authMiddleware_1.protect, payController_1.generateQR);
router.post('/scan', authMiddleware_1.protect, payController_1.processQRPayment);
exports.default = router;
