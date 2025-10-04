"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoans = exports.applyLoan = void 0;
const loan_1 = __importDefault(require("../models/loan"));
const user_1 = __importDefault(require("../models/user"));
const applyLoan = async (req, res) => {
    const { type, amount, emiAmount } = req.body;
    try {
        const user = await user_1.default.findById(req.user.id);
        if (!user)
            return res.status(404).json({ msg: 'User not found' });
        if (user.balance < 1000)
            return res.status(400).json({ msg: 'Insufficient eligibility' });
        const loan = new loan_1.default({
            userId: user._id,
            type,
            amount,
            emiAmount,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'approved',
        });
        await loan.save();
        user.balance += amount;
        await user.save();
        res.json({ loan, msg: 'Loan approved and credited' });
    }
    catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};
exports.applyLoan = applyLoan;
const getLoans = async (req, res) => {
    try {
        const loans = await loan_1.default.find({ userId: req.user.id });
        res.json(loans);
    }
    catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};
exports.getLoans = getLoans;
