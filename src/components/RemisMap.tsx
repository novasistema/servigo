import React, { useEffect, useRef } from 'react';
import { RemisDriver } from '../types';
import L from 'leaflet';

interface RemisMapProps {
  drivers: RemisDriver[];
  selectedDriverId?: string;
  onSelectDriver?: (driver: RemisDriver) => void;
  origin?: string;
  destination?: string;
}

export const RemisMap: React.FC<RemisMapProps> = ({
  drivers,
  selectedDriverId,
  onSelectDriver,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  // Ensure Leaflet CSS is loaded in the DOM head
  useEffect(() => {
    const existingLink = document.getElementById('leaflet-css');
    if (!existingLink) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center: Alejandro Roca, Córdoba (-33.3534, -63.7176)
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([-33.3534, -63.7176], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors | ServiGo Remises',
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => (m as L.Marker).remove());
    markersRef.current = {};

    const bounds: L.LatLngExpression[] = [];

    drivers.forEach((driver) => {
      const lat = driver.coordinates?.lat || -33.3534;
      const lng = driver.coordinates?.lng || -63.7176;
      bounds.push([lat, lng]);

      const isSelected = driver.id === selectedDriverId;
      const isAvailable = driver.status === 'disponible';
      const isInTrip = driver.status === 'en_viaje';

      const statusBg = isAvailable
        ? '#10b981' // emerald
        : isInTrip
        ? '#f59e0b' // amber
        : '#ef4444'; // red

      const borderBg = isSelected ? '#ea580c' : '#1e293b';

      const customHtml = `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
          background: ${borderBg};
          color: white;
          padding: 5px 10px;
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          font-family: sans-serif;
          font-size: 11px;
          font-weight: 800;
          border: 2px solid ${isSelected ? '#f97316' : '#ffffff'};
          transform: scale(${isSelected ? 1.15 : 1});
          transition: all 0.2s ease;
          cursor: pointer;
          white-space: nowrap;
        ">
          <span style="
            width: 9px;
            height: 9px;
            border-radius: 50%;
            background-color: ${statusBg};
            box-shadow: 0 0 8px ${statusBg};
          "></span>
          <span>🚕 ${driver.name.split(' ')[0]}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-remis-marker',
        html: customHtml,
        iconSize: [120, 32],
        iconAnchor: [60, 16],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        if (onSelectDriver) {
          onSelectDriver(driver);
        }
      });

      const popupContent = `
        <div style="font-family: sans-serif; padding: 4px; min-width: 180px;">
          <div style="font-weight: 900; font-size: 13px; color: #0f172a;">${driver.name}</div>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">
            🚗 <b>${driver.vehicle.make} ${driver.vehicle.model}</b> (${driver.vehicle.color})
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
            Patente: <span style="background: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-weight: bold;">${driver.vehicle.plate}</span>
          </div>
          <div style="margin-top: 6px; font-size: 11px; font-weight: bold; color: ${isAvailable ? '#059669' : '#d97706'};">
            ${isAvailable ? '🟢 DISPONIBLE' : isInTrip ? '🟡 EN VIAJE' : '🔴 FUERA DE SERVICIO'}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current[driver.id] = marker;
    });

    if (bounds.length > 0 && map) {
      try {
        map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [40, 40], maxZoom: 14 });
      } catch (e) {
        // Fallback
      }
    }
  }, [drivers, selectedDriverId, onSelectDriver]);

  return (
    <div className="relative w-full h-full min-h-[350px] rounded-3xl overflow-hidden border border-slate-200 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px] z-0" />

      {/* Map Badge Overlay */}
      <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-slate-700/80 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        Mapa de Remises en Tiempo Real
      </div>
    </div>
  );
};
