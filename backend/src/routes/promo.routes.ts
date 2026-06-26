import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { listPromoCodes, validatePromo } from '../controllers/promo.controller';

const router = Router();

router.use(authenticate);

// GET /api/v1/promo
router.get('/', listPromoCodes);

// POST /api/v1/promo/validate
router.post(
  '/validate',
  [
    body('code').isString().notEmpty().withMessage('code is required'),
    body('subtotalRwf').isInt({ min: 0 }).withMessage('subtotalRwf must be a non-negative integer'),
    validate,
  ],
  validatePromo
);

export default router;
