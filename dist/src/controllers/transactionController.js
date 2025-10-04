"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mobileRecharge = exports.receiveMoney = exports.sendMoney = exports.getHistory = void 0;
const transaction_1 = __importDefault(require("../models/transaction"));
const user_1 = __importDefault(require("../models/user"));
const axios_1 = __importDefault(require("axios"));
const getHistory = async (req, res) => {
    try {
        const transactions = await transaction_1.default.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(transactions);
    }
    catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};
exports.getHistory = getHistory;
const sendMoney = async (req, res) => {
    const { amount, toMobileOrName, description } = req.body;
    try {
        const user = await user_1.default.findById(req.user.id);
        if (!user)
            return res.status(404).json({ msg: 'User not found' });
        if (user.balance < amount)
            return res.status(400).json({ msg: 'Insufficient balance' });
        const response = await axios_1.default.post('https://api.selcom.net/v1/payments', {
            amount,
            currency: 'TZS',
            recipient: toMobileOrName,
            description,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SELCOM_KEY}`,
            },
        });
        if (response.data.status === 'success') {
            user.balance -= amount;
            await user.save();
            const transaction = new transaction_1.default({
                userId: user._id,
                type: 'send',
                amount: -amount,
                description: `Sent to ${toMobileOrName} via Selcom`,
            });
            await transaction.save();
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
};
exports.sendMoney = sendMoney;
const receiveMoney = async (req, res) => {
    const { amount, from } = req.body;
    try {
        const user = await user_1.default.findById(req.user.id);
        if (!user)
            return res.status(404).json({ msg: 'User not found' });
        user.balance += amount;
        await user.save();
        const transaction = new transaction_1.default({
            userId: user._id,
            type: 'receive',
            amount,
            description: `Received from ${from}`,
        });
        await transaction.save();
        res.json({ msg: 'Money received', newBalance: user.balance });
    }
    catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};
exports.receiveMoney = receiveMoney;
const mobileRecharge = async (req, res) => {
    const { amount, mobileNumber } = req.body;
};
exports.mobileRecharge = mobileRecharge;
