import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { listFavorites, addFavorite, removeFavorite } from '../controllers/favorite.controller';

const router = Router();

router.use(authenticate);

router.get('/', listFavorites);
router.post('/', addFavorite);
router.delete('/:menuItemId', removeFavorite);

export default router;
