import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation } from 'lucide-react';

// Fix leaflet icon issues with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const storeIcon = L.divIcon({
  html: `<div style="background-color: #fc8019; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;"><span style="color: white; font-size: 12px; font-weight: bold;">S</span></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const customerIcon = L.divIcon({
  html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;"><span style="color: white; font-size: 12px; font-weight: bold;">C</span></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const bikerIcon = L.divIcon({
  html: `<div style="background-color: #3b82f6; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; font-size: 16px;">🚴</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export default function DeliveryMap({ orderStatus, isPartnerView = false, onArrived = null }) {
  const [progress, setProgress] = useState(0); // 0 to 100
  
  // Real Coordinates in Hyderabad
  const storeLatLng = [17.4483, 78.3741];
  const customerLatLng = [17.4622, 78.3568];
  
  const [currentLatLng, setCurrentLatLng] = useState(storeLatLng);
  const animationRef = useRef(null);

  // A simple angled polyline route
  const routePositions = [
    storeLatLng,
    [17.4520, 78.3741], // up
    [17.4520, 78.3650], // left
    [17.4622, 78.3650], // up
    customerLatLng      // left
  ];

  // Helper to interpolate position along the route array based on 0-100 progress
  const getPositionAlongRoute = (prog) => {
    const t = prog / 100;
    const totalSegments = routePositions.length - 1;
    const position = t * totalSegments;
    const index = Math.min(Math.floor(position), totalSegments - 1);
    const segmentT = position - index;

    const start = routePositions[index];
    const end = routePositions[index + 1];

    if (!start || !end) return customerLatLng;

    return [
      start[0] + (end[0] - start[0]) * segmentT,
      start[1] + (end[1] - start[1]) * segmentT
    ];
  };

  useEffect(() => {
    setCurrentLatLng(getPositionAlongRoute(progress));
  }, [progress]);

  // Simulate movement when status is en-route or tracking
  useEffect(() => {
    if (orderStatus === 'OUT_FOR_DELIVERY' || orderStatus === 'PICKED_UP' || orderStatus === 'DELIVERING') {
      let lastTime = performance.now();
      
      const animate = (time) => {
        const delta = time - lastTime;
        lastTime = time;

        setProgress((prev) => {
          // Slowly increase progress
          const speed = isPartnerView ? 2.8 : 2.0; // Increment speed per second
          const next = prev + (speed * delta) / 1000;
          
          if (next >= 100) {
            if (onArrived) onArrived();
            return 100;
          }
          return next;
        });

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    } else if (orderStatus === 'DELIVERED') {
      setProgress(100);
    } else {
      setProgress(0);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [orderStatus, isPartnerView]);

  // Telemetry stats
  const distanceRemaining = ((1 - progress / 100) * 1.8).toFixed(1); // in km
  const etaMinutes = Math.ceil((1 - progress / 100) * 8);
  const centerLat = (storeLatLng[0] + customerLatLng[0]) / 2;
  const centerLng = (storeLatLng[1] + customerLatLng[1]) / 2;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-2xl relative" style={{ height: '350px' }}>
      
      {/* Telemetry HUD Panel */}
      <div className="absolute top-4 left-4 right-4 z-[400] bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-4 flex justify-between items-center text-slate-900 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-[#fc8019] animate-pulse">
            <Navigation className="w-5 h-5 rotate-45" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Live Telemetry</div>
            <div className="text-sm font-black flex items-center gap-1.5 font-mono">
              {currentLatLng[0].toFixed(4)}°N, {currentLatLng[1].toFixed(4)}°E
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Distance</span>
            <span className="text-sm font-extrabold font-mono">{distanceRemaining} km</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">ETA</span>
            <span className="text-sm font-extrabold text-[#fc8019] font-mono">{progress >= 100 ? 'Arrived' : `${etaMinutes} mins`}</span>
          </div>
        </div>
      </div>

      <MapContainer 
        center={[centerLat, centerLng]} 
        zoom={14} 
        scrollWheelZoom={true} 
        style={{ width: '100%', height: '100%', zIndex: 100 }}
        zoomControl={true}
      >
        {/* Google Maps-style tiles using Google's mt1 server (standard map) */}
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        />
        
        {/* Route */}
        <Polyline positions={routePositions} pathOptions={{ color: '#fdba74', weight: 4, dashArray: '5, 5' }} />
        
        {/* Traveled Route */}
        <Polyline positions={[routePositions[0], currentLatLng]} pathOptions={{ color: '#fc8019', weight: 5 }} />

        {/* Store */}
        <Marker position={storeLatLng} icon={storeIcon} />
        
        {/* Customer */}
        <Marker position={customerLatLng} icon={customerIcon} />

        {/* Biker */}
        {progress > 0 && progress < 100 && (
           <Marker position={currentLatLng} icon={bikerIcon} />
        )}
      </MapContainer>
    </div>
  );
}
