import { body, param, query } from 'express-validator';

export const validateListBlogs = [
  query('q').optional().isString().trim(),
  query('tag').optional().isString().trim(),
  query('author').optional().isMongoId(),
  query('status').optional().isIn(['draft', 'published']),
  query('sort').optional().isIn(['newest', 'mostViewed', 'trending']),
];

export const validateCreateBlog = [
  body('title').isString().notEmpty(),
  body('content').optional().isString(),
  body('contentDelta').optional().isObject(),
  body('contentHTML').optional().isString(),
  body('tags').optional().isArray(),
  body('status').optional().isIn(['draft', 'published']),
  body('collaborators').optional().isArray(),
  body('category').optional().isString(),
];

export const validateGetBlog = [
  param('id').isMongoId(),
];

export const validateUpdateBlog = [
  param('id').isMongoId(),
  body('title').optional().isString(),
  body('content').optional().isString(),
  body('contentDelta').optional().isObject(),
  body('contentHTML').optional().isString(),
  body('tags').optional().isArray(),
  body('status').optional().isIn(['draft', 'published']),
  body('collaborators').optional().isArray(),
  body('category').optional().isString(),
];

export const validateDeleteBlog = [
  param('id').isMongoId(),
];

export const validateListVersions = [
  param('id').isMongoId(),
];

export const validateGetVersion = [
  param('id').isMongoId(),
  param('version').isInt({ min: 1 }).toInt(),
];

export const validateRestoreVersion = [
  param('id').isMongoId(),
  param('version').isInt({ min: 1 }).toInt(),
];
