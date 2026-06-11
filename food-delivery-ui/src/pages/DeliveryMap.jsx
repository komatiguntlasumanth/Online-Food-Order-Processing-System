import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Compass, Navigation, Store, Map } from 'lucide-react';

export default function DeliveryMap({ orderStatus, isPartnerView = false, onArrived = null }) {
  const [progress, setProgress] = useState(0); // 0 to 100
  const [coords, setCoords] = useState({ lat: 17.4483, lng: 78.3741 }); // Live coordinate simulator
  const animationRef = useRef(null);

  // Predefined coordinates
  const storeCoords = { x: 120, y: 280, label: "Swiggy Express Kitchen (Madhapur)" };
  const customerCoords = { x: 380, y: 80, label: "Customer Location" };

  // Define a nice curved path for the delivery route
  // We'll use a bezier curve or segmented line path for the map
  const pathPoints = [
    { x: 120, y: 280 }, // Store
    { x: 160, y: 280 }, // Turn right
    { x: 160, y: 180 }, // Main street intersection
    { x: 300, y: 180 }, // Highway segment
    { x: 300, y: 80 },  // Turn north
    { x: 380, y: 80 }   // Customer destination
  ];

  // Helper to interpolate points along the path
  const getPointAlongPath = (t) => {
    // t is 0 to 1
    const totalSegments = pathPoints.length - 1;
    const position = t * totalSegments;
    const index = Math.min(Math.floor(position), totalSegments - 1);
    const segmentT = position - index;

    const start = pathPoints[index];
    const end = pathPoints[index + 1];

    return {
      x: start.x + (end.x - start.x) * segmentT,
      y: start.y + (end.y - start.y) * segmentT
    };
  };

  const currentPos = getPointAlongPath(progress / 100);

  // Map progress to actual Hyderabad coordinates for telemetry simulation
  // Store: Madhapur (17.4483, 78.3741), Customer: Kondapur (17.4622, 78.3568)
  useEffect(() => {
    const startLat = 17.4483;
    const startLng = 78.3741;
    const endLat = 17.4622;
    const endLng = 78.3568;

    const currentLat = startLat + (endLat - startLat) * (progress / 100);
    const currentLng = startLng + (endLng - startLng) * (progress / 100);

    setCoords({
      lat: currentLat.toFixed(5),
      lng: currentLng.toFixed(5)
    });
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

  const pathD = `M ${pathPoints.map(p => `${p.x},${p.y}`).join(' L ')}`;

  // Telemetry stats
  const distanceRemaining = ((1 - progress / 100) * 1.8).toFixed(1); // in km
  const etaMinutes = Math.ceil((1 - progress / 100) * 8);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
      
      {/* Telemetry HUD Panel */}
      <div className="absolute top-4 left-4 right-4 z-10 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-[#fc8019] animate-pulse">
            <Navigation className="w-5 h-5 rotate-45" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live Telemetry</div>
            <div className="text-sm font-black flex items-center gap-1.5 font-mono">
              {coords.lat}°N, {coords.lng}°E
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Distance</span>
            <span className="text-sm font-extrabold font-mono">{distanceRemaining} km</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ETA</span>
            <span className="text-sm font-extrabold text-[#fc8019] font-mono">{progress >= 100 ? 'Arrived' : `${etaMinutes} mins`}</span>
          </div>
        </div>
      </div>

      {/* Interactive Canvas/SVG Map Grid */}
      <div className="w-full h-80 relative select-none" style={{ background: '#111827' }}>
        
        {/* SVG Grid Lines to look techy */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.05]" width="100%" height="100%">
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* SVG Routes and Points */}
        <svg className="w-full h-full relative" viewBox="0 0 500 360">
          
          {/* Simulated Roads/Bridges (Background styling) */}
          <path d="M 0,280 L 500,280" stroke="#1f2937" strokeWidth="20" strokeLinecap="round" fill="none" />
          <path d="M 160,0 L 160,360" stroke="#1f2937" strokeWidth="20" strokeLinecap="round" fill="none" />
          <path d="M 0,180 L 500,180" stroke="#1f2937" strokeWidth="20" strokeLinecap="round" fill="none" />
          <path d="M 300,0 L 300,360" stroke="#1f2937" strokeWidth="20" strokeLinecap="round" fill="none" />
          <path d="M 0,80 L 500,80" stroke="#1f2937" strokeWidth="20" strokeLinecap="round" fill="none" />

          {/* Road center lines */}
          <path d="M 0,280 L 500,280" stroke="#374151" strokeWidth="1" strokeDasharray="6,6" fill="none" />
          <path d="M 160,0 L 160,360" stroke="#374151" strokeWidth="1" strokeDasharray="6,6" fill="none" />
          <path d="M 0,180 L 500,180" stroke="#374151" strokeWidth="1" strokeDasharray="6,6" fill="none" />
          <path d="M 300,0 L 300,360" stroke="#374151" strokeWidth="1" strokeDasharray="6,6" fill="none" />
          <path d="M 0,80 L 500,80" stroke="#374151" strokeWidth="1" strokeDasharray="6,6" fill="none" />

          {/* Planned Route Polyline (Dashed Orange Line) */}
          <path
            d={pathD}
            fill="none"
            stroke="#fdba74"
            strokeWidth="3"
            strokeDasharray="5,5"
            opacity="0.4"
          />

          {/* Active Completed Route Path (Solid Orange Line) */}
          <path
            d={pathD}
            fill="none"
            stroke="#fc8019"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="1000"
            strokeDashoffset={1000 - (1000 * progress) / 100}
            className="transition-all"
          />

          {/* Store Pin (Origin) */}
          <g transform={`translate(${storeCoords.x}, ${storeCoords.y})`}>
            <circle r="22" fill="#fc8019" fillOpacity="0.1" />
            <circle r="12" fill="#fc8019" fillOpacity="0.2" />
            <circle r="6" fill="#fc8019" />
            <foreignObject x="-12" y="-30" width="24" height="24">
              <div className="text-white bg-slate-950/80 border border-orange-500/50 p-1 rounded-lg flex items-center justify-center">
                <Store className="w-3.5 h-3.5 text-[#fc8019]" />
              </div>
            </foreignObject>
          </g>

          {/* Customer House Pin (Destination) */}
          <g transform={`translate(${customerCoords.x}, ${customerCoords.y})`}>
            <circle r="22" fill="#ef4444" fillOpacity="0.1" className="animate-pulse" />
            <circle r="12" fill="#ef4444" fillOpacity="0.2" />
            <circle r="6" fill="#ef4444" />
            <foreignObject x="-12" y="-30" width="24" height="24">
              <div className="text-white bg-slate-950/80 border border-red-500/50 p-1 rounded-lg flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
              </div>
            </foreignObject>
          </g>

          {/* Biker / Delivery Partner Avatar (Moving) */}
          {progress > 0 && progress < 100 && (
            <g transform={`translate(${currentPos.x}, ${currentPos.y})`}>
              {/* Pulsing locator rings */}
              <circle r="25" fill="#3b82f6" fillOpacity="0.15" className="animate-pulse-ring" />
              <circle r="12" fill="#3b82f6" fillOpacity="0.3" />
              <circle r="6" fill="#3b82f6" />
              <foreignObject x="-15" y="-35" width="30" height="30">
                <div className="bg-blue-600 text-white rounded-full border-2 border-white shadow-xl w-7 h-7 flex items-center justify-center font-bold text-sm transform hover:scale-110 transition-transform">
                  🚴
                </div>
              </foreignObject>
            </g>
          )}
        </svg>

        {/* Labels overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[9px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-950/30 px-3 py-1.5 rounded-lg backdrop-blur-sm">
          <span className="flex items-center gap-1 text-[#fc8019]"><Store className="w-3 h-3" /> Store (Madhapur)</span>
          <span className="text-blue-400">🚴 Delivery Route (In-Progress)</span>
          <span className="flex items-center gap-1 text-red-500"><MapPin className="w-3 h-3" /> Customer Destination</span>
        </div>
      </div>
    </div>
  );
}
