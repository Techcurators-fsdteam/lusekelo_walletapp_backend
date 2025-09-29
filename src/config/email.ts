import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetEmail = async (email: string, resetToken: string) => {
  const resetUrl = `http://yourapp.com/reset-password/${resetToken}`;  // Update for frontend
  await transporter.sendMail({
    to: email,
    subject: 'Mjicho Password Reset',
    html: `Click <a href="${resetUrl}">here</a> to reset your password. Expires in 1h.`,
  });
};