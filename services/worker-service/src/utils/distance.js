/**
 * DISTANCE UTILITY
 * -------------------------------------------------
 * Haversine formula — 2 GPS coordinates ke beech
 * actual distance in km.
 *
 * Example:
 *   getDistance(26.9124, 75.7873, 26.9220, 75.7950)
 *   // returns: 1.2 (km)
 */

const toRad = (degrees) => degrees * (Math.PI / 180);

const getDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 10) / 10; // 1 decimal place
};

module.exports = { getDistance };
