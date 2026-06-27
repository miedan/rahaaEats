import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response';
import { ENV } from '../config/env';
import cloudinary from '../config/cloudinary';

async function uploadToCloudinary(buffer: Buffer, folder: string): Promise<string> {
  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, uploadResult) => {
        if (error || !uploadResult) return reject(error);
        resolve(uploadResult as { secure_url: string });
      }
    );
    stream.end(buffer);
  });
  return result.secure_url;
}

function handleUpload(folder: string) {
  return async (req: AuthRequest, res: Response): Promise<void> => {
    if (!ENV.CLOUDINARY_CLOUD_NAME || !ENV.CLOUDINARY_API_KEY || !ENV.CLOUDINARY_API_SECRET) {
      sendError(res, 503, 'UPLOAD_NOT_CONFIGURED', 'Image uploads are not configured on this server');
      return;
    }

    const file = req.file;
    if (!file) {
      sendError(res, 400, 'NO_FILE', 'No image file was provided');
      return;
    }

    try {
      const url = await uploadToCloudinary(file.buffer, folder);
      sendSuccess(res, { url });
    } catch {
      sendError(res, 502, 'UPLOAD_FAILED', 'Failed to upload image');
    }
  };
}

export const uploadProfilePhoto = handleUpload('rahaa/profile-photos');
export const uploadReviewPhoto = handleUpload('rahaa/review-photos');
export const uploadRestaurantPhoto = handleUpload('rahaa/restaurant-photos');
