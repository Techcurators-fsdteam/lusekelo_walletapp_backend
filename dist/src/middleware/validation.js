"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSignup = void 0;
const express_validator_1 = require("express-validator");
exports.validateSignup = [
    (0, express_validator_1.body)('fullName').isLength({ min: 2 }).trim().escape(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        next();
    },
];
// Add similar for other routes, e.g., validateLogin
