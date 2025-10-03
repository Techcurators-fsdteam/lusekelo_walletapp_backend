"use strict";
// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import connectDB from '../config/db';
// import authRoutes from '../routes/auth';
// import userRoutes from '../routes/user';
// import transactionRoutes from '../routes/transaction';
// import payRoutes from '../routes/pay';
// import serviceRoutes from '../routes/service';
// import rateLimit from 'express-rate-limit';
// import { Request, Response, NextFunction } from 'express';
// import qrRoutes from '../routes/qr';
// import path from 'path';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// dotenv.config();
// connectDB();
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,  // 15 min
//   max: 100,  // 100 requests per IP
// });
// const app = express();
// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(limiter);
// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/user', userRoutes);
// app.use('/api/transaction', transactionRoutes);
// app.use('/api/pay', payRoutes);
// app.use('/api/service', serviceRoutes);
// app.use('/api/qr', qrRoutes);
// app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
// // Health check route
// app.get("/", (req: Request, res: Response) => {
//   res.json({ status: "Backend is running 🚀" });
// });
// // Error handling middleware
// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//   console.error('Error:', err.message);
//   console.error('Stack:', err.stack);
//   res.status(500).json({ error: 'Internal server error', message: err.message });
// });
// const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
// const HOST = '0.0.0.0'; 
// app.listen(PORT, HOST, () => {
//   console.log(`Server running on http://${HOST}:${PORT}`);
// });
//remove app.listen for vercel 
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("../src/config/db"));
const auth_1 = __importDefault(require("../src/routes/auth"));
const user_1 = __importDefault(require("../src/routes/user"));
const transaction_1 = __importDefault(require("../src/routes/transaction"));
const pay_1 = __importDefault(require("../src/routes/pay"));
const service_1 = __importDefault(require("../src/routes/service"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const qr_1 = __importDefault(require("../src/routes/qr"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
(0, db_1.default)();
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100, // 100 requests per IP
});
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(limiter);
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/user', user_1.default);
app.use('/api/transaction', transaction_1.default);
app.use('/api/pay', pay_1.default);
app.use('/api/service', service_1.default);
app.use('/api/qr', qr_1.default);
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
// Health check route
app.get("/", (req, res) => {
    res.json({ status: "Backend is running 🚀" });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});
// ❌ REMOVE app.listen()
// ✅ Export app instead (Vercel handles listening)
exports.default = app;
