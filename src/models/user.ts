import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

interface IUser extends mongoose.Document {
  fullName?: string;
  password?: string;
  mobile: string;  // Required for OTP authentication
  bankName?: string;
  upiId?: string;
  email?: string;
  balance: number;  // Wallet balance in TZS
  language: 'English' | 'Swahili';  // From PDF page 4
  isVerified: boolean;  // Phone number verification status
  otp?: string;  // Current OTP
  otpExpiry?: Date;  // OTP expiration time
  pin?: string;  // 4-digit UPI PIN for transactions
  phoneNumber?: string;  // Alternative field name for mobile
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  fullName: { type: String, sparse: true },  // sparse: true allows multiple null values
  password: { type: String },
  mobile: { type: String, required: true, unique: true },  // Required and unique for OTP auth
  bankName: { type: String },
  upiId: { type: String },
  balance: { type: Number, default: 0 },
  language: { type: String, enum: ['English', 'Swahili'], default: 'English' },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  pin: { type: String, minlength: 4, maxlength: 4 },  // 4-digit UPI PIN
  phoneNumber: { type: String },  // Alternative field for mobile
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password for login
userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);