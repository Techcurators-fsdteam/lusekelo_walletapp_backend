"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.logoutProtect = exports.protect = exports.tokenBlacklist = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.tokenBlacklist = new Set();
const protect = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token)
        return res.status(401).json({ msg: 'No token' });
    if (exports.tokenBlacklist.has(token))
        return res.status(401).json({ msg: 'Token blacklisted' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({ msg: 'Invalid token' });
    }
};
exports.protect = protect;
const logoutProtect = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token)
        return res.status(401).json({ msg: 'No token' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (exports.tokenBlacklist.has(token)) {
            return res.status(200).json({ message: 'Already logged out' });
        }
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({ msg: 'Invalid token' });
    }
};
exports.logoutProtect = logoutProtect;
const logout = async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (token) {
            exports.tokenBlacklist.add(token);
        }
        res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.logout = logout;
