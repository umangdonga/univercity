import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { CampusLocation, MapMode } from '../../types';
import { CAMPUS_LOCATIONS } from '../../data/mockCampusData';
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Crosshair,
  Footprints,
  Info,
  ChevronRight,
  Sparkles,
  Search,
  CheckCircle2,
  Utensils,
  BookOpen,
  GraduationCap,
  Bus,
  Car,
  Home,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

interface GoogleMapCanvasProps {
  onLocationSelect?: (loc: CampusLocation) => void;
}

export const GoogleMapCanvas: React.FC<GoogleMapCanvasProps> = ({ onLocationSelect }) => {
  const {
    navDestination,
    isNavigating,
    startNavigationTo,
    stopNavigation,
    selectedFloor,
    setSelectedFloor,
  } = useApp();

  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [selectedLoc, setSelectedLoc] = useState<CampusLocation>(
    navDestination || CAMPUS_LOCATIONS[0]
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{ x: number; y: number; lat: number; lng: number }>({
    x: 50,
    y: 50,
    lat: 12.9716,
    lng: 77.5946,
  });
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showInfoCard, setShowInfoCard] = useState<boolean>(true);

  // Sync selected location when navDestination changes
  useEffect(() => {
    if (navDestination) {
      setSelectedLoc(navDestination);
      setShowInfoCard(true);
    }
  }, [navDestination]);

  // Category Icons helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Canteen':
        return Utensils;
      case 'Library':
        return BookOpen;
      case 'Classroom':
      case 'Lab':
        return GraduationCap;
      case 'Hostel':
        return Home;
      case 'Parking':
        return Car;
      default:
        return MapPin;
    }
  };

  const categories = ['All', 'Classroom', 'Canteen', 'Library', 'Hostel', 'Admin', 'Parking'];

  const filteredLocations = CAMPUS_LOCATIONS.filter((loc) => {
    const matchesCat = categoryFilter === 'All' || loc.category === categoryFilter;
    const matchesSearch =
      !searchFilter ||
      loc.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      loc.building.toLowerCase().includes(searchFilter.toLowerCase()) ||
      loc.roomNumber?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      loc.tags.some((t) => t.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleLocateMe = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          setUserLocation({
            x: 50,
            y: 50,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setPanOffset({ x: 0, y: 0 });
        },
        () => {
          // Fallback simulation
          setTimeout(() => {
            setIsLocating(false);
            setUserLocation({ x: 50, y: 50, lat: 12.9716, lng: 77.5946 });
            setPanOffset({ x: 0, y: 0 });
          }, 600);
        },
        { timeout: 3000 }
      );
    } else {
      setTimeout(() => {
        setIsLocating(false);
        setUserLocation({ x: 50, y: 50, lat: 12.9716, lng: 77.5946 });
      }, 500);
    }
  };

  const handleSelect = (loc: CampusLocation) => {
    setSelectedLoc(loc);
    setShowInfoCard(true);
    // Center on selected location smoothly
    setPanOffset({
      x: (50 - loc.x) * 3 * zoomLevel,
      y: (50 - loc.y) * 3 * zoomLevel,
    });
    if (onLocationSelect) {
      onLocationSelect(loc);
    }
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan handlers for phone
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border border-slate-200/90 shadow-lg bg-slate-900 transition-all duration-300 font-['Poppins',sans-serif] ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[440px] sm:h-[480px]'
      }`}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          {/* Map Layer Mode Switcher */}
          <div className="flex items-center bg-white/95 backdrop-blur-md rounded-2xl p-1 shadow-md border border-slate-200/80">
            <button
              onClick={() => setMapType('roadmap')}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                mapType === 'roadmap'
                  ? 'bg-[#263D88] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#263D88]'
              }`}
            >
              Streets
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                mapType === 'satellite'
                  ? 'bg-[#263D88] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#263D88]'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapType('terrain')}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                mapType === 'terrain'
                  ? 'bg-[#263D88] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#263D88]'
              }`}
            >
              Terrain
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleLocateMe}
              className={`p-2 rounded-2xl bg-white/95 backdrop-blur-md text-[#263D88] border border-slate-200/80 shadow-md hover:bg-slate-50 transition-all cursor-pointer ${
                isLocating ? 'animate-spin' : ''
              }`}
              title="Locate my position on campus"
            >
              <Crosshair className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-2xl bg-white/95 backdrop-blur-md text-[#263D88] border border-slate-200/80 shadow-md hover:bg-slate-50 transition-all cursor-pointer"
              title={isFullscreen ? 'Exit full screen' : 'Expand full screen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Category Filters Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap shadow-xs transition-all cursor-pointer border ${
                categoryFilter === cat
                  ? 'bg-[#263D88] text-white border-[#263D88]'
                  : 'bg-white/90 backdrop-blur-md text-slate-700 border-white/80 hover:bg-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Map Viewport (Satellite/Roadmap styled canvas) */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden select-none"
      >
        {/* Background Map Texture depending on mapType */}
        <div
          className="absolute inset-0 transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Base Grid / Satellite / Road Surface */}
          <div
            className={`w-[1400px] h-[1400px] -left-[300px] -top-[400px] absolute transition-colors duration-500 ${
              mapType === 'satellite'
                ? 'bg-[#1b2a1e] bg-[radial-gradient(#2d4a34_1px,transparent_1px)] [background-size:24px_24px]'
                : mapType === 'terrain'
                ? 'bg-[#e8ece9] bg-[radial-gradient(#c5d1c8_1.5px,transparent_1.5px)] [background-size:20px_20px]'
                : 'bg-[#EBF2FA] bg-[linear-gradient(to_right,#dce7f3_1px,transparent_1px),linear-gradient(to_bottom,#dce7f3_1px,transparent_1px)] [background-size:32px_32px]'
            }`}
          >
            {/* Campus Boundary & Roads */}
            <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 1000 1000">
              {/* Campus Boundary Outline */}
              <polygon
                points="150,150 850,120 900,800 120,820"
                fill={mapType === 'satellite' ? 'rgba(40, 70, 50, 0.4)' : 'rgba(255, 255, 255, 0.65)'}
                stroke={mapType === 'satellite' ? '#4CAF50' : '#263D88'}
                strokeWidth="3"
                strokeDasharray="8 4"
              />

              {/* Main Ring Road Avenue */}
              <path
                d="M 220,200 L 780,180 L 820,720 L 200,740 Z"
                fill="none"
                stroke={mapType === 'satellite' ? '#4a5568' : '#cbd5e1'}
                strokeWidth="28"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 220,200 L 780,180 L 820,720 L 200,740 Z"
                fill="none"
                stroke={mapType === 'satellite' ? '#718096' : '#ffffff'}
                strokeWidth="20"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Center Road divider */}
              <path
                d="M 220,200 L 780,180 L 820,720 L 200,740 Z"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="10 8"
              />

              {/* Cross Campus Walkways */}
              <path d="M 500,200 L 500,730" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
              <path d="M 220,460 L 800,460" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />

              {/* Green Lawns & Courtyards */}
              <rect x="260" y="240" width="200" height="180" rx="20" fill={mapType === 'satellite' ? '#2d5a37' : '#dcfce7'} stroke="#86efac" strokeWidth="2" />
              <rect x="540" y="240" width="220" height="180" rx="20" fill={mapType === 'satellite' ? '#2d5a37' : '#dcfce7'} stroke="#86efac" strokeWidth="2" />
              <rect x="260" y="500" width="200" height="200" rx="20" fill={mapType === 'satellite' ? '#2d5a37' : '#dcfce7'} stroke="#86efac" strokeWidth="2" />

              {/* Sports Ground Oval */}
              <ellipse cx="650" cy="600" rx="110" ry="80" fill={mapType === 'satellite' ? '#1e40af' : '#dbeafe'} stroke="#60a5fa" strokeWidth="3" />

              {/* Active Route Polyline from User (500, 500) to Selected Location */}
              {isNavigating && selectedLoc && (
                <>
                  <path
                    d={`M 500,500 L 500,${selectedLoc.y * 10} L ${selectedLoc.x * 10},${selectedLoc.y * 10}`}
                    fill="none"
                    stroke="#263D88"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-40"
                  />
                  <path
                    d={`M 500,500 L 500,${selectedLoc.y * 10} L ${selectedLoc.x * 10},${selectedLoc.y * 10}`}
                    fill="none"
                    stroke="#53AADF"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="8 6"
                    className="animate-pulse"
                  />
                </>
              )}
            </svg>

            {/* University Center Landmark Marker */}
            <div className="absolute left-[500px] top-[500px] -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping" />
                <div className="w-5 h-5 rounded-full bg-[#263D88] border-2 border-white shadow-md flex items-center justify-center text-white text-[9px] font-bold">
                  ●
                </div>
              </div>
              <span className="mt-1 block text-center px-1.5 py-0.5 rounded-md bg-white/90 shadow-xs text-[9px] font-bold text-[#263D88] whitespace-nowrap">
                You (Campus Center)
              </span>
            </div>

            {/* Render Location Pins on Map */}
            {filteredLocations.map((loc) => {
              const Icon = getCategoryIcon(loc.category);
              const isSelected = selectedLoc?.id === loc.id;
              const posX = loc.x * 10;
              const posY = loc.y * 10;

              return (
                <div
                  key={loc.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(loc);
                  }}
                  className={`absolute z-20 -translate-x-1/2 -translate-y-full cursor-pointer transition-all duration-200 group ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                  }`}
                  style={{ left: `${posX}px`, top: `${posY}px` }}
                >
                  <div className="relative flex flex-col items-center">
                    {/* Pin Label Tooltip */}
                    <div
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap shadow-md transition-all mb-1 ${
                        isSelected
                          ? 'bg-[#263D88] text-white scale-105'
                          : 'bg-white/95 text-slate-800 border border-slate-200 group-hover:bg-[#263D88] group-hover:text-white'
                      }`}
                    >
                      {loc.name}
                    </div>

                    {/* Pin Marker */}
                    <div
                      className={`w-8 h-8 rounded-2xl flex items-center justify-center shadow-lg border-2 transition-all ${
                        isSelected
                          ? 'bg-[#263D88] text-white border-white scale-110 shadow-blue-900/40'
                          : loc.category === 'Canteen'
                          ? 'bg-amber-500 text-white border-white'
                          : loc.category === 'Classroom'
                          ? 'bg-blue-600 text-white border-white'
                          : loc.category === 'Library'
                          ? 'bg-emerald-600 text-white border-white'
                          : loc.category === 'Hostel'
                          ? 'bg-purple-600 text-white border-white'
                          : 'bg-slate-700 text-white border-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Pin Point Pointer */}
                    <div
                      className={`w-2 h-2 rotate-45 -mt-1 ${
                        isSelected
                          ? 'bg-[#263D88]'
                          : loc.category === 'Canteen'
                          ? 'bg-amber-500'
                          : loc.category === 'Classroom'
                          ? 'bg-blue-600'
                          : loc.category === 'Library'
                          ? 'bg-emerald-600'
                          : 'bg-slate-700'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Zoom & Controls (Right bottom) */}
      <div className="absolute right-3 top-20 z-20 flex flex-col gap-1.5">
        <button
          onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
          className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md text-slate-800 border border-slate-200/80 shadow-md flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer font-bold"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.6))}
          className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md text-slate-800 border border-slate-200/80 shadow-md flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer font-bold"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoomLevel(1);
            setPanOffset({ x: 0, y: 0 });
          }}
          className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md text-slate-800 border border-slate-200/80 shadow-md flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all cursor-pointer font-bold text-[10px]"
          title="Reset Map Center"
        >
          1x
        </button>
      </div>

      {/* Google Attribution & Solution Badge */}
      <div className="absolute bottom-2 left-3 z-20 flex items-center gap-2 pointer-events-none">
        <span className="px-2 py-0.5 rounded-md bg-white/85 backdrop-blur-sm text-[10px] font-bold text-slate-600 shadow-xs border border-slate-200/60">
          Google Maps Platform • Campus Smart View
        </span>
      </div>

      {/* Selected Location Bottom Drawer Card */}
      {selectedLoc && showInfoCard && (
        <div className="absolute bottom-3 left-3 right-3 z-30 bg-white/98 backdrop-blur-xl rounded-2xl p-3 sm:p-4 shadow-xl border border-slate-200 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#263D88] text-white flex items-center justify-center shrink-0 shadow-md">
                {React.createElement(getCategoryIcon(selectedLoc.category), { className: 'w-5 h-5' })}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#101214] truncate">{selectedLoc.name}</h3>
                  {selectedLoc.roomNumber && (
                    <span className="px-2 py-0.5 rounded-full bg-[#BADDF2]/50 text-[#263D88] text-[10px] font-bold shrink-0">
                      {selectedLoc.roomNumber}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {selectedLoc.building} • {selectedLoc.floor}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => startNavigationTo(selectedLoc)}
                className="py-2 px-3.5 rounded-xl bg-[#263D88] hover:bg-[#1E2F6B] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#263D88]/20 active:scale-95 transition-all cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 fill-current" />
                <span>Navigate</span>
              </button>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-semibold text-[#263D88]">
                <Footprints className="w-3.5 h-3.5 text-[#53AADF]" />
                {selectedLoc.distanceMeters}m
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                ~{selectedLoc.walkTimeMin} min walk
              </span>
            </div>

            <span className="text-[10px] font-medium text-slate-400 truncate max-w-[140px]">
              {selectedLoc.tags.slice(0, 2).join(', ')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
