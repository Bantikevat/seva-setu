/**
 * PHOTO SERVICE
 * -------------------------------------------------
 * Profile photo upload with smart fallback:
 *   - Cloudinary configured → CDN URL save (production-ready)
 *   - Cloudinary blank       → base64 in DB (dev fallback, ≤1MB)
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const cloudinary = require('./cloudinary.service');

const dbPath = path.join(__dirname, '../../../auth-service/data/database.json');

const readDb  = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const writeDb = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

const photoService = {
  /**
   * Save profile photo
   * Frontend pehle browser mein compress karta hai → base64 bhejta hai
   */
  saveProfilePhoto: async (userId, base64Data) => {
    if (!base64Data || !base64Data.startsWith('data:image/')) {
      return { error: 'INVALID_IMAGE' };
    }

    // Size sanity check (base64 inflates ~33% from binary)
    const sizeKb = Math.round(base64Data.length / 1024);
    if (sizeKb > 2048) {
      return { error: 'IMAGE_TOO_LARGE', sizeKb };
    }

    const db    = readDb();
    const index = db.users.findIndex((u) => u.id === userId);
    if (index === -1) return { error: 'USER_NOT_FOUND' };

    // Old Cloudinary photo delete karo (storage bachao)
    const oldPublicId = db.users[index].profile_photo_public_id;
    if (oldPublicId && cloudinary.isConfigured()) {
      cloudinary.delete(oldPublicId).catch(() => {}); // fire-and-forget
    }

    let photoUrl;
    let publicId;

    // Cloudinary par upload (agar configured hai)
    if (cloudinary.isConfigured()) {
      const result = await cloudinary.upload(base64Data, 'seva-setu/profile-photos', {
        publicId: `user-${userId}`,
      });

      if (!result.success) {
        logger.error('Cloudinary upload failed, falling back to base64');
        photoUrl = base64Data;
      } else {
        photoUrl = result.url;
        publicId = result.publicId;
      }
    } else {
      // Dev fallback — base64 directly
      photoUrl = base64Data;
    }

    db.users[index].profile_photo           = photoUrl;
    db.users[index].profile_photo_public_id = publicId || null;
    db.users[index].updated_at              = new Date().toISOString();
    writeDb(db);

    logger.info(`Profile photo saved for user: ${userId} (${cloudinary.isConfigured() ? 'CDN' : 'base64'})`);
    return { success: true, url: photoUrl, sizeKb };
  },
};

module.exports = photoService;
