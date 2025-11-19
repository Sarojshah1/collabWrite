import multer from 'multer';

// Memory storage for quick pass-through to cloudinary
const storage = multer.memoryStorage();

// Accept single file field named 'avatar'
export const avatarUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).single('avatar');
