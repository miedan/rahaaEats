import { z } from 'zod';

const localPhoneDigits = z
  .string()
  .min(9, 'Enter a valid phone number')
  .max(9, 'Enter a valid phone number')
  .regex(/^[7][0-9]{8}$/, 'Enter a valid Rwandan phone number');

export const loginSchema = z.object({
  localPhone: localPhoneDigits,
  password: z.string().min(1, 'Password is required'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  localPhone: localPhoneDigits,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  agreedToTerms: z
    .boolean()
    .refine((value) => value === true, { message: 'You must agree to the terms & conditions' }),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const otpSchema = z.object({
  otp: z.string().length(6, 'Enter the 6-digit code'),
});
export type OtpFormValues = z.infer<typeof otpSchema>;

export const forgotPasswordPhoneSchema = z.object({
  localPhone: localPhoneDigits,
});
export type ForgotPasswordPhoneValues = z.infer<typeof forgotPasswordPhoneSchema>;

export const createProfileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.union([z.string().email('Enter a valid email address'), z.literal('')]).optional(),
});
export type CreateProfileFormValues = z.infer<typeof createProfileSchema>;

export const newPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Re-enter your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;
