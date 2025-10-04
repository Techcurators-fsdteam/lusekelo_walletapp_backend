"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPService = void 0;
const twilio_1 = __importDefault(require("twilio"));
const crypto_1 = __importDefault(require("crypto"));
const client = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
class OTPService {
    static generateOTP() {
        return crypto_1.default.randomInt(100000, 999999).toString();
    }
    static async sendOTP(phoneNumber, otp) {
        try {
            if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
                console.error('Twilio configuration missing');
                return false;
            }
            let twilioPhone = process.env.TWILIO_PHONE_NUMBER;
            console.log('Raw Twilio phone number from env:', twilioPhone);
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
            let formattedPhone = phoneNumber;
            formattedPhone = formattedPhone.replace(/[\s\-\(\)]/g, '');
            if (!formattedPhone.startsWith('+')) {
                if (formattedPhone.startsWith('91')) {
                    formattedPhone = `+${formattedPhone}`;
                }
                else {
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
            if (twilioPhone.startsWith('+918103851211')) {
                console.log('🚨 DEVELOPMENT MODE: Simulating OTP send (Twilio number is invalid)');
                console.log(`📱 OTP ${otp} would be sent to ${formattedPhone}`);
                console.log('⚠️  Please get a real Twilio phone number for production');
                return true;
            }
            const message = await client.messages.create({
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
    }
    static verifyOTP(userOTP, storedOTP, otpExpiry) {
        if (!userOTP || !storedOTP || !otpExpiry) {
            return false;
        }
        if (new Date() > otpExpiry) {
            return false;
        }
        return userOTP === storedOTP;
    }
    static getOTPExpiry() {
        return new Date(Date.now() + 10 * 60 * 1000);
    }
}
exports.OTPService = OTPService;
