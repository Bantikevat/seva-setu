/**
 * LEAFLET MAP — FREE OpenStreetMap
 * No API key needed!
 */

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    L: any;
  }
}

interface LeafletMapProps {
  customerLat: number;
  customerLng: number;
  workerLat?: number;
  workerLng?: number;
  workerName?: string;
  categoryEmoji?: string;
  height?: string;
}

export const LeafletMap = ({
  customerLat,
  customerLng,
  workerLat,
  workerLng,
  workerName = 'Worker',
  categoryEmoji = '🔧',
  height = '100%',
}: LeafletMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Wait for Leaflet to load from CDN
    const initMap = () => {
      if (!window.L || !mapRef.current) {
        setTimeout(initMap, 100);
        return;
      }

      // Load Leaflet JS dynamically
      if (!document.getElementById('leaflet-script')) {
        const script = document.createElement('script');
        script.id = 'leaflet-script';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        document.head.appendChild(script);
        script.onload = createMap;
      } else {
        createMap();
      }
    };

    const createMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const L = window.L;

      // Create map centered between worker and customer
      const centerLat = workerLat ? (customerLat + workerLat) / 2 : customerLat;
      const centerLng = workerLng ? (customerLng + workerLng) / 2 : customerLng;

      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([centerLat, centerLng], 14);

      // FREE OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Custom icons using divIcon (HTML/CSS based — FREE)
      const customerIcon = L.divIcon({
        html: `
          <div style="position: relative;">
            <div style="
              width: 48px; height: 48px;
              background: linear-gradient(135deg, #10B981, #059669);
              border-radius: 50%;
              border: 4px solid white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 22px;
            ">🏠</div>
            <div style="
              position: absolute;
              top: 100%; left: 50%;
              transform: translateX(-50%);
              background: white;
              padding: 2px 8px;
              border-radius: 8px;
              font-size: 10px;
              font-weight: bold;
              white-space: nowrap;
              box-shadow: 0 2px 4px rgba(0,0,0,0.15);
              margin-top: 4px;
            ">YOUR HOME</div>
          </div>
        `,
        className: 'custom-marker',
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });

      const workerIcon = L.divIcon({
        html: `
          <div style="position: relative;">
            <div style="
              position: absolute;
              inset: -8px;
              border-radius: 50%;
              background: rgba(255, 107, 53, 0.3);
              animation: pulse 2s infinite;
            "></div>
            <div style="
              position: relative;
              width: 56px; height: 56px;
              background: linear-gradient(135deg, #FF6B35, #F7931E);
              border-radius: 50%;
              border: 4px solid white;
              box-shadow: 0 4px 16px rgba(255,107,53,0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 26px;
            ">${categoryEmoji}</div>
            <div style="
              position: absolute;
              top: 100%; left: 50%;
              transform: translateX(-50%);
              background: #FF6B35;
              color: white;
              padding: 2px 10px;
              border-radius: 10px;
              font-size: 10px;
              font-weight: bold;
              white-space: nowrap;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              margin-top: 4px;
            ">${workerName}</div>
          </div>
          <style>
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              100% { transform: scale(1.6); opacity: 0; }
            }
          </style>
        `,
        className: 'custom-marker',
        iconSize: [56, 56],
        iconAnchor: [28, 28],
      });

      // Customer marker
      L.marker([customerLat, customerLng], { icon: customerIcon }).addTo(map);

      // Worker marker + route
      if (workerLat && workerLng) {
        L.marker([workerLat, workerLng], { icon: workerIcon }).addTo(map);

        // Draw route line
        L.polyline([[workerLat, workerLng], [customerLat, customerLng]], {
          color: '#FF6B35',
          weight: 4,
          opacity: 0.8,
          dashArray: '10, 10',
        }).addTo(map);

        // Fit map to show both markers
        const bounds = L.latLngBounds([[customerLat, customerLng], [workerLat, workerLng]]);
        map.fitBounds(bounds, { padding: [60, 60] });
      }

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [customerLat, customerLng, workerLat, workerLng, workerName, categoryEmoji]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height, borderRadius: 0 }}
      className="leaflet-container"
    />
  );
};
