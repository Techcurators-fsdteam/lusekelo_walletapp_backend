"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const sendResetEmail = async (email, resetToken) => {
    const resetUrl = `http://yourapp.com/reset-password/${resetToken}`;
    await transporter.sendMail({
        to: email,
        subject: 'Mjicho Password Reset',
        html: `Click <a href="${resetUrl}">here</a> to reset your password. Expires in 1h.`,
    });
};
exports.sendResetEmail = sendResetEmail;
