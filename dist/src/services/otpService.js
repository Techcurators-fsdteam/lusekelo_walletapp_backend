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
            if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
                console.error('Twilio configuration missing');
                return false;
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
            if (process.env.VERIFY_SERVICE_SID) {
                console.log('Using Twilio Verify API');
                const verification = await client.verify.v2
                    .services(process.env.VERIFY_SERVICE_SID)
                    .verifications.create({
                    to: formattedPhone,
                    channel: 'sms'
                });
                console.log(`OTP sent successfully via Verify API. Status: ${verification.status}`);
                return verification.status === 'pending';
            }
            else {
                console.error('⚠️  VERIFY_SERVICE_SID not configured. Please add it to your .env file');
                console.error('You can find it in your Twilio Console under Verify > Services');
                return false;
            }
        }
        catch (error) {
            console.error('Error sending OTP:', error);
            if (error.code) {
                console.error('Twilio Error Code:', error.code);
                console.error('Twilio Error Message:', error.message);
            }
            return false;
        }
    }
    static async verifyOTPWithTwilio(phoneNumber, otp) {
        try {
            if (!process.env.VERIFY_SERVICE_SID) {
                console.error('VERIFY_SERVICE_SID not configured');
                return false;
            }
            let formattedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
            if (!formattedPhone.startsWith('+')) {
                if (formattedPhone.startsWith('91')) {
                    formattedPhone = `+${formattedPhone}`;
                }
                else if (/^[6-9]\d{9}$/.test(formattedPhone)) {
                    formattedPhone = `+91${formattedPhone}`;
                }
                else {
                    formattedPhone = `+91${formattedPhone}`;
                }
            }
            console.log(`Verifying OTP for: ${formattedPhone}`);
            const verificationCheck = await client.verify.v2
                .services(process.env.VERIFY_SERVICE_SID)
                .verificationChecks.create({
                to: formattedPhone,
                code: otp
            });
            console.log(`OTP verification status: ${verificationCheck.status}`);
            return verificationCheck.status === 'approved';
        }
        catch (error) {
            console.error('Error verifying OTP with Twilio:', error);
            if (error.code) {
                console.error('Twilio Error Code:', error.code);
                console.error('Twilio Error Message:', error.message);
            }
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
