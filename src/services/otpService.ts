import twilio from 'twilio';
import crypto from 'crypto';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export class OTPService {
  // Generate a 6-digit OTP (kept for backward compatibility, but Twilio Verify generates its own)
  static generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Send OTP via Twilio Verify API (supports Indian numbers)
  static async sendOTP(phoneNumber: string, otp?: string): Promise<boolean> {
    try {
      // Check if Twilio is properly configured
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        console.error('Twilio configuration missing');
        return false;
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
      
      // Use Twilio Verify API if VERIFY_SERVICE_SID is configured
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
      } else {
        // Fallback to SMS API (requires valid Twilio phone number)
        console.error('⚠️  VERIFY_SERVICE_SID not configured. Please add it to your .env file');
        console.error('You can find it in your Twilio Console under Verify > Services');
        return false;
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      if (error.code) {
        console.error('Twilio Error Code:', error.code);
        console.error('Twilio Error Message:', error.message);
      }
      return false;
    }
  }

  // Verify OTP using Twilio Verify API
  static async verifyOTPWithTwilio(phoneNumber: string, otp: string): Promise<boolean> {
    try {
      if (!process.env.VERIFY_SERVICE_SID) {
        console.error('VERIFY_SERVICE_SID not configured');
        return false;
      }

      // Format phone number to international format
      let formattedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
      if (!formattedPhone.startsWith('+')) {
        if (formattedPhone.startsWith('91')) {
          formattedPhone = `+${formattedPhone}`;
        } else if (/^[6-9]\d{9}$/.test(formattedPhone)) {
          formattedPhone = `+91${formattedPhone}`;
        } else {
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
    } catch (error: any) {
      console.error('Error verifying OTP with Twilio:', error);
      if (error.code) {
        console.error('Twilio Error Code:', error.code);
        console.error('Twilio Error Message:', error.message);
      }
      return false;
    }
  }

  // Verify OTP (legacy method for backward compatibility)
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
