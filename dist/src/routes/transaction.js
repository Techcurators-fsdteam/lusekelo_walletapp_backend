"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transactionController_1 = require("../controllers/transactionController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.get('/history', authMiddleware_1.protect, transactionController_1.getHistory);
router.post('/send', authMiddleware_1.protect, transactionController_1.sendMoney);
router.post('/receive', authMiddleware_1.protect, transactionController_1.receiveMoney);
exports.default = router;
