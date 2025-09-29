import twilio from 'twilio';
import crypto from 'crypto';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export class OTPService {
  // Generate a 6-digit OTP
  static generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Send OTP via SMS using Twilio
  static async sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
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
        } else {
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
        } else {
          // If it's a 10-digit Indian number, add +91
          if (/^[6-9]\d{9}$/.test(formattedPhone)) {
            formattedPhone = `+91${formattedPhone}`;
          } else {
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
      
      const message = await client.messages.create({
        body: `Your Mjicho Wallet verification code is: ${otp}. This code will expire in 10 minutes.`,
        from: twilioPhone,
        to: formattedPhone,
      });

      console.log(`OTP sent successfully. Message SID: ${message.sid}`);
      return true;
    } catch (error) {
      console.error('Error sending OTP:', error);
      return false;
    }
  }

  // Verify OTP
  static verifyOTP(userOTP: string, storedOTP: string, otpExpiry: Date): boolean {
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
  static getOTPExpiry(): Date {
    return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  }
}
