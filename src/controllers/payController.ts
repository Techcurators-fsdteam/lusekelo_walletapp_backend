import { Request, Response } from 'express';
import QRCode from 'qrcode';
import User from '../models/user';
import Transaction from '../models/transaction';

// Generate QR for receiving payment (e.g., for "Receive Money" on dashboard)
export const generateQR = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user.id);
    console.log('User data for QR generation:', {
      id: user?._id,
      upiId: user?.upiId,
      fullName: user?.fullName,
      phoneNumber: user?.phoneNumber,
      email: user?.email
    });
    
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Ensure we have a valid identifier for the QR code
    const paymentAddress = user.upiId || user.fullName || user.phoneNumber || user.email;
    console.log('Payment address for QR:', paymentAddress);
    
    if (!paymentAddress) {
      return res.status(400).json({ msg: 'User profile incomplete. Please update your UPI ID or profile information.' });
    }

    const amount = req.body.amount || 0;  // Optional amount; if 0, dynamic
    const qrData = `upi://pay?pa=${paymentAddress}&am=${amount}&cu=TZS&tn=Mjicho Payment`;  // UPI-like format
    console.log('QR data to generate:', qrData);

    const qrBase64 = await QRCode.toDataURL(qrData);
    res.json({ qrCode: qrBase64, upiId: user.upiId, msg: 'QR generated' });
  } catch (err) {
    console.error('QR generation error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Parse UPI QR data
const parseUPIQRData = (qrData: string) => {
  try {
    if (qrData.startsWith('upi://pay')) {
      const url = new URL(qrData);
      const params = url.searchParams;
      return {
        upiId: params.get('pa') || '',
        name: params.get('pn') || '',
        amount: params.get('am') ? parseFloat(params.get('am')) : null,
        currency: params.get('cu') || 'INR',
        description: params.get('tn') || '',
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
  } catch (error) {
    throw new Error('Invalid QR format');
  }
};

// Validate/Process Payment from QR (e.g., scan and pay)
export const processQRPayment = async (req: Request, res: Response) => {
  const { qrData, amount, description, pin } = req.body;
  
  try {
    // Input validation
    if (!qrData || !amount || amount <= 0) {
      return res.status(400).json({ msg: 'Invalid payment data' });
    }

    if (!pin || pin.length !== 4) {
      return res.status(400).json({ msg: 'Invalid PIN' });
    }

    const user = await User.findById((req as any).user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

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
      recipient = await User.findOne({
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
    await user.save();

    // Credit recipient
    recipient.balance += finalAmount;
    await recipient.save();

    // Generate transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Log transactions
    const senderTx = new Transaction({
      userId: user._id,
      type: 'send',
      amount: -finalAmount,
      description: finalDescription,
      transactionId,
      recipientId: recipient._id,
      status: 'completed'
    });
    await senderTx.save();

    const recipientTx = new Transaction({
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
  } catch (err: any) {
    console.error('Payment processing error:', err);
    res.status(500).json({ msg: err.message || 'Payment processing failed' });
  }
};