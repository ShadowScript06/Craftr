// src/middleware/upload.middleware.ts

import multer from "multer";
import path from "path";
import { Request } from "express";

// Store in memory so we can:
// 1. extract text directly from buffer
// 2. upload to Cloudinary later
const storage = multer.memoryStorage();

// Allowed extensions
const allowedTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/msword", // .doc
];

// File filter
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
  }
};

// Max size = 5MB
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default upload;