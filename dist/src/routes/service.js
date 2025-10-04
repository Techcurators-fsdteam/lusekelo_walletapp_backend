"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const serviceController_1 = require("../controllers/serviceController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/loan', authMiddleware_1.protect, serviceController_1.applyLoan);
router.get('/loans', authMiddleware_1.protect, serviceController_1.getLoans);
exports.default = router;
