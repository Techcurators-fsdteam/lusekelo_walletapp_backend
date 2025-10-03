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
exports.mobileRecharge = exports.receiveMoney = exports.sendMoney = exports.getHistory = void 0;
const transaction_1 = __importDefault(require("../models/transaction"));
const user_1 = __importDefault(require("../models/user"));
const axios_1 = __importDefault(require("axios"));
// Get Transaction History
const getHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactions = yield transaction_1.default.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(transactions);
    }
    catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});
exports.getHistory = getHistory;
// Send Money (mock; integrate payment gateway later)
const sendMoney = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, toMobileOrName, description } = req.body;
    try {
        const user = yield user_1.default.findById(req.user.id);
        if (!user)
            return res.status(404).json({ msg: 'User not found' });
        if (user.balance < amount)
            return res.status(400).json({ msg: 'Insufficient balance' });
        // Call external API (e.g., Selcom)
        const response = yield axios_1.default.post('https://api.selcom.net/v1/payments', {
            amount,
            currency: 'TZS', // Or the correct currency
            recipient: toMobileOrName,
            description,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SELCOM_KEY}`,
            },
        });
        if (response.data.status === 'success') {
            // Deduct user balance
            user.balance -= amount;
            yield user.save();
            // Save transaction
            const transaction = new transaction_1.default({
                userId: user._id,
                type: 'send',
                amount: -amount,
                description: `Sent to ${toMobileOrName} via Selcom`,
            });
            yield transaction.save();
            res.json({
                msg: 'Payment successful',
                transactionId: response.data.transactionId || response.data.id,
                newBalance: user.balance,
            });
        }
        else {
            res.status(400).json({ msg: 'Payment failed', error: response.data.message || 'Unknown error' });
        }
    }
    catch (err) {
        const error = err;
        console.error('Payment error:', error.message);
        res.status(500).json({ msg: 'Server error during payment' });
    }
});
exports.sendMoney = sendMoney;
// Receive Money (similar mock)
const receiveMoney = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, from } = req.body; // from could be QR or user
    try {
        const user = yield user_1.default.findById(req.user.id);
        if (!user)
            return res.status(404).json({ msg: 'User not found' });
        user.balance += amount;
        yield user.save();
        const transaction = new transaction_1.default({
            userId: user._id,
            type: 'receive',
            amount,
            description: `Received from ${from}`,
        });
        yield transaction.save();
        res.json({ msg: 'Money received', newBalance: user.balance });
    }
    catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});
exports.receiveMoney = receiveMoney;
// Other services (e.g., Recharge/Bill) can follow similar pattern
// Example: Mobile Recharge (mock)
const mobileRecharge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, mobileNumber } = req.body;
    // Similar to sendMoney, but type: 'recharge'
    // Integrate with recharge API in real app
});
exports.mobileRecharge = mobileRecharge;
