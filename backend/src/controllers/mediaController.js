import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import { sendSuccess, sendError } from '../utils/response.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export const uploadMiddleware = upload.single('file');

export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) return sendError(res, 400, 'No file provided');
    const folder = req.body.folder || 'blogs';

    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type: 'auto' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const result = await streamUpload();
    return sendSuccess(res, {
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (err) {
    return sendError(res, 500, 'Failed to upload media', err.message);
  }
};
