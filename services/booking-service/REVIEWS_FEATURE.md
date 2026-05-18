# Reviews + Photos Feature

Customer reviews with photos + worker reply + helpful votes.

## API Endpoints (booking-service)

All require `Authorization: Bearer <jwt>`.

### Submit a review (uses existing rate endpoint)
```
POST /bookings/:id/rate
Body: {
  rating: 1-5,
  review: "Optional text",
  photoUrls: ["https://res.cloudinary.com/..."]  // max 5, optional
}
Returns: { booking, review }
```
The endpoint creates a row in `reviews` table AND updates booking's rating/review fields (backward compat).
Worker's `rating_average` is recomputed automatically.

### List reviews for a worker
```
GET /reviews/worker/:workerId?rating=5&withPhotos=true&limit=20&offset=0
Returns: {
  reviews: [{ id, rating, comment, photoUrls, workerReply, helpfulCount, customerName, customerPhoto, ... }],
  summary: { average: 4.8, total: 42, counts: { 1: 0, 2: 1, 3: 2, 4: 9, 5: 30 } }
}
```

### Quick summary only
```
GET /reviews/worker/:workerId/summary
Returns: { average, total, counts }
```

### Worker replies to a review (once)
```
POST /reviews/:id/reply
Body: { reply: "Thank you for your feedback..." }
Returns: { review with worker_reply filled }
```

### Mark helpful
```
POST /reviews/:id/helpful
Returns: { success: true }
```

## Photos Storage
- Frontend compresses image (1400px max, q=0.8)
- Uploads to Cloudinary via `POST /users/upload-image` (folder: `reviews`)
- Returns CDN URL
- Up to 5 photos per review
- URLs stored as JSONB array (Postgres) or plain array (JSON DB)

## Frontend Components

| Component | File | Use |
|-----------|------|-----|
| `RatingForm` | `components/ui/RatingForm.tsx` | Inside BottomSheet on BookingDetailScreen |
| `ReviewsList` | `components/ui/ReviewsList.tsx` | Inside ReviewsScreen + WorkerDetailScreen |

## How to test

1. **Submit a review:**
   - Complete a booking → tap "Rate Worker" on Booking detail
   - Tap 5 stars, add comment, add 2 photos
   - Submit → toast shows, fireworks fire
2. **View reviews:**
   - Open Worker Detail screen → "Reviews" section → tap → ReviewsScreen
   - See rating breakdown bars, filter by 5★, toggle "With photos"
   - Tap a photo → lightbox opens
   - Tap "Helpful" → count increments
3. **Worker reply** (TODO in worker app):
   - Worker logs in → opens review → posts reply

## Data Flow

```
[BookingDetail] → tap Rate Worker → BottomSheet
    │
    └─→ <RatingForm bookingId={id} />
            ├─→ uploadToCloud(file, 'reviews')  → Cloudinary CDN
            └─→ booking.rate(id, rating, review, photoUrls)
                    └─→ booking-service: rateBooking()
                            ├─→ updates bookings table (rating, review)
                            ├─→ insert into reviews table
                            └─→ recompute worker.rating_average

[WorkerDetail] → tap Reviews → /worker/:id/reviews
    │
    └─→ <ReviewsList workerId={id} />
            ├─→ reviews.forWorker(id, filters)
            ├─→ filter bars, photo gallery, lightbox
            └─→ reviews.markHelpful(id) on tap
```
