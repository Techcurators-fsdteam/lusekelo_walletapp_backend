import { Request, Response } from 'express';
import User from '../models/user';

// Get User Profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update Settings (e.g., language, bank details)
export const updateSettings = async (req: Request, res: Response) => {
  const { language, bankName, upiId } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      (req as any).user.id,
      { language, bankName, upiId },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Check Balance
export const checkBalance = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user.id);
    res.json({ balance: user?.balance });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Set/Update UPI PIN
export const setPin = async (req: Request, res: Response) => {
  const { pin, confirmPin } = req.body;
  
  try {
    // Validation
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ msg: 'PIN must be exactly 4 digits' });
    }
    
    if (pin !== confirmPin) {
      return res.status(400).json({ msg: 'PINs do not match' });
    }

    const user = await User.findById((req as any).user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // In production, hash the PIN
    user.pin = pin;
    await user.save();

    res.json({ msg: 'PIN set successfully' });
  } catch (err) {
    console.error('Set PIN error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Verify UPI PIN
export const verifyPin = async (req: Request, res: Response) => {
  const { pin } = req.body;
  
  try {
    if (!pin || pin.length !== 4) {
      return res.status(400).json({ msg: 'Invalid PIN format' });
    }

    const user = await User.findById((req as any).user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (!user.pin) {
      return res.status(400).json({ msg: 'PIN not set. Please set your PIN first.' });
    }

    // In production, compare hashed PIN
    if (user.pin !== pin) {
      return res.status(400).json({ msg: 'Incorrect PIN' });
    }

    res.json({ msg: 'PIN verified successfully', verified: true });
  } catch (err) {
    console.error('Verify PIN error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
// Update Avatar
export const updateAvatar = async (req: Request, res: Response) => {
  try {
    console.log("Avatar upload request received");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    console.log("Request files:", (req as any).files);
    
    if (!req.file) {
      console.log("No file found in request");
      return res.status(400).json({ msg: "No file uploaded" });
    }

    console.log("File details:", {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const user = await User.findByIdAndUpdate(
      (req as any).user.id,
      { avatar: `/uploads/avatars/${req.file.filename}` }, // save path
      { new: true }
    ).select("-password");

    console.log("Avatar updated successfully for user:", (req as any).user.id);
    res.json(user);
  } catch (err) {
    console.error("Avatar upload error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
