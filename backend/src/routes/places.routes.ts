import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { autocomplete, placeDetails, reverseGeocode } from '../controllers/places.controller';

const router = Router();

router.use(authenticate);

// GET /api/v1/places/autocomplete?q=Kimironko&lat=-1.94&lng=30.06
router.get('/autocomplete', autocomplete);

// GET /api/v1/places/details?placeId=...
router.get('/details', placeDetails);

// GET /api/v1/places/reverse-geocode?lat=-1.9441&lng=30.0619
router.get('/reverse-geocode', reverseGeocode);

export default router;
