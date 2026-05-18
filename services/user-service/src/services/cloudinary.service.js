/**
 * CLOUDINARY SERVICE — Image upload to Cloudinary CDN
 * -------------------------------------------------
 * Free tier: 25GB storage + 25GB bandwidth/month
 *
 * Setup:
 *   1. Sign up at https://cloudinary.com (free)
 *   2. Dashboard → Account Details → copy:
 *        - Cloud name
 *        - API Key
 *        - API Secret
 *   3. .env mein add karo:
 *        CLOUDINARY_CLOUD_NAME=your-cloud
 *        CLOUDINARY_API_KEY=your-key
 *        CLOUDINARY_API_SECRET=your-secret
 *
 * Kya karta hai:
 *   - Base64 image → Cloudinary par upload
 *   - Auto compress, auto format (WebP, AVIF for modern browsers)
 *   - CDN URL return karta hai (https://res.cloudinary.com/...)
 *   - Database mein sirf URL save hota hai (base64 nahi)
 *
 * Folder structure:
 *   seva-setu/profile-photos/
 *   seva-setu/reviews/
 *   seva-setu/chat/
 *   seva-setu/problem-photos/
 */

const crypto = require('crypto');
const logger = require('../utils/logger');

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY    = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

const isConfigured = () => !!(CLOUD_NAME && API_KEY && API_SECRET);

/**
 * Cloudinary signed upload signature banao
 * Docs: https://cloudinary.com/documentation/signatures
 */
const generateSignature = (params) => {
  // Alphabetical order + concatenate
  const sortedParams = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');

  // Append API secret
  const toSign = `${sortedParams}${API_SECRET}`;

  return crypto.createHash('sha1').update(toSign).digest('hex');
};

const cloudinaryService = {
  isConfigured,

  /**
   * Upload base64 image to Cloudinary
   *
   * @param {string} base64       - "data:image/jpeg;base64,..."
   * @param {string} folder       - e.g. "seva-setu/profile-photos"
   * @param {object} options      - { publicId?, transformation? }
   * @returns {Promise<{ success, url?, publicId?, error? }>}
   */
  upload: async (base64, folder = 'seva-setu/misc', options = {}) => {
    if (!isConfigured()) {
      logger.warn('Cloudinary not configured — env vars missing');
      return { success: false, error: 'CLOUDINARY_NOT_CONFIGURED' };
    }

    if (!base64 || !base64.startsWith('data:image/')) {
      return { success: false, error: 'INVALID_IMAGE' };
    }

    try {
      const timestamp = Math.floor(Date.now() / 1000);

      const params = {
        timestamp,
        folder,
        ...(options.publicId       && { public_id: options.publicId }),
        ...(options.transformation && { transformation: options.transformation }),
      };

      const signature = generateSignature(params);

      // Build form data
      const formData = new FormData();
      formData.append('file', base64);
      formData.append('api_key', API_KEY);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);
      formData.append('folder', folder);
      if (options.publicId)       formData.append('public_id', options.publicId);
      if (options.transformation) formData.append('transformation', options.transformation);

      const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
      const res = await fetch(url, { method: 'POST', body: formData });
      const data = await res.json();

      if (data.error) {
        logger.error('Cloudinary upload error:', data.error.message);
        return { success: false, error: data.error.message };
      }

      logger.info(`✓ Uploaded to Cloudinary: ${data.public_id} (${Math.round(data.bytes / 1024)}KB)`);

      return {
        success:  true,
        url:      data.secure_url,
        publicId: data.public_id,
        width:    data.width,
        height:   data.height,
        bytes:    data.bytes,
        format:   data.format,
      };
    } catch (err) {
      logger.error('Cloudinary upload exception:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Delete image by publicId
   */
  delete: async (publicId) => {
    if (!isConfigured()) return { success: false, error: 'CLOUDINARY_NOT_CONFIGURED' };

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = generateSignature({ public_id: publicId, timestamp });

      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('api_key', API_KEY);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);

      const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`;
      const res = await fetch(url, { method: 'POST', body: formData });
      const data = await res.json();

      return { success: data.result === 'ok' };
    } catch (err) {
      logger.error('Cloudinary delete error:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * URL helper — auto-format, auto-quality, resize
   * Example: getOptimizedUrl(url, { width: 400, crop: 'fill' })
   */
  getOptimizedUrl: (url, transforms = {}) => {
    if (!url || !url.includes('/upload/')) return url;
    const { width, height, crop = 'limit', quality = 'auto', format = 'auto' } = transforms;
    const parts = [`f_${format}`, `q_${quality}`];
    if (width)  parts.push(`w_${width}`);
    if (height) parts.push(`h_${height}`);
    if (crop)   parts.push(`c_${crop}`);
    return url.replace('/upload/', `/upload/${parts.join(',')}/`);
  },
};

module.exports = cloudinaryService;
