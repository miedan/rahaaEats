import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.middleware';
import { uploadProfilePhoto, uploadReviewPhoto } from '../controllers/upload.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = Router();

router.use(authenticate);

// POST /api/v1/uploads/profile-photo
router.post('/profile-photo', upload.single('photo'), uploadProfilePhoto);

// POST /api/v1/uploads/review-photo
router.post('/review-photo', upload.single('photo'), uploadReviewPhoto);

export default router;
