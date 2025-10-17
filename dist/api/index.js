"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const analytics_1 = __importDefault(require("../src/routes/analytics"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
(0, db_1.default)();
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(limiter);
app.use('/auth', auth_1.default);
app.use('/user', user_1.default);
app.use('/transaction', transaction_1.default);
app.use('/pay', pay_1.default);
app.use('/service', service_1.default);
app.use('/qr', qr_1.default);
app.use('/analytics', analytics_1.default);
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
app.get("/", (req, res) => {
    res.json({ status: "Backend is running 🚀" });
});
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});
exports.default = app;
