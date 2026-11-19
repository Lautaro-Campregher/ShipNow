import multer from "multer";
import path from "path";
import AppError from "../utils/errors.js";
import fs from "fs";

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function buildStorage(destinationFolder) {
  const absolutePath = path.resolve(process.cwd(), destinationFolder);

  ensureDir(absolutePath);

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, absolutePath),
    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
      cb(null, fileName);
    },
  });
}

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

function fileFilter(req, file, cb) {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(AppError.fromCode("INVALID_FILE_TYPE"));
}

const limits = {
  fileSize: 5 * 1024 * 1024,
};

function buildUpload(destinationFolder) {
  return multer({
    storage: buildStorage(destinationFolder),
    fileFilter,
    limits,
  });
}

export const uploadDocuments = buildUpload("uploads/documents");

export const uploadDriverLicenses = buildUpload("uploads/driver-licenses");

export const uploadOrderProof = buildUpload("uploads/proof/orders");

export const uploadDeliveryProof = buildUpload("uploads/proof/deliveries");
