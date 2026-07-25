import express from "express";
import cloudinary from "cloudinary";

const router = express.Router();

router.post("/upload", async (req, res) => {
  try {
    const { buffer } = req.body;

    console.log("Buffer starts with:", buffer?.substring(0, 50));

    const cloud = await cloudinary.v2.uploader.upload(buffer);

    res.json({
      url: cloud.secure_url,
    });
  } catch (error: any) {
    console.error("FULL CLOUDINARY ERROR:");
    console.error(error);

    res.status(500).json({
      message: error.message,
      name: error.name,
      http_code: error.http_code,
    });
  }
});

export default router;
