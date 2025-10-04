"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.default.Schema({
    fullName: { type: String, sparse: true },
    password: { type: String },
    mobile: { type: String, required: true, unique: true },
    bankName: { type: String },
    upiId: { type: String },
    balance: { type: Number, default: 0 },
    language: { type: String, enum: ['English', 'Swahili'], default: 'English' },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    pin: { type: String, minlength: 4, maxlength: 4 },
    phoneNumber: { type: String },
    avatar: { type: String },
}, {
    timestamps: true
});
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password)
        return next();
    this.password = await bcryptjs_1.default.hash(this.password, 10);
    next();
});
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
exports.default = mongoose_1.default.model('User', userSchema);
