"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const transactionSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['send', 'receive', 'recharge', 'bill', 'loan', 'other'], required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    transactionId: { type: String, unique: true, sparse: true },
    recipientId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    senderId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
});
exports.default = mongoose_1.default.model('Transaction', transactionSchema);
