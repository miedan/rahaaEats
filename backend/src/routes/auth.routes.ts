import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.middleware';
import {
  register,
  verifyOtp,
  login,
  forgotPassword,
  resetPasswordHandler,
  refreshTokenHandler,
  logout,
  resendOtpHandler,
} from '../controllers/auth.controller';

const router = Router();

const phoneRule = body('phoneNumber')
  .notEmpty()
  .withMessage('Phone number is required')
  .matches(/^(\+250|250|07|7)\d{8,9}$/)
  .withMessage('Invalid Rwandan phone number');

const passwordRule = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters');

const otpRule = body('otp')
  .isLength({ min: 6, max: 6 })
  .isNumeric()
  .withMessage('OTP must be 6 digits');

router.post('/register', [phoneRule, passwordRule, validate], register);

router.post('/verify-otp', [phoneRule, otpRule, validate], verifyOtp);

router.post('/login', [phoneRule, passwordRule, validate], login);

router.post('/forgot-password', [phoneRule, validate], forgotPassword);

router.post(
  '/reset-password',
  [
    phoneRule,
    otpRule,
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    validate,
  ],
  resetPasswordHandler
);

router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required'), validate],
  refreshTokenHandler
);

router.post('/logout', logout);

router.post(
  '/resend-otp',
  [
    phoneRule,
    body('purpose')
      .isIn(['REGISTRATION', 'PASSWORD_RESET'])
      .withMessage('Invalid purpose'),
    validate,
  ],
  resendOtpHandler
);

export default router;
