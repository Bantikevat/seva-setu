/**
 * IMAGE UPLOAD HELPER
 * Browser compress â†’ Cloudinary CDN â†’ URL return
 *
 * Use anywhere:
 *   const url = await uploadToCloud(file, 'reviews');
 *   <img src={url} />
 */

import { compressImage } from './free-features';
import { user } from '@/services/api';
import { logger } from '@/utils/logger';

type Folder = 'reviews' | 'chat' | 'problem-photos' | 'addresses' | 'worker-photos' | 'worker-docs';

interface UploadOptions {
  maxWidth?: number;   // default 1200 (good for reviews, chat)
  quality?: number;    // 0-1, default 0.75
}

/**
 * Compress + upload single image.
 * Returns the CDN URL (or base64 in dev fallback).
 */
export const uploadToCloud = async (
  file: File,
  folder: Folder,
  options: UploadOptions = {}
): Promise<string | null> => {
  const { maxWidth = 1200, quality = 0.75 } = options;

  try {
    const compressed = await compressImage(file, maxWidth, quality);
    const res = await user.uploadImage(compressed, folder);
    if (res.data?.url) return res.data.url;
    return null;
  } catch (err) {
    logger.error('uploadToCloud failed', err);
    return null;
  }
};

/**
 * Upload multiple files in parallel. Returns array of URLs (nulls for failures).
 */
export const uploadMultiple = async (
  files: File[],
  folder: Folder,
  options: UploadOptions = {}
): Promise<string[]> => {
  const results = await Promise.all(files.map((f) => uploadToCloud(f, folder, options)));
  return results.filter((u): u is string => !!u);
};

/**
 * Cloudinary URL transformer â€” request smaller version on the fly
 * Pass any Cloudinary URL with /upload/ in it
 */
export const optimizeCloudinaryUrl = (
  url: string | undefined,
  opts: { width?: number; height?: number; crop?: 'fill' | 'limit' | 'fit' } = {}
): string => {
  if (!url || !url.includes('/upload/')) return url || '';
  const { width, height, crop = 'limit' } = opts;
  const parts = ['f_auto', 'q_auto'];
  if (width)  parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  if (crop)   parts.push(`c_${crop}`);
  return url.replace('/upload/', `/upload/${parts.join(',')}/`);
};
