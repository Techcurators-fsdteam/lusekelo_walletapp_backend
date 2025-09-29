import express, { Request, Response } from "express";
import multer from "multer";
const Jimp = require("jimp");
import jsQR from "jsqr";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post("/decode", upload.single("file"), async (req: Request, res: Response) => {
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
    const image = await Jimp.Jimp.read(req.file.buffer);
    
    // Get image data in the format jsQR expects :cite[10]
    const imageData = {
      data: new Uint8ClampedArray(image.bitmap.data),
      width: image.bitmap.width,
      height: image.bitmap.height
    };

    // Decode QR with jsQR
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

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
  } catch (error: any) {
    console.error("QR decode error:", error);
    res.status(500).json({
      error: "Processing failed",
      msg: error.message || "Failed to process the image. Please try again.",
    });
  }
});

export default router;