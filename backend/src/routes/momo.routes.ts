import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  listMomoNumbers,
  createMomoNumber,
  deleteMomoNumber,
  setDefaultMomoNumber,
} from '../controllers/momo.controller';

const router = Router();

router.use(authenticate);

router.get('/', listMomoNumbers);

router.post(
  '/',
  [
    body('phoneNumber').matches(/^\+2507\d{8}$/).withMessage('Invalid Rwandan phone number'),
    body('provider').isIn(['MTN', 'AIRTEL']).withMessage('Invalid provider'),
    validate,
  ],
  createMomoNumber
);

router.delete('/:id', deleteMomoNumber);

router.patch('/:id/set-default', setDefaultMomoNumber);

export default router;
