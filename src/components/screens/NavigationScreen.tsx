import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GoogleMapCanvas } from '../map/GoogleMapCanvas';
import { Campus3DCanvas } from '../map/Campus3DCanvas';
import { CAMPUS_LOCATIONS } from '../../data/mockCampusData';
import { CampusLocation, MapMode, LocationCategory } from '../../types';
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
  X,
  ArrowUp,
  ArrowRight,
  CornerUpRight,
  CornerUpLeft,
  GraduationCap,
  FlaskConical,
  Utensils,
  BookOpen,
  Car,
  Home,
  Shield,
  Accessibility,
} from 'lucide-react';

export const NavigationScreen: React.FC = () => {
  const {
    navOrigin,
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
    showToast,
  } = useApp();

  const [mapMode, setMapMode] = useState<MapMode>('google-map');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedBuildingFilter, setSelectedBuildingFilter] = useState<string>('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  const buildings = [
    'All',
    'Main Building',
    'Science Block B',
    'Canteen Complex',
    'Knowledge Tower',
    'Hostel',
  ];

  const categoryQuickFilters: { label: string; value: string; icon: React.FC<{ className?: string }> }[] = [
    { label: 'All', value: 'All', icon: Compass },
    { label: 'Classrooms', value: 'Classroom', icon: GraduationCap },
    { label: 'Labs', value: 'Lab', icon: FlaskConical },
    { label: 'Canteens', value: 'Canteen', icon: Utensils },
    { label: 'Library', value: 'Library', icon: BookOpen },
    { label: 'Admin / Offices', value: 'Admin', icon: Building },
    { label: 'Hostel', value: 'Hostel', icon: Home },
    { label: 'Parking', value: 'Parking', icon: Car },
  ];

  const filteredLocations = CAMPUS_LOCATIONS.filter((loc) => {
    const matchesBuilding =
      selectedBuildingFilter === 'All' ||
      loc.building.toLowerCase().includes(selectedBuildingFilter.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === 'All' || loc.category === selectedCategoryFilter;
    const query = searchFilter.toLowerCase().trim();
    const matchesSearch =
      !query ||
      loc.name.toLowerCase().includes(query) ||
      loc.roomNumber?.toLowerCase().includes(query) ||
      loc.building.toLowerCase().includes(query) ||
      loc.tags.some((t) => t.toLowerCase().includes(query));

    return matchesBuilding && matchesCategory && matchesSearch;
  });

  const currentStep = activeRoute?.steps[currentNavStepIndex];
  const isLastStep = activeRoute && currentNavStepIndex === activeRoute.steps.length - 1;
  const progressPercent = activeRoute
    ? Math.round(((currentNavStepIndex + 1) / activeRoute.steps.length) * 100)
    : 0;

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'right':
        return <CornerUpRight className="w-5 h-5 text-[#53AADF]" />;
      case 'left':
        return <CornerUpLeft className="w-5 h-5 text-[#53AADF]" />;
      case 'up':
        return <Layers className="w-5 h-5 text-[#263D88]" />;
      case 'arrive':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default:
        return <ArrowUp className="w-5 h-5 text-[#263D88]" />;
    }
  };

  const getCategoryIcon = (category: LocationCategory) => {
    switch (category) {
      case 'Classroom':
        return GraduationCap;
      case 'Lab':
        return FlaskConical;
      case 'Canteen':
        return Utensils;
      case 'Library':
        return BookOpen;
      case 'Hostel':
        return Home;
      case 'Parking':
        return Car;
      default:
        return Building;
    }
  };

  return (
    <div className="bg-[#F4F7FB] min-h-screen pb-28 font-['Poppins',sans-serif]">
      {/* 1. Header Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-xl bg-[#263D88] text-white shrink-0 shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-[#101214] tracking-tight truncate">
                Campus Navigation & Maps
              </h1>
              <p className="text-[11px] text-slate-500 truncate">
                {isNavigating && navDestination
                  ? `Active route to ${navDestination.name}`
                  : 'Live GPS & 3D Interactive Directional Guidance'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                const nextState = !isVoiceGuidanceEnabled;
                setIsVoiceGuidanceEnabled(nextState);
                showToast(nextState ? 'Voice guidance enabled' : 'Voice guidance muted');
              }}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isVoiceGuidanceEnabled
                  ? 'bg-[#53AADF] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
              title={isVoiceGuidanceEnabled ? 'Voice Guidance Active' : 'Voice Guidance Muted'}
            >
              {isVoiceGuidanceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {isNavigating && (
              <button
                onClick={stopNavigation}
                className="py-1.5 px-3 rounded-xl bg-red-50 text-[#FF0000] border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer active:scale-95"
              >
                End Route
              </button>
            )}
          </div>
        </div>

        {/* 2. View Mode Tabs (Google Map, Campus 3D, Indoor Floors) */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
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
        {/* 3. PROMINENT ROUTE OVERVIEW CARD (Origin -> Destination) */}
        {navDestination && (
          <section className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-md space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#263D88] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                {isNavigating ? 'Navigation in progress' : 'Planned Route Preview'}
              </span>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1 text-[#263D88]">
                  <Footprints className="w-3.5 h-3.5 text-[#53AADF]" />
                  {navDestination.distanceMeters}m
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  ~{navDestination.walkTimeMin} min walk
                </span>
              </div>
            </div>

            {/* Origin -> Destination Travel Points */}
            <div className="bg-[#F4F7FB] rounded-2xl p-3 border border-slate-100 space-y-2.5">
              {/* Origin */}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Start / Your Location</p>
                  <p className="text-xs font-bold text-[#101214] truncate">
                    {navOrigin.name} ({navOrigin.building})
                  </p>
                </div>
              </div>

              {/* Connecting Dashed Line */}
              <div className="ml-3.5 pl-3 border-l-2 border-dashed border-[#53AADF]/60 py-0.5" />

              {/* Destination */}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#263D88] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <MapPin className="w-4 h-4 fill-white text-[#263D88]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[10px] uppercase font-bold text-[#263D88]">Destination</p>
                    {navDestination.roomNumber && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white text-slate-800 border border-slate-200">
                        {navDestination.roomNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-[#101214] truncate">
                    {navDestination.name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {navDestination.building} • {navDestination.floor}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Action Buttons */}
            {!isNavigating ? (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => startNavigationTo(navDestination)}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#263D88] hover:bg-[#1E2F6B] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#263D88]/20 transition-all active:scale-98 cursor-pointer"
                >
                  <Navigation className="w-4 h-4 fill-white text-[#263D88]" />
                  <span>Start Walking Navigation</span>
                </button>
                <button
                  onClick={() => {
                    const nextMode = mapMode === 'google-map' ? 'campus-3d' : 'google-map';
                    setMapMode(nextMode);
                  }}
                  className="py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#263D88] text-xs font-bold transition-colors cursor-pointer"
                  title="Switch Map View"
                >
                  {mapMode === 'google-map' ? <Box className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
                </button>
              </div>
            ) : null}
          </section>
        )}

        {/* 4. ACTIVE STEP-BY-STEP GUIDANCE CARD */}
        {isNavigating && activeRoute && currentStep && (
          <section className="bg-white rounded-3xl p-5 border-2 border-[#263D88]/20 shadow-xl shadow-[#263D88]/10 space-y-4 animate-in fade-in slide-in-from-bottom-2">
            {/* Step progress & header */}
            <div className="space-y-2 pb-2 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#263D88] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {currentNavStepIndex + 1}/{activeRoute.steps.length}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Turn-by-turn Guidance
                    </span>
                    <p className="text-xs font-bold text-[#101214]">
                      Step {currentNavStepIndex + 1} of {activeRoute.steps.length}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-[#263D88]">{progressPercent}% complete</span>
                  <p className="text-[10px] text-slate-400">~{activeRoute.estimatedWalkTimeMin} min</p>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#263D88] h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Current Direction Card */}
            <div className="p-4 rounded-2xl bg-[#BADDF2]/20 border border-[#BADDF2] flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-white border border-[#BADDF2] shadow-xs shrink-0 mt-0.5">
                {getDirectionIcon(currentStep.direction)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-[#101214] leading-relaxed">
                  {currentStep.instruction}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-[#263D88] font-semibold flex-wrap">
                  <span className="flex items-center gap-1">
                    <Footprints className="w-3.5 h-3.5 text-[#53AADF]" />
                    {currentStep.distanceMeters}m to next landmark
                  </span>
                  {currentStep.floorNote && (
                    <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-[#BADDF2]">
                      <Layers className="w-3 h-3 text-[#263D88]" />
                      {currentStep.floorNote}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Step Controls (Prev / Next) */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={prevNavStep}
                disabled={currentNavStepIndex === 0}
                className="py-2.5 px-3.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors disabled:opacity-40 flex items-center gap-1 cursor-pointer"
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
          </section>
        )}

        {/* 5. Render Map according to selected view mode */}
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

                <div
                  onClick={() => {
                    const loc = CAMPUS_LOCATIONS.find((l) => l.id === 'iot-hardware-lab');
                    if (loc) startNavigationTo(loc);
                  }}
                  className="p-3 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-center hover:border-[#53AADF] cursor-pointer"
                >
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

        {/* 6. CAMPUS DESTINATION SELECTOR / DIRECTORY */}
        <section className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#101214] uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4 text-[#263D88]" />
              <span>Campus Destination Directory</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {filteredLocations.length} locations
            </span>
          </div>

          {/* Search filter input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search building, block, or room (e.g. B 304, Canteen, Library)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#F4F7FB] border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#263D88] focus:border-transparent text-[#101214] placeholder:text-slate-400"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-3 top-2.5 p-0.5 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Quick Chips (Hick's Law - Immediate Category Selection) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categoryQuickFilters.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategoryFilter === cat.value;

              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategoryFilter(cat.value)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#263D88] text-white shadow-xs'
                      : 'bg-[#F4F7FB] text-slate-600 hover:bg-[#BADDF2]/50 hover:text-[#263D88]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Building Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-0.5 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Building:
            </span>
            {buildings.map((bld) => (
              <button
                key={bld}
                onClick={() => setSelectedBuildingFilter(bld)}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                  selectedBuildingFilter === bld
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {bld}
              </button>
            ))}
          </div>

          {/* Locations List */}
          <div
            className="space-y-2.5 max-h-80 overflow-y-auto pr-1"
            style={{ scrollbarWidth: 'thin' }}
          >
            {filteredLocations.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl p-4">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-700">No matching campus location</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Try searching with room number like "B304" or category like "Canteen"
                </p>
              </div>
            ) : (
              filteredLocations.map((loc) => {
                const isSelected = navDestination?.id === loc.id;
                const Icon = getCategoryIcon(loc.category);

                return (
                  <div
                    key={loc.id}
                    onClick={() => startNavigationTo(loc)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                      isSelected
                        ? 'bg-[#BADDF2]/30 border-[#263D88] ring-1 ring-[#263D88] shadow-xs'
                        : 'bg-white border-slate-100 hover:border-[#BADDF2] hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? 'bg-[#263D88] text-white'
                            : 'bg-[#BADDF2]/40 text-[#263D88] group-hover:bg-[#263D88] group-hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-[#263D88]">
                            {loc.category}
                          </span>
                          {loc.roomNumber && (
                            <span className="text-[10px] font-bold text-slate-800">
                              {loc.roomNumber}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">• {loc.floor}</span>
                        </div>

                        <h4 className="text-xs font-bold text-[#101214] truncate mt-0.5 group-hover:text-[#263D88] transition-colors">
                          {loc.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 truncate">{loc.building}</p>

                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-medium">
                          <span className="text-[#263D88] font-bold">{loc.distanceMeters}m away</span>
                          <span>•</span>
                          <span>~{loc.walkTimeMin} min walk</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startNavigationTo(loc);
                      }}
                      className={`shrink-0 py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#263D88] text-white shadow-xs'
                          : 'bg-[#BADDF2]/40 text-[#263D88] hover:bg-[#263D88] hover:text-white'
                      }`}
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Route</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
