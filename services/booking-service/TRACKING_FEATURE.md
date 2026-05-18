# Real-Time Worker Tracking

Worker broadcasts GPS location → customer sees it move on map in real time.

## Architecture (reuses chat infrastructure)

```
[Worker Dashboard]                    [Customer Tracking Screen]
  LocationShareButton                       useTracking(bookingId)
        │                                          │
        └─ useTrackingBroadcast                    │
             │ navigator.geolocation.watchPosition │
             │   ↓                                 │
             └─ socket.emit('tracking:update', {...}) ─┐
                                                       │
                  ┌────────────────────────────────────┘
                  ↓
            booking-service Socket.io
              │
              ├─ Verify worker is participant
              ├─ INSERT into worker_locations (history)
              ├─ UPDATE workers.latitude/longitude (latest)
              └─ io.to('booking:<id>').emit('tracking:location', {...}) ──→ customer
```

## Socket Events

| Direction | Event | Payload |
|-----------|-------|---------|
| W→S | `tracking:update` | `{ bookingId, latitude, longitude }` |
| S→C | `tracking:location` | `{ bookingId, latitude, longitude, timestamp }` |
| S→W | `tracking:error` | `{ code, message }` |

Only the worker on a booking can send `tracking:update`. Anyone in the booking room (customer + worker) receives `tracking:location`.

## REST Endpoints

```
GET /tracking/:bookingId/latest   → { latitude, longitude, timestamp, source: 'live'|'static' }
GET /tracking/:bookingId/trail    → { points: [{ lat, lng, t }] }
```

`source: 'static'` = no live pings yet, returning worker's stored coords (fallback).

## Frontend Hooks

### Customer side
```ts
const { location, trail, isLive, isConnected } = useTracking(bookingId);
```
- Fetches latest via REST on mount
- Subscribes to live updates via Socket.io
- Auto-updates `location` state when new ping arrives

### Worker side
```ts
const { start, stop, status, lastSent } = useTrackingBroadcast(bookingId);
```
- `start()` requests GPS permission, opens socket, calls `watchPosition`
- Every position update emitted via `tracking:update`
- `status` = idle | connecting | sharing | denied | error

## UI integration

### Worker Dashboard
For active bookings (`on_the_way` / `in_progress`), shows `<LocationShareButton>`.
Worker taps → GPS prompt → live broadcasts every 5-15s (browser-managed).

### Customer Tracking Screen (`/tracking/:bookingId`)
- Map shows worker pin (live coords if available, animated fallback otherwise)
- **Distance + ETA card** appears when live signal active (Haversine + 25 km/h avg)
- LIVE/Waiting/Offline indicator in top-right

## Verified live ✓
```
✓ Worker socket connect → tracking:update event
✓ Server validates worker role (FORBIDDEN if not participant)
✓ worker_locations row inserted ✓
✓ workers.latitude/longitude updated ✓
✓ GET /tracking/:id/latest now returns source:"live" 
```

## How to test

**Tab 1 — Customer**
1. Login as customer A → open booking → tap "Track" or open `/tracking/:bookingId`
2. Indicator shows "Waiting"

**Tab 2 — Worker** (different browser / incognito)
1. Login as worker assigned to that booking → Worker Dashboard
2. Find the active booking card → tap **Share live location**
3. Allow GPS permission

→ Tab 1 indicator turns **LIVE** (red dot)
→ Map pin moves to worker's actual coordinates
→ Distance + ETA card appears
→ Updates every few seconds as worker moves

## Production considerations

- Throttle pings to 1 per 5s server-side (currently every browser update accepted)
- Add geofence check: ignore pings >50km from booking address (fraud prevention)
- Persist socket disconnect → mark worker offline after 30s no ping
- Add ETA refinement using Mapbox Directions API for road distance
