import type { ApiResponse } from '@rahaa/shared';
import { API_URL, ApiError } from './api';
import { getAccessToken } from '../store/authStore';

async function uploadImage(localUri: string, endpoint: string): Promise<string> {
  const accessToken = await getAccessToken();

  const formData = new FormData();
  const fileName = localUri.split('/').pop() ?? 'photo.jpg';
  const extension = fileName.split('.').pop()?.toLowerCase() ?? 'jpg';
  formData.append('photo', {
    uri: localUri,
    name: fileName,
    type: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
  } as unknown as Blob);

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    body: formData,
  });

  const json = (await res.json()) as ApiResponse<{ url: string }>;

  if (!json.success) {
    throw new ApiError(res.status, json.error?.code ?? 'UNKNOWN', json.error?.message ?? 'Upload failed');
  }

  return json.data!.url;
}

export function uploadProfilePhoto(localUri: string): Promise<string> {
  return uploadImage(localUri, '/uploads/profile-photo');
}

export function uploadReviewPhoto(localUri: string): Promise<string> {
  return uploadImage(localUri, '/uploads/review-photo');
}
