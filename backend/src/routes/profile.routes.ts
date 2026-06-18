import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { getProfile, updateProfile } from '../controllers/profile.controller';

const router = Router();

router.use(authenticate);

router.get('/', getProfile);

router.patch(
  '/',
  [
    body('fullName')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Full name cannot be empty'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Invalid email address'),
    body('profilePhotoUrl')
      .optional()
      .isURL()
      .withMessage('Invalid photo URL'),
    validate,
  ],
  updateProfile
);

export default router;
