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
exports.OTPService = void 0;
const twilio_1 = __importDefault(require("twilio"));
const crypto_1 = __importDefault(require("crypto"));
const client = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
class OTPService {
    // Generate a 6-digit OTP
    static generateOTP() {
        return crypto_1.default.randomInt(100000, 999999).toString();
    }
    // Send OTP via SMS using Twilio
    static sendOTP(phoneNumber, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if Twilio is properly configured
                if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
                    console.error('Twilio configuration missing');
                    return false;
                }
                // Validate and format Twilio phone number
                let twilioPhone = process.env.TWILIO_PHONE_NUMBER;
                console.log('Raw Twilio phone number from env:', twilioPhone);
                // If the + was stripped, add it back for Indian numbers
                if (!twilioPhone.startsWith('+')) {
                    if (twilioPhone.startsWith('91') && twilioPhone.length === 12) {
                        twilioPhone = `+${twilioPhone}`;
                        console.log('Added + to Twilio phone number:', twilioPhone);
                    }
                    else {
                        console.error('Twilio phone number must be in international format (e.g., +1234567890)');
                        console.error('Current Twilio phone number:', twilioPhone);
                        return false;
                    }
                }
                // Format phone number to international format for India
                let formattedPhone = phoneNumber;
                // Remove any spaces, dashes, or other formatting
                formattedPhone = formattedPhone.replace(/[\s\-\(\)]/g, '');
                // If it doesn't start with +, add +91 for India
                if (!formattedPhone.startsWith('+')) {
                    // If it starts with 91, add +
                    if (formattedPhone.startsWith('91')) {
                        formattedPhone = `+${formattedPhone}`;
                    }
                    else {
                        // If it's a 10-digit Indian number, add +91
                        if (/^[6-9]\d{9}$/.test(formattedPhone)) {
                            formattedPhone = `+91${formattedPhone}`;
                        }
                        else {
                            formattedPhone = `+91${formattedPhone}`;
                        }
                    }
                }
                console.log(`Sending OTP to: ${formattedPhone}`);
                console.log(`From Twilio number: ${twilioPhone}`);
                // TEMPORARY: For development/testing, simulate OTP sending if using invalid Twilio number
                if (twilioPhone.startsWith('+918103851211')) {
                    console.log('🚨 DEVELOPMENT MODE: Simulating OTP send (Twilio number is invalid)');
                    console.log(`📱 OTP ${otp} would be sent to ${formattedPhone}`);
                    console.log('⚠️  Please get a real Twilio phone number for production');
                    return true; // Simulate success
                }
                const message = yield client.messages.create({
                    body: `Your Mjicho Wallet verification code is: ${otp}. This code will expire in 10 minutes.`,
                    from: twilioPhone,
                    to: formattedPhone,
                });
                console.log(`OTP sent successfully. Message SID: ${message.sid}`);
                return true;
            }
            catch (error) {
                console.error('Error sending OTP:', error);
                return false;
            }
        });
    }
    // Verify OTP
    static verifyOTP(userOTP, storedOTP, otpExpiry) {
        if (!userOTP || !storedOTP || !otpExpiry) {
            return false;
        }
        // Check if OTP has expired
        if (new Date() > otpExpiry) {
            return false;
        }
        // Check if OTP matches
        return userOTP === storedOTP;
    }
    // Get OTP expiry time (10 minutes from now)
    static getOTPExpiry() {
        return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    }
}
exports.OTPService = OTPService;
