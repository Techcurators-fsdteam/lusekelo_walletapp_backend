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
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.default.Schema({
    fullName: { type: String, sparse: true }, // sparse: true allows multiple null values
    password: { type: String },
    mobile: { type: String, required: true, unique: true }, // Required and unique for OTP auth
    bankName: { type: String },
    upiId: { type: String },
    balance: { type: Number, default: 0 },
    language: { type: String, enum: ['English', 'Swahili'], default: 'English' },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    pin: { type: String, minlength: 4, maxlength: 4 }, // 4-digit UPI PIN
    phoneNumber: { type: String }, // Alternative field for mobile
    avatar: { type: String }, // Avatar image path
}, {
    timestamps: true
});
// Hash password before saving
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password') || !this.password)
            return next();
        this.password = yield bcryptjs_1.default.hash(this.password, 10);
        next();
    });
});
// Compare password for login
userSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcryptjs_1.default.compare(candidatePassword, this.password);
    });
};
exports.default = mongoose_1.default.model('User', userSchema);
