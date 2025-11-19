import express from 'express';
import { register, login, me, updateProfile, searchUsers } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { validateRegister, validateLogin, validateUpdateProfile } from '../validations/authValidation.js';
import { avatarUpload } from '../middlewares/avatarUpload.js';

const router = express.Router();

router.post('/register', avatarUpload, validateRegister, validate, register);
router.post('/login', validateLogin, validate, login);
router.get('/profile', authMiddleware, me);
router.put('/profile', authMiddleware, avatarUpload, validateUpdateProfile, validate, updateProfile);
router.get('/users', authMiddleware, searchUsers);

export default router;
