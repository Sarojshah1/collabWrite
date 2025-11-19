import { body } from 'express-validator';

export const validateRegister = [
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('bio').optional().isString().withMessage('Bio must be a string'),
  body('avatar').optional().isString().withMessage('Avatar must be a string'),
];

export const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const validateUpdateProfile = [
  body('name').optional().isString().trim().notEmpty().withMessage('Name must be a non-empty string'),
  body('bio').optional().isString().withMessage('Bio must be a string'),
  body('avatar').optional().isString().withMessage('Avatar must be a string'),

  // Interests
  body('interests').optional().isObject().withMessage('Interests must be an object'),
  body('interests.tags').optional().isArray().withMessage('Interests.tags must be an array of strings'),
  body('interests.tags.*').optional().isString().withMessage('Each tag must be a string'),
  body('interests.categories').optional().isArray().withMessage('Interests.categories must be an array of strings'),
  body('interests.categories.*').optional().isString().withMessage('Each category must be a string'),
  body('interests.authors').optional().isArray().withMessage('Interests.authors must be an array of user ids'),
  body('interests.authors.*').optional().isString().withMessage('Each author id must be a string'),

  // Notification settings
  body('notificationSettings').optional().isObject().withMessage('notificationSettings must be an object'),
  body('notificationSettings.marketing').optional().isBoolean(),
  body('notificationSettings.newFollower').optional().isBoolean(),
  body('notificationSettings.blogUpdates').optional().isBoolean(),
  body('notificationSettings.comments').optional().isBoolean(),
  body('notificationSettings.mentions').optional().isBoolean(),

  // Password change
  body('currentPassword').optional().isString(),
  body('newPassword').optional().isString().isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  body('newPassword').custom((value, { req }) => {
    if (value && !req.body.currentPassword) {
      throw new Error('currentPassword is required to set a new password');
    }
    return true;
  }),
];
