import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { CampusLocation } from '../../types';
import { CAMPUS_LOCATIONS } from '../../data/mockCampusData';
import {
  Compass,
  Navigation,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCw,
  MapPin,
  Volume2,
  VolumeX,
  Footprints,
  Info,
} from 'lucide-react';

interface Campus3DCanvasProps {
  interactive?: boolean;
  compact?: boolean;
  onLocationSelect?: (loc: CampusLocation) => void;
}

export const Campus3DCanvas: React.FC<Campus3DCanvasProps> = ({
  interactive = true,
  compact = false,
  onLocationSelect,
}) => {
  const {
    navDestination,
    isNavigating,
    currentNavStepIndex,
    activeRoute,
    startNavigationTo,
    isVoiceGuidanceEnabled,
    setIsVoiceGuidanceEnabled,
    selectedFloor,
    setSelectedFloor,
  } = useApp();

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [is3DView, setIs3DView] = useState<boolean>(true);
  const [hoveredLoc, setHoveredLoc] = useState<CampusLocation | null>(null);
  const [selectedLoc, setSelectedLoc] = useState<CampusLocation | null>(navDestination || null);

  // Animated walker progress along route
  const [walkProgress, setWalkProgress] = useState<number>(0.15);

  useEffect(() => {
    if (navDestination) {
      setSelectedLoc(navDestination);
    }
  }, [navDestination]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isNavigating) {
      interval = setInterval(() => {
        setWalkProgress((prev) => {
          const next = prev + 0.04;
          return next > 0.9 ? 0.2 : next;
        });
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isNavigating]);

  const handlePinClick = (loc: CampusLocation) => {
    setSelectedLoc(loc);
    if (onLocationSelect) {
      onLocationSelect(loc);
    }
  };

  // Interpolate route points
  const originX = 50;
  const originY = 50;
  const destX = selectedLoc ? selectedLoc.x : 68;
  const destY = selectedLoc ? selectedLoc.y : 38;

  // Intermediate waypoint for turn-by-turn path
  const midX = originX;
  const midY = destY;

  // Walker coordinates along route
  let walkerX = originX;
  let walkerY = originY;
  if (walkProgress <= 0.5) {
    const factor = walkProgress / 0.5;
    walkerX = originX;
    walkerY = originY + (midY - originY) * factor;
  } else {
    const factor = (walkProgress - 0.5) / 0.5;
    walkerX = originX + (destX - originX) * factor;
    walkerY = midY;
  }

  return (
    <div
      className={`relative w-full overflow-hidden bg-gradient-to-b from-[#E9F3FA] via-[#D8EBF7] to-[#C8E2F5] select-none ${
        compact ? 'h-48 rounded-2xl' : 'h-[360px] sm:h-[420px] rounded-3xl'
      } border border-[#BADDF2]/80 shadow-inner`}
    >
      {/* 3D Map Transform Container */}
      <div
        className="w-full h-full flex items-center justify-center transition-transform duration-500 ease-out"
        style={{
          transform: `scale(${zoomLevel}) rotate(${rotationAngle}deg)`,
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full max-w-[500px] max-h-[500px]"
          style={{
            transform: is3DView ? 'perspective(600px) rotateX(28deg)' : 'none',
            transformOrigin: 'center center',
            transition: 'transform 0.4s ease',
          }}
        >
          <defs>
            {/* Gradients for buildings */}
            <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>

            <linearGradient id="mainBldFront" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#263D88" />
              <stop offset="100%" stopColor="#1E2F6B" />
            </linearGradient>

            <linearGradient id="sideBldGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#53AADF" />
              <stop offset="100%" stopColor="#3C95CC" />
            </linearGradient>

            <linearGradient id="pathGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#263D88" />
              <stop offset="50%" stopColor="#53AADF" />
              <stop offset="100%" stopColor="#FF0000" />
            </linearGradient>

            {/* Glowing filter for navigation route */}
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Base Campus Green Lawns & Roads */}
          <rect x="2" y="2" width="96" height="96" rx="8" fill="#E8F4EC" stroke="#CBD5E1" strokeWidth="0.5" />

          {/* North and South Pathway Roads */}
          <path
            d="M 50 5 L 50 95 M 5 50 L 95 50 M 20 20 L 80 20 L 80 80 L 20 80 Z"
            fill="none"
            stroke="#DDE5ED"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Center Fountain / Plaza circle */}
          <circle cx="50" cy="50" r="8" fill="#BADDF2" stroke="#53AADF" strokeWidth="0.8" opacity="0.7" />
          <circle cx="50" cy="50" r="4" fill="#FFFFFF" opacity="0.9" />

          {/* Green tree clusters */}
          <g fill="#A7D7B5" opacity="0.85">
            <circle cx="15" cy="40" r="3" />
            <circle cx="18" cy="43" r="2.5" />
            <circle cx="38" cy="12" r="3.2" />
            <circle cx="62" cy="14" r="2.8" />
            <circle cx="85" cy="25" r="3.5" />
            <circle cx="88" cy="28" r="2.5" />
            <circle cx="32" cy="72" r="3" />
            <circle cx="68" cy="74" r="3" />
          </g>

          {/* 2. Campus Zone: Sports Turf & Track (Top Right) */}
          <rect
            x="76"
            y="35"
            width="18"
            height="16"
            rx="3"
            fill="#86EFAC"
            stroke="#22C55E"
            strokeWidth="0.6"
            opacity="0.8"
          />
          <ellipse cx="85" cy="43" rx="6" ry="4" fill="none" stroke="#FFFFFF" strokeWidth="0.5" />

          {/* 3. Parking Area (Top Center / Zone A) */}
          <g transform="translate(38, 12)">
            <rect x="0" y="0" width="20" height="10" rx="1.5" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.5" />
            <path
              d="M 3 0 L 3 10 M 7 0 L 7 10 M 11 0 L 11 10 M 15 0 L 15 10 M 19 0 L 19 10"
              stroke="#CBD5E1"
              strokeWidth="0.4"
              strokeDasharray="1,1"
            />
            <text x="10" y="6.5" fontSize="2.5" fill="#263D88" fontWeight="bold" textAnchor="middle">
              PARKING (6 FREE)
            </text>
          </g>

          {/* 4. 3D Isometric Buildings */}

          {/* Building: Main Quad / Central Academic Building (Center-Right, x=50, y=40) */}
          <g
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => handlePinClick(CAMPUS_LOCATIONS[0])}
          >
            {/* 3D Base Shadow */}
            <path d="M 42 36 L 58 36 L 62 44 L 46 44 Z" fill="#000000" opacity="0.12" />
            {/* Front Wall */}
            <polygon points="44,38 58,38 58,45 44,45" fill="url(#mainBldFront)" />
            {/* Side Wall */}
            <polygon points="58,38 62,34 62,41 58,45" fill="#1E2F6B" />
            {/* Roof */}
            <polygon points="44,38 48,34 62,34 58,38" fill="url(#roofGrad)" stroke="#53AADF" strokeWidth="0.4" />
            {/* Building Sign */}
            <rect x="46" y="39.5" width="10" height="2" rx="0.5" fill="#FFFFFF" opacity="0.9" />
            <text x="51" y="41" fontSize="1.3" fill="#263D88" fontWeight="bold" textAnchor="middle">
              MAIN BLDG (B304)
            </text>
          </g>

          {/* Building: Knowledge Tower / Central Library (Left-Center, x=32, y=56) */}
          <g
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => handlePinClick(CAMPUS_LOCATIONS[5])}
          >
            <polygon points="28,52 38,52 38,62 28,62" fill="url(#sideBldGrad)" />
            <polygon points="38,52 42,48 42,58 38,62" fill="#263D88" />
            <polygon points="28,52 32,48 42,48 38,52" fill="#FFFFFF" stroke="#BADDF2" strokeWidth="0.4" />
            <text x="33" y="58" fontSize="1.4" fill="#FFFFFF" fontWeight="bold" textAnchor="middle">
              LIBRARY
            </text>
          </g>

          {/* Building: S Y Cafe & Canteen Complex (Top-Left, x=26, y=28) */}
          <g
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => handlePinClick(CAMPUS_LOCATIONS[3])}
          >
            <polygon points="22,26 32,26 32,34 22,34" fill="#53AADF" />
            <polygon points="32,26 35,23 35,31 32,34" fill="#263D88" />
            <polygon points="22,26 25,23 35,23 32,26" fill="#BADDF2" />
            <text x="27" y="31" fontSize="1.4" fill="#101214" fontWeight="bold" textAnchor="middle">
              S Y CAFE
            </text>
          </g>

          {/* Building: UNIQUE Canteen (Bottom-Right, x=72, y=62) */}
          <g
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => handlePinClick(CAMPUS_LOCATIONS[4])}
          >
            <polygon points="68,60 80,60 80,68 68,68" fill="#53AADF" />
            <polygon points="80,60 84,56 84,64 80,68" fill="#263D88" />
            <polygon points="68,60 72,56 84,56 80,60" fill="#FFFFFF" />
            <text x="74" y="65" fontSize="1.3" fill="#263D88" fontWeight="bold" textAnchor="middle">
              UNIQUE CANTEEN
            </text>
          </g>

          {/* Building: Hostel Block A & B (Bottom-Left & Bottom-Right) */}
          <g
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => handlePinClick(CAMPUS_LOCATIONS[8])}
          >
            <polygon points="14,70 24,70 24,80 14,80" fill="#263D88" />
            <polygon points="24,70 27,67 27,77 24,80" fill="#1E2F6B" />
            <polygon points="14,70 17,67 27,67 24,70" fill="#BADDF2" />
            <text x="19" y="76" fontSize="1.3" fill="#FFFFFF" fontWeight="bold" textAnchor="middle">
              HOSTEL A
            </text>
          </g>

          {/* Building: Innovation Lab / Science Block (Top-Right, x=70, y=26) */}
          <g
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => handlePinClick(CAMPUS_LOCATIONS[7])}
          >
            <polygon points="66,24 76,24 76,32 66,32" fill="#263D88" />
            <polygon points="76,24 80,20 80,28 76,32" fill="#53AADF" />
            <polygon points="66,24 70,20 80,20 76,24" fill="#FFFFFF" />
            <text x="71" y="29" fontSize="1.3" fill="#FFFFFF" fontWeight="bold" textAnchor="middle">
              LAB 2
            </text>
          </g>

          {/* 5. Active Dynamic Navigation Route Path */}
          {selectedLoc && (
            <g>
              {/* Route Line with animated Dash array */}
              <path
                d={`M ${originX} ${originY} L ${midX} ${midY} L ${destX} ${destY}`}
                fill="none"
                stroke="url(#pathGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="2,1"
                filter="url(#routeGlow)"
                className="animate-pulse"
              />

              {/* Waypoint circle at turn */}
              <circle cx={midX} cy={midY} r="1.5" fill="#53AADF" stroke="#FFFFFF" strokeWidth="0.5" />

              {/* Live Walking Marker Dot */}
              <g transform={`translate(${walkerX}, ${walkerY})`}>
                <circle cx="0" cy="0" r="2.8" fill="#FF0000" opacity="0.3" className="animate-ping" />
                <circle cx="0" cy="0" r="2" fill="#FF0000" stroke="#FFFFFF" strokeWidth="0.6" />
                <polygon points="0,-1.2 1,1 -1,1" fill="#FFFFFF" />
              </g>

              {/* Destination Beacon Pin */}
              <g transform={`translate(${destX}, ${destY})`}>
                <circle cx="0" cy="0" r="4" fill="#FF0000" opacity="0.25" className="animate-pulse" />
                <path
                  d="M 0 -6 C -2.5 -6 -4 -4 -4 -1.5 C -4 2 0 6 0 6 C 0 6 4 2 4 -1.5 C 4 -4 2.5 -6 0 -6 Z"
                  fill="#FF0000"
                  stroke="#FFFFFF"
                  strokeWidth="0.6"
                />
                <circle cx="0" cy="-2.5" r="1.5" fill="#FFFFFF" />
              </g>
            </g>
          )}

          {/* 6. "You are here" Origin Marker (Main Campus Center) */}
          <g transform={`translate(${originX}, ${originY})`}>
            <circle cx="0" cy="0" r="5" fill="#263D88" opacity="0.2" className="animate-ping" />
            <circle cx="0" cy="0" r="2.6" fill="#263D88" stroke="#FFFFFF" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="1" fill="#BADDF2" />
            <rect x="-10" y="3.5" width="20" height="4" rx="1.2" fill="#263D88" opacity="0.9" />
            <text x="0" y="6.3" fontSize="1.8" fill="#FFFFFF" fontWeight="bold" textAnchor="middle">
              YOU ARE HERE
            </text>
          </g>
        </svg>
      </div>

      {/* Floating Map Controls overlay */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
        {/* 3D / 2D Switch */}
        <button
          onClick={() => setIs3DView((prev) => !prev)}
          className={`p-2 rounded-xl text-xs font-bold shadow-md transition-all ${
            is3DView ? 'bg-[#263D88] text-white' : 'bg-white/95 text-slate-700'
          }`}
          title="Toggle 3D View"
        >
          <span className="text-[10px]">3D</span>
        </button>

        {/* Rotate Campus View */}
        <button
          onClick={() => setRotationAngle((prev) => (prev + 90) % 360)}
          className="p-2 rounded-xl bg-white/95 hover:bg-white text-slate-700 shadow-md transition-all"
          title="Rotate Map"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        {/* Zoom In */}
        <button
          onClick={() => setZoomLevel((prev) => Math.min(prev + 0.2, 1.8))}
          className="p-2 rounded-xl bg-white/95 hover:bg-white text-slate-700 shadow-md transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={() => setZoomLevel((prev) => Math.max(prev - 0.2, 0.8))}
          className="p-2 rounded-xl bg-white/95 hover:bg-white text-slate-700 shadow-md transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        {/* Voice Guidance Toggle */}
        <button
          onClick={() => setIsVoiceGuidanceEnabled(!isVoiceGuidanceEnabled)}
          className={`p-2 rounded-xl shadow-md transition-all ${
            isVoiceGuidanceEnabled ? 'bg-[#53AADF] text-white' : 'bg-white/95 text-slate-400'
          }`}
          title={isVoiceGuidanceEnabled ? 'Voice Guidance Active' : 'Voice Guidance Muted'}
        >
          {isVoiceGuidanceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Floating Floor Selector (Ground, 1st, 2nd, 3rd Floor) */}
      <div className="absolute top-3 left-3 flex items-center bg-white/90 backdrop-blur-md rounded-xl p-1 shadow-md border border-slate-100 z-10">
        {['Ground', '1st Fl', '2nd Fl', '3rd Fl'].map((floorName, idx) => {
          const fullName = idx === 0 ? 'Ground Floor' : `${idx}${idx === 1 ? 'st' : idx === 2 ? 'nd' : 'rd'} Floor`;
          const isSelected = selectedFloor.includes(String(idx)) || (idx === 0 && selectedFloor === 'Ground Floor');

          return (
            <button
              key={floorName}
              onClick={() => setSelectedFloor(fullName)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                isSelected
                  ? 'bg-[#263D88] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {floorName}
            </button>
          );
        })}
      </div>

      {/* Live Selected Location Bar */}
      {selectedLoc && !compact && (
        <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-slate-100 flex items-center justify-between gap-3 z-10">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#BADDF2] text-[#263D88]">
                {selectedLoc.category}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {selectedLoc.distanceMeters}m • {selectedLoc.walkTimeMin} min walk
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#101214] truncate mt-0.5">{selectedLoc.name}</h4>
            <p className="text-[11px] text-slate-500 truncate">{selectedLoc.description}</p>
          </div>

          <button
            onClick={() => startNavigationTo(selectedLoc)}
            className="shrink-0 py-2 px-3.5 rounded-xl bg-[#263D88] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#1E2F6B] shadow-md shadow-[#263D88]/20 transition-transform active:scale-95"
          >
            <Navigation className="w-3.5 h-3.5 text-[#53AADF]" />
            <span>Navigate</span>
          </button>
        </div>
      )}
    </div>
  );
};
