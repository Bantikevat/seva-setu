# Cloudinary Setup — Production Image Storage

## Why Cloudinary?
- **Free tier**: 25GB storage + 25GB bandwidth/month (~25,000 users)
- Auto image optimization (WebP/AVIF for modern browsers)
- CDN delivery worldwide
- On-the-fly resize / crop / quality

## Without Cloudinary (Dev mode)
App fully works. Photos are stored as base64 in JSON DB. Good for testing.
Database file grows fast — don't ship to production this way.

## Setup (5 minutes)

### 1. Sign up
Go to https://cloudinary.com → Sign Up → free account (no card needed)

### 2. Get credentials
Dashboard → **Account Details** (top of page)
Copy these 3 values:
- **Cloud name**: e.g. `dxyz12abc`
- **API Key**: e.g. `123456789012345`
- **API Secret**: e.g. `aBcDeF...` (click eye icon to reveal)

### 3. Update `.env`
Edit `services/user-service/.env`:
```env
CLOUDINARY_CLOUD_NAME=dxyz12abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=aBcDeF...
```

### 4. Restart user-service
```bash
cd services/user-service
npm run dev
```

You'll see in logs:
- ✓ Real upload: `Uploaded to Cloudinary: seva-setu/profile-photos/user-abc (45KB)`
- ❌ Fallback: `Cloudinary not configured — env vars missing`

## What gets uploaded where

| Folder | What |
|--------|------|
| `seva-setu/profile-photos/` | User avatars (overwrites old) |
| `seva-setu/reviews/` | Photo reviews |
| `seva-setu/chat/` | Chat attachments |
| `seva-setu/problem-photos/` | AI problem capture photos |
| `seva-setu/addresses/` | Address landmark photos |

## API Endpoints

### Profile photo (auth required)
```
POST /users/me/photo
Body: { photo: "data:image/jpeg;base64,..." }
Returns: { url: "https://res.cloudinary.com/...", sizeKb: 45 }
```

### Generic upload (auth required)
```
POST /users/upload-image
Body: { photo: "data:image/jpeg;base64,...", folder: "reviews" }
Returns: { url, publicId, width, height, bytes }
```

## Frontend usage

```ts
import { uploadToCloud, optimizeCloudinaryUrl } from '@/utils/image-upload';

// In a review form:
const url = await uploadToCloud(file, 'reviews');
// url = "https://res.cloudinary.com/dxyz/image/upload/v.../seva-setu/reviews/abc.jpg"

// Display thumbnail (CDN does resize):
<img src={optimizeCloudinaryUrl(url, { width: 200, height: 200, crop: 'fill' })} />
```

## Cost estimate
- 1000 active users, 5 photos each = 5000 photos
- ~200KB compressed each = 1GB total
- ~50K image loads/month = 10GB bandwidth
- **Total: ~11GB / 25GB free** ✓ Free tier covered
