/**
 * TRACKING SERVICE — Worker live location queries
 */

const sharedDb = require('../../../shared/db');

const trackingService = {
  /**
   * Latest known location for a worker (from worker_locations table)
   * Falls back to workers.latitude/longitude if no history yet
   */
  latestForBooking: async (bookingId) => {
    const booking = await sharedDb.findOne('bookings', { id: bookingId });
    if (!booking) return null;

    if (sharedDb.USE_PG) {
      const rows = await sharedDb.raw(
        `SELECT latitude, longitude, recorded_at FROM worker_locations
         WHERE booking_id = $1 ORDER BY recorded_at DESC LIMIT 1`,
        [bookingId]
      );
      if (rows.length > 0) {
        return {
          latitude:  rows[0].latitude,
          longitude: rows[0].longitude,
          timestamp: rows[0].recorded_at,
          source:    'live',
        };
      }
    } else {
      const all = await sharedDb.find('worker_locations', { booking_id: bookingId });
      if (all.length > 0) {
        all.sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
        return {
          latitude:  all[0].latitude,
          longitude: all[0].longitude,
          timestamp: all[0].recorded_at,
          source:    'live',
        };
      }
    }

    // No pings yet — use worker's stored coords
    const worker = await sharedDb.findOne('workers', { id: booking.worker_id });
    if (worker?.latitude && worker?.longitude) {
      return {
        latitude:  worker.latitude,
        longitude: worker.longitude,
        timestamp: worker.updated_at,
        source:    'static',
      };
    }
    return null;
  },

  /**
   * Trail — last N location pings (for path drawing)
   */
  trailForBooking: async (bookingId, limit = 50) => {
    if (sharedDb.USE_PG) {
      const rows = await sharedDb.raw(
        `SELECT latitude, longitude, recorded_at FROM worker_locations
         WHERE booking_id = $1 ORDER BY recorded_at DESC LIMIT $2`,
        [bookingId, limit]
      );
      return rows.reverse().map((r) => ({ lat: r.latitude, lng: r.longitude, t: r.recorded_at }));
    }
    const all = await sharedDb.find('worker_locations', { booking_id: bookingId });
    all.sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
    return all.slice(-limit).map((r) => ({ lat: r.latitude, lng: r.longitude, t: r.recorded_at }));
  },
};

module.exports = trackingService;
