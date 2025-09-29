import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const tokenBlacklist = new Set<string>();

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ msg: 'No token' });
  if (tokenBlacklist.has(token)) return res.status(401).json({ msg: 'Token blacklisted' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token' });
  }
};

export const logoutProtect = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ msg: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    if (tokenBlacklist.has(token)) {
      return res.status(200).json({ message: 'Already logged out' });
    }
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      tokenBlacklist.add(token);
    }
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ error: 'Server error' });
  }
};