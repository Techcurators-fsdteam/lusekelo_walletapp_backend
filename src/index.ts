import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import transactionRoutes from './routes/transaction';
import payRoutes from './routes/pay';
import serviceRoutes from './routes/service';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import qrRoutes from './routes/qr';
import path from 'path';


dotenv.config();
connectDB();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min
  max: 100,  // 100 requests per IP
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(limiter);


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/pay', payRoutes);
app.use('/api/service', serviceRoutes);
app.use('/api/qr', qrRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));


// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const HOST = '0.0.0.0'; 
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});