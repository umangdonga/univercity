import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Campus3DCanvas } from '../map/Campus3DCanvas';
import { CAMPUS_LOCATIONS } from '../../data/mockCampusData';
import { CampusLocation } from '../../types';
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
  X,
  Play,
  RotateCcw,
  CheckCircle,
  Building,
  GraduationCap,
  Layers,
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
    <div className="bg-[#F4F7FB] min-h-screen pb-24 font-['Poppins',sans-serif]">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#263D88] text-white">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#101214] tracking-tight">
                3D Campus Navigation
              </h1>
              <p className="text-[11px] text-slate-400">
                {isNavigating && navDestination
                  ? `Navigating to ${navDestination.name}`
                  : 'Select destination or room'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsVoiceGuidanceEnabled(!isVoiceGuidanceEnabled)}
              className={`p-2 rounded-xl text-xs font-bold transition-all ${
                isVoiceGuidanceEnabled
                  ? 'bg-[#53AADF] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400'
              }`}
              title="Voice Guidance"
            >
              {isVoiceGuidanceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {isNavigating && (
              <button
                onClick={stopNavigation}
                className="py-1.5 px-3 rounded-xl bg-red-50 text-[#FF0000] border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors"
              >
                End Route
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="px-4 py-3 space-y-4 max-w-md mx-auto sm:max-w-xl md:max-w-2xl">
        {/* 3D Map View Canvas */}
        <Campus3DCanvas onLocationSelect={(loc) => startNavigationTo(loc)} />

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
              <p className="text-sm font-bold text-[#101214] leading-relaxed">
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
                className="py-2.5 px-3.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <button
                onClick={nextNavStep}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 ${
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
        <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#101214] uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4 text-[#263D88]" />
              <span>Select Destination / Block</span>
            </h2>
            <span className="text-xs text-slate-400">{filteredLocations.length} locations</span>
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
                className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
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
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
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
                    <div className="flex items-center gap-1.5">
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
                    className={`shrink-0 p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
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
