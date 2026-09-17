import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CAMPUS_LOCATIONS } from '../../data/mockCampusData';
import { CampusLocation, LocationCategory, NavStep } from '../../types';
import { speakStepInstruction } from '../../utils/stepGuide';
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
  Building,
  CheckCircle2,
  X,
  ArrowUp,
  CornerUpRight,
  CornerUpLeft,
  ArrowUpDown,
  GraduationCap,
  FlaskConical,
  Utensils,
  BookOpen,
  Car,
  Home,
  RotateCcw,
  Sparkles,
  ListOrdered,
  Play,
  Share2,
} from 'lucide-react';

export const NavigationScreen: React.FC = () => {
  const {
    navOrigin,
    setNavOrigin,
    navDestination,
    setNavDestination,
    isNavigating,
    currentNavStepIndex,
    jumpToNavStep,
    activeRoute,
    startNavigationTo,
    stopNavigation,
    nextNavStep,
    prevNavStep,
    isVoiceGuidanceEnabled,
    setIsVoiceGuidanceEnabled,
    showToast,
  } = useApp();

  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedBuildingFilter, setSelectedBuildingFilter] = useState<string>('All');
  const [showOriginSelector, setShowOriginSelector] = useState<boolean>(false);

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

  // Popular quick-pick locations
  const popularLocations = [
    CAMPUS_LOCATIONS.find((l) => l.id === 'classroom-b304') || CAMPUS_LOCATIONS[0],
    CAMPUS_LOCATIONS.find((l) => l.id === 'central-library') || CAMPUS_LOCATIONS[1],
    CAMPUS_LOCATIONS.find((l) => l.id === 'unique-canteen') || CAMPUS_LOCATIONS[2],
    CAMPUS_LOCATIONS.find((l) => l.id === 'innovation-lab') || CAMPUS_LOCATIONS[3],
  ];

  const currentStep = activeRoute?.steps[currentNavStepIndex];
  const isLastStep = activeRoute && currentNavStepIndex === activeRoute.steps.length - 1;
  const progressPercent = activeRoute
    ? Math.round(((currentNavStepIndex + 1) / activeRoute.steps.length) * 100)
    : 0;

  const getDirectionIcon = (direction: string, size = 'w-6 h-6') => {
    switch (direction) {
      case 'right':
        return <CornerUpRight className={`${size} text-[#263D88]`} />;
      case 'left':
        return <CornerUpLeft className={`${size} text-[#263D88]`} />;
      case 'up':
        return <Layers className={`${size} text-[#263D88]`} />;
      case 'down':
        return <Layers className={`${size} text-[#263D88]`} />;
      case 'arrive':
        return <CheckCircle2 className={`${size} text-emerald-600`} />;
      default:
        return <ArrowUp className={`${size} text-[#263D88]`} />;
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

  // Swap Origin and Destination
  const handleSwapRoute = () => {
    if (navDestination) {
      const prevOrigin = navOrigin;
      setNavOrigin(navDestination);
      setNavDestination(prevOrigin);
      showToast(`Swapped route: from ${navDestination.name} to ${prevOrigin.name}`);
    }
  };

  return (
    <div className="bg-[#F4F7FB] min-h-screen pb-28 font-['Poppins',sans-serif]">
      {/* 1. Header Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-xl bg-[#263D88] text-white shrink-0 shadow-xs">
              <ListOrdered className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-[#101214] tracking-tight truncate">
                Campus Step Guide
              </h1>
              <p className="text-[11px] text-slate-500 truncate">
                {isNavigating && navDestination
                  ? `Active route to ${navDestination.name}`
                  : 'Turn-by-turn walking steps & landmark directions'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Audio Speech Announcement Toggle */}
            <button
              onClick={() => {
                const nextState = !isVoiceGuidanceEnabled;
                setIsVoiceGuidanceEnabled(nextState);
                if (nextState && currentStep) {
                  speakStepInstruction(currentStep.instruction);
                }
                showToast(nextState ? 'Voice step guidance enabled' : 'Voice guidance muted');
              }}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isVoiceGuidanceEnabled
                  ? 'bg-[#53AADF] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
              title={isVoiceGuidanceEnabled ? 'Voice Guidance Active (Tap to Mute)' : 'Voice Guidance Muted (Tap to Enable)'}
            >
              {isVoiceGuidanceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {isNavigating && (
              <button
                onClick={stopNavigation}
                className="py-1.5 px-3 rounded-xl bg-red-50 text-[#FF0000] border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer active:scale-95 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>End Guide</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="px-4 py-3.5 space-y-4 max-w-md mx-auto sm:max-w-xl md:max-w-3xl">
        {/* 2. ROUTE ITINERARY CARD (Origin -> Destination) */}
        {navDestination && (
          <section className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#263D88] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 flex items-center gap-1">
                <Footprints className="w-3 h-3 text-[#53AADF]" />
                {isNavigating ? 'Walking Guide In Progress' : 'Planned Route Preview'}
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

            {/* Origin & Destination Box */}
            <div className="bg-[#F4F7FB] rounded-2xl p-3.5 border border-slate-100 relative space-y-3">
              {/* Origin */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Start / Departure Point</p>
                    <p className="text-xs font-bold text-[#101214] truncate">{navOrigin.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{navOrigin.building} • {navOrigin.floor}</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowOriginSelector(!showOriginSelector)}
                  className="text-[11px] font-semibold text-[#263D88] hover:text-[#53AADF] px-2 py-1 rounded-lg bg-white border border-slate-200 shrink-0 cursor-pointer shadow-2xs"
                >
                  Change
                </button>
              </div>

              {/* Connecting Line with Swap Button */}
              <div className="relative pl-3.5 py-0.5 flex items-center">
                <div className="w-0.5 h-6 bg-slate-300 ml-[11px]" />
                <button
                  onClick={handleSwapRoute}
                  className="absolute left-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white border border-slate-200 text-[#263D88] hover:bg-[#BADDF2]/30 transition-all shadow-xs cursor-pointer active:scale-90"
                  title="Swap Departure and Destination"
                >
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </div>

              {/* Destination */}
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#263D88] text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <MapPin className="w-3.5 h-3.5 fill-white text-[#263D88]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-[10px] uppercase font-bold text-[#263D88]">Destination</p>
                    {navDestination.roomNumber && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white text-slate-800 border border-slate-200">
                        {navDestination.roomNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-[#101214] truncate">{navDestination.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {navDestination.building} • {navDestination.floor}
                  </p>
                </div>
              </div>
            </div>

            {/* Origin Quick Selector Dropdown (Optional drawer) */}
            {showOriginSelector && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 animate-in fade-in">
                <p className="text-[11px] font-bold text-slate-600">Select Departure Point:</p>
                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {CAMPUS_LOCATIONS.slice(0, 8).map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setNavOrigin(loc);
                        setShowOriginSelector(false);
                        showToast(`Start location set to ${loc.name}`);
                      }}
                      className={`p-2 rounded-xl text-left truncate transition-colors cursor-pointer border ${
                        navOrigin.id === loc.id
                          ? 'bg-[#263D88] text-white border-[#263D88] font-bold'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <p className="font-semibold truncate text-[11px]">{loc.name}</p>
                      <p className="text-[10px] opacity-75 truncate">{loc.building}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Start Navigation Action Button if not currently active */}
            {!isNavigating && (
              <button
                onClick={() => startNavigationTo(navDestination)}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#263D88] hover:bg-[#1E2F6B] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#263D88]/20 transition-all active:scale-98 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white text-[#263D88]" />
                <span>Start Step-by-Step Walking Guide</span>
              </button>
            )}
          </section>
        )}

        {/* 3. ACTIVE STEP GUIDANCE CARD (Turn-by-turn instruction highlight) */}
        {isNavigating && activeRoute && currentStep && (
          <section className="bg-white rounded-3xl p-5 border-2 border-[#263D88]/30 shadow-lg space-y-4 animate-in fade-in">
            {/* Step Progress & Header */}
            <div className="space-y-2 pb-2 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#263D88] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {currentNavStepIndex + 1}/{activeRoute.steps.length}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Current Guidance Step
                    </span>
                    <p className="text-xs font-bold text-[#101214]">
                      Step {currentNavStepIndex + 1} of {activeRoute.steps.length}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-[#263D88]">{progressPercent}% complete</span>
                  <p className="text-[10px] text-slate-400">~{activeRoute.estimatedWalkTimeMin} min total</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#263D88] h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Prominent Current Step Display */}
            <div className="p-4 rounded-2xl bg-[#BADDF2]/20 border border-[#BADDF2] flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-white border border-[#BADDF2] shadow-xs shrink-0 mt-0.5">
                {getDirectionIcon(currentStep.direction, 'w-6 h-6')}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-[#101214] leading-relaxed">
                  {currentStep.instruction}
                </p>

                {/* Badges: Distance & Landmark */}
                <div className="flex items-center gap-2.5 mt-2.5 text-[11px] text-[#263D88] font-semibold flex-wrap">
                  <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#BADDF2]/80 shadow-2xs">
                    <Footprints className="w-3.5 h-3.5 text-[#53AADF]" />
                    <span>{currentStep.distanceMeters}m walk</span>
                  </span>

                  {currentStep.landmark && (
                    <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#BADDF2]/80 text-slate-700 shadow-2xs">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{currentStep.landmark}</span>
                    </span>
                  )}

                  {currentStep.floorNote && (
                    <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#BADDF2]/80 text-[#263D88] shadow-2xs">
                      <Layers className="w-3 h-3 text-[#263D88]" />
                      <span>{currentStep.floorNote}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons: Prev / Next / Replay Voice */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={prevNavStep}
                disabled={currentNavStepIndex === 0}
                className="py-3 px-3.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <button
                onClick={() => {
                  if (currentStep) {
                    speakStepInstruction(currentStep.instruction);
                    showToast('Playing voice instruction');
                  }
                }}
                className="p-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                title="Hear Instruction Voice"
              >
                <Volume2 className="w-4 h-4 text-[#263D88]" />
              </button>

              <button
                onClick={nextNavStep}
                className={`flex-1 py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 cursor-pointer ${
                  isLastStep
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                    : 'bg-[#263D88] hover:bg-[#1E2F6B] text-white shadow-[#263D88]/20'
                }`}
              >
                {isLastStep ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Arrived at Destination!</span>
                  </>
                ) : (
                  <>
                    <span>Next Step Direction</span>
                    <ChevronRight className="w-4 h-4 text-[#53AADF]" />
                  </>
                )}
              </button>
            </div>
          </section>
        )}

        {/* 4. COMPLETE STEP-BY-STEP ROADMAP / TIMELINE */}
        {activeRoute && (
          <section className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-[#101214] uppercase tracking-wider flex items-center gap-1.5">
                  <ListOrdered className="w-4 h-4 text-[#263D88]" />
                  <span>Full Steps Roadmap ({activeRoute.steps.length} Steps)</span>
                </h2>
                <p className="text-[11px] text-slate-500">Tap any step to inspect or jump to it</p>
              </div>
              <span className="text-[11px] font-semibold text-[#263D88] bg-blue-50 px-2 py-0.5 rounded-md">
                Total: {activeRoute.totalDistanceMeters}m
              </span>
            </div>

            {/* Vertical Step Timeline */}
            <div className="space-y-2 pt-1">
              {activeRoute.steps.map((step, idx) => {
                const isCurrent = idx === currentNavStepIndex;
                const isPast = idx < currentNavStepIndex;

                return (
                  <div
                    key={step.id}
                    onClick={() => jumpToNavStep(idx)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative ${
                      isCurrent
                        ? 'bg-[#BADDF2]/30 border-[#263D88] ring-1 ring-[#263D88] shadow-xs'
                        : isPast
                        ? 'bg-slate-50/70 border-slate-200/60 opacity-80'
                        : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {/* Step index badge */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs mt-0.5 transition-colors ${
                        isCurrent
                          ? 'bg-[#263D88] text-white shadow-xs'
                          : isPast
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            isCurrent ? 'text-[#263D88]' : isPast ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          Step {idx + 1} {isCurrent && '• (Active)'} {isPast && '• Completed'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">{step.distanceMeters}m</span>
                      </div>

                      <p
                        className={`text-xs font-semibold leading-relaxed mt-0.5 ${
                          isCurrent ? 'text-[#101214] font-bold' : 'text-slate-700'
                        }`}
                      >
                        {step.instruction}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[10px]">
                        {step.landmark && (
                          <span className="text-slate-500 font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            {step.landmark}
                          </span>
                        )}
                        {step.floorNote && (
                          <span className="text-slate-400">• {step.floorNote}</span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 self-center">
                      {getDirectionIcon(step.direction, 'w-4 h-4')}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 5. POPULAR DESTINATIONS QUICK-PICKS */}
        {!isNavigating && (
          <section className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-[#101214] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#263D88]" />
              <span>Frequent Campus Destinations</span>
            </h2>

            <div className="grid grid-cols-2 gap-2.5">
              {popularLocations.map((loc) => {
                const Icon = getCategoryIcon(loc.category);
                const isCurrentDest = navDestination?.id === loc.id;

                return (
                  <div
                    key={loc.id}
                    onClick={() => startNavigationTo(loc)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                      isCurrentDest
                        ? 'bg-[#BADDF2]/30 border-[#263D88]'
                        : 'bg-[#F4F7FB] border-slate-100 hover:border-[#53AADF] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-white text-[#263D88] flex items-center justify-center shadow-2xs group-hover:bg-[#263D88] group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-[#263D88] bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        {loc.distanceMeters}m
                      </span>
                    </div>

                    <div className="mt-2.5">
                      <h4 className="text-xs font-bold text-[#101214] truncate group-hover:text-[#263D88] transition-colors">
                        {loc.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{loc.building}</p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-[#263D88] font-bold">
                      <span>Start Guide</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 6. CAMPUS DESTINATION DIRECTORY */}
        <section className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#101214] uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4 text-[#263D88]" />
              <span>Campus Destination Directory</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {filteredLocations.length} destinations
            </span>
          </div>

          {/* Search Filter Input */}
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
                className="absolute right-3 top-2.5 p-0.5 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Quick Chips */}
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

          {/* Building Filter Pills */}
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
            className="space-y-2.5 max-h-96 overflow-y-auto pr-1"
            style={{ scrollbarWidth: 'thin' }}
          >
            {filteredLocations.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl p-4">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-700">No matching campus destination</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Try searching with room number like "B 304" or category like "Canteen"
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
                      <Footprints className="w-3.5 h-3.5" />
                      <span>Guide</span>
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
