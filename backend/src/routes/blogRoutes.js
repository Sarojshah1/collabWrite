import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import * as blog from '../controllers/blogController.js';
import { validate } from '../middlewares/validate.js';
import { uploadMedia, uploadMiddleware } from '../controllers/mediaController.js';
import {
  validateListBlogs,
  validateCreateBlog,
  validateGetBlog,
  validateUpdateBlog,
  validateDeleteBlog,
  validateListVersions,
  validateGetVersion,
  validateRestoreVersion,
} from '../validations/blogValidation.js';

const router = express.Router();

router.get('/', validateListBlogs, validate, authMiddleware, blog.list);

router.post('/', authMiddleware, validateCreateBlog, validate, blog.create);

// Alias for blog cover image uploads
router.post('/upload-image', authMiddleware, uploadMiddleware, uploadMedia);

router.get('/:id', validateGetBlog, validate, authMiddleware, blog.getById);

router.get('/:id/realtime', validateGetBlog, validate, authMiddleware, blog.realtimeInfo);
router.put('/:id', authMiddleware, validateUpdateBlog, validate, blog.update);
router.delete('/:id', validateDeleteBlog, validate, authMiddleware, blog.remove);

// Versioning
router.get('/:id/versions', authMiddleware, validateListVersions, validate, blog.listVersions);
router.get('/:id/versions/:version', authMiddleware, validateGetVersion, validate, blog.getVersion);
router.post('/:id/versions/:version/restore', authMiddleware, validateRestoreVersion, validate, blog.restoreVersion);

export default router;
