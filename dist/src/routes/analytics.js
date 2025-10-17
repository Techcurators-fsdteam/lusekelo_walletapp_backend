"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const analyticsController_1 = require("../controllers/analyticsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.get('/summary', authMiddleware_1.protect, analyticsController_1.getAnalytics);
router.get('/categories', authMiddleware_1.protect, analyticsController_1.getCategoryBreakdown);
router.get('/trends', authMiddleware_1.protect, analyticsController_1.getTransactionTrends);
exports.default = router;
