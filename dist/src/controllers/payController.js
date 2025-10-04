"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processQRPayment = exports.generateQR = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const user_1 = __importDefault(require("../models/user"));
const transaction_1 = __importDefault(require("../models/transaction"));
const generateQR = async (req, res) => {
    try {
        const user = await user_1.default.findById(req.user.id);
        console.log('User data for QR generation:', {
            id: user?._id,
            upiId: user?.upiId,
            fullName: user?.fullName,
            phoneNumber: user?.phoneNumber,
            email: user?.email
        });
        if (!user)
            return res.status(404).json({ msg: 'User not found' });
        const paymentAddress = user.upiId || user.fullName || user.phoneNumber || user.email;
        console.log('Payment address for QR:', paymentAddress);
        if (!paymentAddress) {
            return res.status(400).json({ msg: 'User profile incomplete. Please update your UPI ID or profile information.' });
        }
        const amount = req.body.amount || 0;
        const qrData = `upi://pay?pa=${paymentAddress}&am=${amount}&cu=TZS&tn=Mjicho Payment`;
        console.log('QR data to generate:', qrData);
        const qrBase64 = await qrcode_1.default.toDataURL(qrData);
        res.json({ qrCode: qrBase64, upiId: user.upiId, msg: 'QR generated' });
    }
    catch (err) {
        console.error('QR generation error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};
exports.generateQR = generateQR;
const parseUPIQRData = (qrData) => {
    try {
        if (qrData.startsWith('upi://pay')) {
            const url = new URL(qrData);
            const params = url.searchParams;
            return {
                upiId: params.get('pa') ?? '',
                name: params.get('pn') ?? '',
                amount: params.get('am') ? parseFloat(params.get('am')) : null,
                currency: params.get('cu') ?? 'INR',
                description: params.get('tn') ?? '',
            };
        }
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
const processQRPayment = async (req, res) => {
    const { qrData, amount, description, pin } = req.body;
    try {
        if (!qrData || !amount || amount <= 0) {
            return res.status(400).json({ msg: 'Invalid payment data' });
        }
        if (!pin || pin.length !== 4) {
            return res.status(400).json({ msg: 'Invalid PIN' });
        }
        const user = await user_1.default.findById(req.user.id);
        if (!user)
            return res.status(404).json({ msg: 'User not found' });
        if (user.pin !== pin) {
            return res.status(400).json({ msg: 'Incorrect PIN' });
        }
        if (user.balance < amount) {
            return res.status(400).json({ msg: 'Insufficient balance' });
        }
        const parsedQR = parseUPIQRData(qrData);
        let recipient = null;
        if (parsedQR.upiId) {
            recipient = await user_1.default.findOne({
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
        if (user._id.toString() === recipient._id.toString()) {
            return res.status(400).json({ msg: 'Cannot transfer to yourself' });
        }
        const finalAmount = parsedQR.amount || amount;
        const finalDescription = description || parsedQR.description || `Payment to ${recipient.fullName}`;
        user.balance -= finalAmount;
        await user.save();
        recipient.balance += finalAmount;
        await recipient.save();
        const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const senderTx = new transaction_1.default({
            userId: user._id,
            type: 'send',
            amount: -finalAmount,
            description: finalDescription,
            transactionId,
            recipientId: recipient._id,
            status: 'completed'
        });
        await senderTx.save();
        const recipientTx = new transaction_1.default({
            userId: recipient._id,
            type: 'receive',
            amount: finalAmount,
            description: `From ${user.fullName}`,
            transactionId,
            senderId: user._id,
            status: 'completed'
        });
        await recipientTx.save();
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
};
exports.processQRPayment = processQRPayment;
