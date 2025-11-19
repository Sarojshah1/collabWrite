import { body, param, query } from 'express-validator';

export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

export const validateListUsers = [
  ...validatePagination,
];

export const validateSuspendUser = [
  param('id').isMongoId(),
  body('suspended').isBoolean(),
];

export const validateDeleteUser = [
  param('id').isMongoId(),
];

export const validateListBlogs = [
  ...validatePagination,
  query('tag').optional().isString().trim(),
  query('category').optional().isString().trim(),
  query('author').optional().isMongoId(),
  query('status').optional().isIn(['draft', 'published']),
  query('q').optional().isString().trim(),
  query('sort').optional().isIn(['newest', 'mostViewed']),
];

export const validateApproveBlog = [
  param('id').isMongoId(),
];

export const validateDeleteBlog = [
  param('id').isMongoId(),
];

export const validateAdminAnalytics = [
  query('days').optional().isInt({ min: 1, max: 365 }).toInt(),
];
