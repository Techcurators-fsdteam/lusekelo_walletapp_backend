"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const Jimp = require("jimp");
const jsqr_1 = __importDefault(require("jsqr"));
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const router = express_1.default.Router();
router.post("/decode", upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "No file uploaded",
                msg: "Please select a valid QR code image",
            });
        }
        console.log("Received file:", req.file.originalname, "Size:", req.file.size);
        // Validate file size (max 5MB)
        if (req.file.size > 5 * 1024 * 1024) {
            return res.status(400).json({
                error: "File too large",
                msg: "Image size should be less than 5MB",
            });
        }
        // Validate file type
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                error: "Invalid file type",
                msg: "Please upload a valid image file (JPEG, PNG, WebP)",
            });
        }
        // Load image with Jimp - use the buffer directly
        const image = yield Jimp.Jimp.read(req.file.buffer);
        // Get image data in the format jsQR expects :cite[10]
        const imageData = {
            data: new Uint8ClampedArray(image.bitmap.data),
            width: image.bitmap.width,
            height: image.bitmap.height
        };
        // Decode QR with jsQR
        const qrCode = (0, jsqr_1.default)(imageData.data, imageData.width, imageData.height);
        if (!qrCode) {
            return res.status(400).json({
                error: "QR not found",
                msg: "No QR code found in the image. Please ensure the image contains a clear QR code.",
            });
        }
        console.log("Successfully decoded QR:", qrCode.data.substring(0, 50) + "...");
        res.json({
            data: qrCode.data,
            msg: "QR code decoded successfully",
        });
    }
    catch (error) {
        console.error("QR decode error:", error);
        res.status(500).json({
            error: "Processing failed",
            msg: error.message || "Failed to process the image. Please try again.",
        });
    }
}));
exports.default = router;
