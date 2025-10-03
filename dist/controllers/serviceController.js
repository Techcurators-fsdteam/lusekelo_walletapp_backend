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
exports.getLoans = exports.applyLoan = void 0;
const loan_1 = __importDefault(require("../models/loan"));
const user_1 = __importDefault(require("../models/user"));
// Apply for Loan (mock approval)
const applyLoan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, amount, emiAmount } = req.body;
    try {
        const user = yield user_1.default.findById(req.user.id);
        if (!user)
            return res.status(404).json({ msg: 'User not found' });
        // Mock: Check eligibility (e.g., balance > 0)
        if (user.balance < 1000)
            return res.status(400).json({ msg: 'Insufficient eligibility' });
        const loan = new loan_1.default({
            userId: user._id,
            type,
            amount,
            emiAmount,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            status: 'approved', // Mock instant approval
        });
        yield loan.save();
        // Credit loan to balance
        user.balance += amount;
        yield user.save();
        // Log transaction
        // Use Transaction model here if needed
        res.json({ loan, msg: 'Loan approved and credited' });
    }
    catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});
exports.applyLoan = applyLoan;
// Get Loans (for dashboard)
const getLoans = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const loans = yield loan_1.default.find({ userId: req.user.id });
        res.json(loans);
    }
    catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});
exports.getLoans = getLoans;
// For Insurance/SIPs: Similar mock endpoint, e.g., POST /api/service/insurance { plan: 'health', premium: 100 }
// Create a Service model later for generality.
