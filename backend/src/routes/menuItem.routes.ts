import { Router } from 'express';
import { param } from 'express-validator';
import { validate } from '../middleware/validate.middleware';
import { getMenuItemById } from '../controllers/menuItem.controller';

const router = Router();

router.get(
  '/:id',
  [param('id').notEmpty().withMessage('Invalid menu item id'), validate],
  getMenuItemById
);

export default router;
