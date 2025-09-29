import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateSignup = [
  body('fullName').isLength({ min: 2 }).trim().escape(),
  body('password').isLength({ min: 6 }),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

// Add similar for other routes, e.g., validateLogin