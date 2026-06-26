import { Router } from 'express';
import { query } from 'express-validator';
import { validate } from '../middleware/validate.middleware';
import { search } from '../controllers/search.controller';

const router = Router();

router.get(
  '/',
  [
    query('type').optional().isIn(['all', 'foods', 'restaurants']).withMessage('Invalid type'),
    query('lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    query('lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    query('sort').optional().isIn(['rating']).withMessage('Invalid sort'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Invalid limit'),
    query('category')
      .optional()
      .isIn(['BURGER', 'BEEF', 'DESSERT', 'JUICE', 'NOODLES', 'PIZZA', 'SALAD', 'OTHER'])
      .withMessage('Invalid category'),
    query('restaurantId').optional().isString(),
    validate,
  ],
  search
);

export default router;
