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
exports.processQRPayment = exports.generateQR = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const user_1 = __importDefault(require("../models/user"));
const transaction_1 = __importDefault(require("../models/transaction"));
// Generate QR for receiving payment (e.g., for "Receive Money" on dashboard)
const generateQR = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findById(req.user.id);
        console.log('User data for QR generation:', {
            id: user === null || user === void 0 ? void 0 : user._id,
            upiId: user === null || user === void 0 ? void 0 : user.upiId,
            fullName: user === null || user === void 0 ? void 0 : user.fullName,
            phoneNumber: user === null || user === void 0 ? void 0 : user.phoneNumber,
            email: user === null || user === void 0 ? void 0 : user.email
        });
        if (!user)
            return res.status(404).json({ msg: 'User not found' });
        // Ensure we have a valid identifier for the QR code
        const paymentAddress = user.upiId || user.fullName || user.phoneNumber || user.email;
        console.log('Payment address for QR:', paymentAddress);
        if (!paymentAddress) {
            return res.status(400).json({ msg: 'User profile incomplete. Please update your UPI ID or profile information.' });
        }
        const amount = req.body.amount || 0; // Optional amount; if 0, dynamic
        const qrData = `upi://pay?pa=${paymentAddress}&am=${amount}&cu=TZS&tn=Mjicho Payment`; // UPI-like format
        console.log('QR data to generate:', qrData);
        const qrBase64 = yield qrcode_1.default.toDataURL(qrData);
        res.json({ qrCode: qrBase64, upiId: user.upiId, msg: 'QR generated' });
    }
    catch (err) {
        console.error('QR generation error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});
exports.generateQR = generateQR;
// Parse UPI QR data
const parseUPIQRData = (qrData) => {
    var _a, _b, _c, _d;
    try {
        if (qrData.startsWith('upi://pay')) {
            const url = new URL(qrData);
            const params = url.searchParams;
            return {
                upiId: (_a = params.get('pa')) !== null && _a !== void 0 ? _a : '',
                name: (_b = params.get('pn')) !== null && _b !== void 0 ? _b : '',
                amount: params.get('am') ? parseFloat(params.get('am')) : null,
                currency: (_c = params.get('cu')) !== null && _c !== void 0 ? _c : 'INR',
                description: (_d = params.get('tn')) !== null && _d !== void 0 ? _d : '',
            };
        }
        // Handle other formats - assume it's a UPI ID or phone number
        return {
            upiId: qrData,
            name: '',
            amount: null,
            currency: 'INR',
            description: '',
        };
    }
    catch (error) {
        throw new Error('Invalid QR format');
    }
};
// Validate/Process Payment from QR (e.g., scan and pay)
const processQRPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { qrData, amount, description, pin } = req.body;
    try {
        // Input validation
        if (!qrData || !amount || amount <= 0) {
            return res.status(400).json({ msg: 'Invalid payment data' });
        }
        if (!pin || pin.length !== 4) {
            return res.status(400).json({ msg: 'Invalid PIN' });
        }
        const user = yield user_1.default.findById(req.user.id);
        if (!user)
            return res.status(404).json({ msg: 'User not found' });
        // Verify PIN (in production, this should be hashed)
        if (user.pin !== pin) {
            return res.status(400).json({ msg: 'Incorrect PIN' });
        }
        // Check balance
        if (user.balance < amount) {
            return res.status(400).json({ msg: 'Insufficient balance' });
        }
        // Parse QR data
        const parsedQR = parseUPIQRData(qrData);
        // Find recipient by UPI ID, phone number, or full name
        let recipient = null;
        if (parsedQR.upiId) {
            recipient = yield user_1.default.findOne({
                $or: [
                    { upiId: parsedQR.upiId },
                    { phoneNumber: parsedQR.upiId },
                    { fullName: parsedQR.upiId },
                    { email: parsedQR.upiId }
                ]
            });
        }
        if (!recipient) {
            return res.status(400).json({ msg: 'Recipient not found' });
        }
        // Prevent self-transfer
        if (user._id.toString() === recipient._id.toString()) {
            return res.status(400).json({ msg: 'Cannot transfer to yourself' });
        }
        // Process transaction
        const finalAmount = parsedQR.amount || amount;
        const finalDescription = description || parsedQR.description || `Payment to ${recipient.fullName}`;
        // Debit sender
        user.balance -= finalAmount;
        yield user.save();
        // Credit recipient
        recipient.balance += finalAmount;
        yield recipient.save();
        // Generate transaction ID
        const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        // Log transactions
        const senderTx = new transaction_1.default({
            userId: user._id,
            type: 'send',
            amount: -finalAmount,
            description: finalDescription,
            transactionId,
            recipientId: recipient._id,
            status: 'completed'
        });
        yield senderTx.save();
        const recipientTx = new transaction_1.default({
            userId: recipient._id,
            type: 'receive',
            amount: finalAmount,
            description: `From ${user.fullName}`,
            transactionId,
            senderId: user._id,
            status: 'completed'
        });
        yield recipientTx.save();
        res.json({
            msg: 'Payment successful',
            transactionId,
            newBalance: user.balance,
            recipient: {
                name: recipient.fullName,
                upiId: recipient.upiId
            },
            amount: finalAmount
        });
    }
    catch (err) {
        console.error('Payment processing error:', err);
        res.status(500).json({ msg: err.message || 'Payment processing failed' });
    }
});
exports.processQRPayment = processQRPayment;
