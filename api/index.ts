// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import connectDB from '../src/config/db';
// import authRoutes from '../src/routes/auth';
// import userRoutes from '../src/routes/user';
// import transactionRoutes from '../src/routes/transaction';
// import payRoutes from '../src/routes/pay';
// import serviceRoutes from '../src/routes/service';
// import rateLimit from 'express-rate-limit';
// import { Request, Response, NextFunction } from 'express';
// import qrRoutes from '../src/routes/qr';
// import path from 'path';


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
// app.use('/auth', authRoutes);
// app.use('/user', userRoutes);
// app.use('/transaction', transactionRoutes);
// app.use('/pay', payRoutes);
// app.use('/service', serviceRoutes);
// app.use('/qr', qrRoutes);
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
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from '../src/config/db';
import authRoutes from '../src/routes/auth';
import userRoutes from '../src/routes/user';
import transactionRoutes from '../src/routes/transaction';
import payRoutes from '../src/routes/pay';
import serviceRoutes from '../src/routes/service';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import qrRoutes from '../src/routes/qr';
import path from 'path';

// Configure dotenv
dotenv.config();

// Connect to database
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
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/transaction', transactionRoutes);
app.use('/pay', payRoutes);
app.use('/service', serviceRoutes);
app.use('/qr', qrRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check route
app.get("/", (req: Request, res: Response) => {
  res.json({ status: "Backend is running 🚀" });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ❌ REMOVE app.listen()
// ✅ Export app instead (Vercel handles listening)
export default app;
