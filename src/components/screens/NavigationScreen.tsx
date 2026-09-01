import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GoogleMapCanvas } from '../map/GoogleMapCanvas';
import { Campus3DCanvas } from '../map/Campus3DCanvas';
import { CAMPUS_LOCATIONS } from '../../data/mockCampusData';
import { CampusLocation, MapMode } from '../../types';
import {
  Search,
  Navigation,
  Compass,
  Volume2,
  VolumeX,
  Footprints,
  Clock,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Layers,
  Map as MapIcon,
  Box,
  Building,
  CheckCircle,
  Sparkles,
  Info,
} from 'lucide-react';

export const NavigationScreen: React.FC = () => {
  const {
    navDestination,
    isNavigating,
    currentNavStepIndex,
    activeRoute,
    startNavigationTo,
    stopNavigation,
    nextNavStep,
    prevNavStep,
    isVoiceGuidanceEnabled,
    setIsVoiceGuidanceEnabled,
    selectedFloor,
    setSelectedFloor,
  } = useApp();

  const [mapMode, setMapMode] = useState<MapMode>('google-map');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedBuildingFilter, setSelectedBuildingFilter] = useState<string>('All');

  const buildings = ['All', 'Main Building', 'Science Block B', 'Canteen Complex', 'Knowledge Tower', 'Hostel'];

  const filteredLocations = CAMPUS_LOCATIONS.filter((loc) => {
    const matchesBuilding =
      selectedBuildingFilter === 'All' || loc.building.toLowerCase().includes(selectedBuildingFilter.toLowerCase());
    const matchesSearch =
      !searchFilter ||
      loc.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      loc.roomNumber?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      loc.tags.some((t) => t.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesBuilding && matchesSearch;
  });

  const currentStep = activeRoute?.steps[currentNavStepIndex];
  const isLastStep = activeRoute && currentNavStepIndex === activeRoute.steps.length - 1;

  return (
    <div className="bg-[#F4F7FB] min-h-screen pb-28 font-['Poppins',sans-serif]">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-xl bg-[#263D88] text-white shrink-0 shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-[#101214] tracking-tight truncate">
                Campus Maps & Navigation
              </h1>
              <p className="text-[11px] text-slate-500 truncate">
                {isNavigating && navDestination
                  ? `Navigating to ${navDestination.name}`
                  : 'Live GPS & 3D Interactive University Map'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsVoiceGuidanceEnabled(!isVoiceGuidanceEnabled)}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isVoiceGuidanceEnabled
                  ? 'bg-[#53AADF] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
              title="Voice Guidance"
            >
              {isVoiceGuidanceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {isNavigating && (
              <button
                onClick={stopNavigation}
                className="py-1.5 px-3 rounded-xl bg-red-50 text-[#FF0000] border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer"
              >
                End Route
              </button>
            )}
          </div>
        </div>

        {/* View Modes Switcher: Full Google Map vs 3D Isometric vs Floor Blueprint */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl w-full">
            <button
              onClick={() => setMapMode('google-map')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mapMode === 'google-map'
                  ? 'bg-[#263D88] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#263D88]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="truncate">Google Map</span>
            </button>

            <button
              onClick={() => setMapMode('campus-3d')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mapMode === 'campus-3d'
                  ? 'bg-[#263D88] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#263D88]'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span className="truncate">Campus 3D</span>
            </button>

            <button
              onClick={() => setMapMode('indoor-blueprint')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mapMode === 'indoor-blueprint'
                  ? 'bg-[#263D88] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#263D88]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="truncate">Indoor Floors</span>
            </button>
          </div>
        </div>
      </div>

      <main className="px-4 py-3.5 space-y-4 max-w-md mx-auto sm:max-w-xl md:max-w-3xl">
        {/* Render Map according to selected view mode */}
        {mapMode === 'google-map' && (
          <GoogleMapCanvas onLocationSelect={(loc) => startNavigationTo(loc)} />
        )}

        {mapMode === 'campus-3d' && (
          <Campus3DCanvas onLocationSelect={(loc) => startNavigationTo(loc)} />
        )}

        {mapMode === 'indoor-blueprint' && (
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#101214]">Building Floor Blueprints</h3>
                <p className="text-xs text-slate-500">Classroom B 304, Labs, Auditorium & Elevators</p>
              </div>

              {/* Floor Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {['Ground', '1st Floor', '2nd Floor', '3rd Floor'].map((floor) => (
                  <button
                    key={floor}
                    onClick={() => setSelectedFloor(floor)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedFloor === floor
                        ? 'bg-[#263D88] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#263D88]'
                    }`}
                  >
                    {floor.replace(' Floor', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Floor Blueprint Map */}
            <div className="relative h-64 bg-slate-900 rounded-2xl overflow-hidden p-4 border border-slate-700 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-bold text-[#53AADF]">Science Block B • {selectedFloor}</span>
                <span className="text-[11px] text-slate-400">Emergency Exit: North Wing</span>
              </div>

              {/* Floor Layout schematic */}
              <div className="grid grid-cols-3 gap-2 my-auto">
                <div
                  onClick={() => {
                    const loc = CAMPUS_LOCATIONS.find((l) => l.id === 'classroom-b304');
                    if (loc) startNavigationTo(loc);
                  }}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    navDestination?.id === 'classroom-b304' && selectedFloor === '3rd Floor'
                      ? 'bg-blue-600 text-white border-white scale-105 shadow-md shadow-blue-500/40'
                      : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-[#53AADF]'
                  }`}
                >
                  <p className="text-xs font-bold">Room B-304</p>
                  <p className="text-[10px] text-slate-400">Classroom (Active)</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-center">
                  <p className="text-xs font-bold">Room B-305</p>
                  <p className="text-[10px] text-slate-400">IoT Hardware Lab</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-center">
                  <p className="text-xs font-bold">Lift / Stairs</p>
                  <p className="text-[10px] text-slate-400">Main Quad Core</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span>Wi-Fi: Eduroam_5G</span>
                <span>Restrooms: Near Staircase A</span>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE NAVIGATION TURN-BY-TURN GUIDANCE CARD */}
        {isNavigating && activeRoute && currentStep && (
          <div className="bg-white rounded-3xl p-5 border border-[#53AADF]/40 shadow-lg shadow-[#263D88]/10 space-y-4 animate-in fade-in slide-in-from-bottom-2">
            {/* Header with Distance & Estimated Time */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#263D88] text-white flex items-center justify-center font-bold text-sm">
                  {currentNavStepIndex + 1}/{activeRoute.steps.length}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Next Direction
                  </span>
                  <p className="text-xs font-bold text-[#101214]">
                    Step {currentNavStepIndex + 1} of {activeRoute.steps.length}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold text-[#263D88] flex items-center gap-1 justify-end">
                  <Footprints className="w-4 h-4 text-[#53AADF]" />
                  <span>{activeRoute.totalDistanceMeters}m</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  ~{activeRoute.estimatedWalkTimeMin} min walk
                </span>
              </div>
            </div>

            {/* Instruction Callout */}
            <div className="p-4 rounded-2xl bg-[#F4F7FB] border border-[#BADDF2]/60">
              <p className="text-xs sm:text-sm font-bold text-[#101214] leading-relaxed">
                {currentStep.instruction}
              </p>
              {currentStep.floorNote && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-[#263D88] font-semibold">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Level: {currentStep.floorNote}</span>
                </div>
              )}
            </div>

            {/* Step Controls */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={prevNavStep}
                disabled={currentNavStepIndex === 0}
                className="py-2.5 px-3.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <button
                onClick={nextNavStep}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer ${
                  isLastStep
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                    : 'bg-[#263D88] hover:bg-[#1E2F6B] text-white shadow-[#263D88]/20'
                }`}
              >
                {isLastStep ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-200" />
                    <span>Arrived at Destination!</span>
                  </>
                ) : (
                  <>
                    <span>Next Direction</span>
                    <ChevronRight className="w-4 h-4 text-[#53AADF]" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* DESTINATION SELECTION DRAWER / SELECTOR */}
        <section className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#101214] uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4 text-[#263D88]" />
              <span>Select Destination / Block</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">{filteredLocations.length} locations</span>
          </div>

          {/* Search filter input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search building, block, or room (e.g. B 304)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F4F7FB] border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#263D88] focus:border-transparent text-[#101214]"
            />
          </div>

          {/* Building Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {buildings.map((bld) => (
              <button
                key={bld}
                onClick={() => setSelectedBuildingFilter(bld)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedBuildingFilter === bld
                    ? 'bg-[#263D88] text-white shadow-xs'
                    : 'bg-[#F4F7FB] text-slate-600 hover:bg-[#BADDF2]/40'
                }`}
              >
                {bld}
              </button>
            ))}
          </div>

          {/* Locations List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
            {filteredLocations.map((loc) => {
              const isSelected = navDestination?.id === loc.id;

              return (
                <div
                  key={loc.id}
                  onClick={() => startNavigationTo(loc)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#BADDF2]/30 border-[#263D88] ring-1 ring-[#263D88]'
                      : 'bg-white border-slate-100 hover:border-[#BADDF2] hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-[#263D88]">
                        {loc.category}
                      </span>
                      {loc.roomNumber && (
                        <span className="text-[10px] font-bold text-slate-700">
                          {loc.roomNumber}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">• {loc.floor}</span>
                    </div>

                    <h4 className="text-xs font-bold text-[#101214] truncate mt-0.5">{loc.name}</h4>
                    <p className="text-[10px] text-slate-500 truncate">{loc.building}</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startNavigationTo(loc);
                    }}
                    className={`shrink-0 p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#263D88] text-white'
                        : 'bg-[#BADDF2]/40 text-[#263D88] hover:bg-[#263D88] hover:text-white'
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};
