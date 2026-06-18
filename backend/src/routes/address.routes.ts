import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/address.controller';

const router = Router();

router.use(authenticate);

router.get('/', getAddresses);

router.post(
  '/',
  [
    body('label').notEmpty().withMessage('Label is required'),
    body('lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    body('district').notEmpty().withMessage('District is required'),
    validate,
  ],
  createAddress
);

router.patch('/:id', updateAddress);

router.delete('/:id', deleteAddress);

router.patch('/:id/set-default', setDefaultAddress);

export default router;
