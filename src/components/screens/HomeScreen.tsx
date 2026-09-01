import React from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { Campus3DCanvas } from '../map/Campus3DCanvas';
import { CAMPUS_LOCATIONS, CANTEENS_DATA, CAMPUS_EVENTS_DATA, BUS_ROUTES_DATA } from '../../data/mockCampusData';
import {
  Search,
  Navigation,
  Bus,
  GraduationCap,
  FlaskConical,
  Building2,
  Home,
  Car,
  Users,
  Compass,
  ArrowRight,
  Clock,
  Star,
  Calendar,
  Sparkles,
  MapPin,
  CheckCircle2,
  BellRing,
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    user,
    setActiveTab,
    setIsSearchOpen,
    openService,
    startNavigationTo,
    registeredEvents,
    toggleEventRegistration,
    setActiveEventModal,
    setActiveBusTicket,
  } = useApp();

  const nextClassLoc = CAMPUS_LOCATIONS.find((loc) => loc.id === 'classroom-b304') || CAMPUS_LOCATIONS[0];
  const busRoute4 = BUS_ROUTES_DATA[0];

  const primaryShortcuts = [
    { label: '3D Nav', icon: Navigation, action: () => setActiveTab('navigation'), color: 'bg-[#BADDF2] text-[#263D88]' },
    { label: 'Classrooms', icon: GraduationCap, action: () => startNavigationTo(nextClassLoc), color: 'bg-[#BADDF2] text-[#263D88]' },
    { label: 'Canteen', icon: Sparkles, action: () => openService('canteen'), color: 'bg-[#BADDF2] text-[#263D88]' },
    { label: 'Bus', icon: Bus, action: () => openService('bus'), color: 'bg-[#BADDF2] text-[#263D88]' },
  ];

  const secondaryShortcuts = [
    { label: 'Labs', icon: FlaskConical, action: () => {
      const lab = CAMPUS_LOCATIONS.find((l) => l.id === 'innovation-lab');
      if (lab) startNavigationTo(lab);
    } },
    { label: 'Hostel', icon: Home, action: () => openService('hostel') },
    { label: 'Admin Office', icon: Building2, action: () => openService('admission') },
    { label: 'Parking', icon: Car, action: () => openService('parking') },
  ];

  return (
    <div className="bg-[#F4F7FB] min-h-screen pb-24 font-['Poppins',sans-serif]">
      {/* Top Curved Navy Header */}
      <Header isHomeBanner={true} />

      <main className="px-5 py-4 space-y-5 max-w-md mx-auto sm:max-w-xl md:max-w-2xl">
        {/* 1. Quick Navigation - Exact Design HTML layout */}
        <section className="space-y-2.5">
          <div className="flex justify-between items-end px-1">
            <h3 className="font-bold text-base text-[#101214]">Quick Navigation</h3>
            <button
              onClick={() => setActiveTab('navigation')}
              className="text-[#53AADF] hover:text-[#263D88] text-xs font-semibold cursor-pointer transition-colors"
            >
              View Map
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {primaryShortcuts.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#BADDF2] hover:bg-[#263D88] hover:text-white flex items-center justify-center text-[#263D88] shadow-xs group-hover:scale-105 group-hover:shadow-md transition-all active:scale-95">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#101214]">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Secondary Quick Access Bar */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {secondaryShortcuts.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className="py-1.5 px-2 rounded-xl bg-white border border-slate-100 hover:border-[#53AADF] text-[10px] font-medium text-slate-600 hover:text-[#263D88] flex items-center justify-center gap-1 transition-all shadow-xs"
                >
                  <Icon className="w-3.5 h-3.5 text-[#53AADF]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. Next Class & Campus Shuttle - 2-Column Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Next Class Card */}
          <div className="bg-[#263D88] rounded-3xl p-4 text-white relative overflow-hidden shadow-md flex flex-col justify-between">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">Next Class</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                  3rd Floor
                </span>
              </div>
              <p className="font-bold text-base leading-tight mt-1">Classroom B 304</p>
              <p className="text-[11px] mt-1 text-white/90">B-Block • Advanced UI Design</p>
              <p className="text-xs font-semibold mt-2 text-[#BADDF2]">10:30 AM - 11:30 AM</p>
            </div>

            <div className="relative z-10 mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between">
              <span className="text-[10px] text-white/80">~3 min walk (180m)</span>
              <button
                onClick={() => startNavigationTo(nextClassLoc)}
                className="py-1.5 px-3 rounded-xl bg-white text-[#263D88] font-bold text-[11px] flex items-center gap-1 hover:bg-[#BADDF2] transition-colors shadow-xs"
              >
                <Navigation className="w-3 h-3 fill-[#263D88]" />
                <span>Navigate</span>
              </button>
            </div>

            {/* Subtle background watermark icon */}
            <div className="absolute -right-3 -bottom-3 opacity-10 pointer-events-none">
              <GraduationCap className="w-24 h-24" />
            </div>
          </div>

          {/* Campus Shuttle Card */}
          <div className="bg-white border-2 border-[#BADDF2] rounded-3xl p-4 relative overflow-hidden shadow-xs flex flex-col justify-between">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-[#101214]/60 uppercase tracking-wider font-semibold">Campus Shuttle</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  {busRoute4.availableSeats} seats left
                </span>
              </div>
              <p className="font-bold text-base text-[#263D88] mt-1">{busRoute4.busNumber} - {busRoute4.title}</p>
              <p className="text-[11px] mt-1 text-[#53AADF] font-bold">Arriving: {busRoute4.nextTiming}</p>
              <p className="text-[11px] text-slate-500 mt-1">Route: {busRoute4.routeNumber}</p>
            </div>

            <div className="relative z-10 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">{busRoute4.registeredCount} students booked</span>
              <button
                onClick={() => openService('bus')}
                className="py-1.5 px-3 rounded-xl bg-[#BADDF2]/50 hover:bg-[#263D88] hover:text-white text-[#263D88] font-bold text-[11px] flex items-center gap-1 transition-colors"
              >
                <span>Live Route</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Subtle background icon */}
            <div className="absolute -right-3 -bottom-3 opacity-5 pointer-events-none text-[#263D88]">
              <Bus className="w-24 h-24" />
            </div>
          </div>
        </section>

        {/* 3. Live Announcements */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-base text-[#101214]">Live Announcements</h3>
            <span className="text-[11px] text-slate-400">Verified Updates</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {/* Academic Announcement */}
            <div className="flex-shrink-0 w-64 bg-[#BADDF2]/30 border border-[#BADDF2] rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF0000] animate-pulse"></span>
                  <span className="text-[10px] font-bold text-[#FF0000] uppercase tracking-wider">Academic</span>
                </div>
                <p className="text-xs font-semibold text-[#101214] leading-snug">
                  Annual Science Fair 2026 Registration is now open!
                </p>
              </div>
              <p className="text-[10px] text-slate-500 mt-3">2 hours ago • Admin Office</p>
            </div>

            {/* Events Announcement */}
            <div className="flex-shrink-0 w-64 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#53AADF]"></span>
                  <span className="text-[10px] font-bold text-[#53AADF] uppercase tracking-wider">Events</span>
                </div>
                <p className="text-xs font-semibold text-[#101214] leading-snug">
                  New Canteen &quot;S Y Cafe&quot; opening this Friday with artisan espresso.
                </p>
              </div>
              <p className="text-[10px] text-slate-500 mt-3">Yesterday • Services Dept</p>
            </div>

            {/* Campus Workshop */}
            <div className="flex-shrink-0 w-64 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#263D88]"></span>
                  <span className="text-[10px] font-bold text-[#263D88] uppercase tracking-wider">Career</span>
                </div>
                <p className="text-xs font-semibold text-[#101214] leading-snug">
                  Tech Campus Placement Orientation in Meeting Hall 1.
                </p>
              </div>
              <p className="text-[10px] text-slate-500 mt-3">Tomorrow, 10:00 AM</p>
            </div>
          </div>
        </section>

        {/* 4. 3D Campus Map Preview */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="font-bold text-base text-[#101214]">3D Campus Map Preview</h3>
              <p className="text-[11px] text-slate-400">Interactive multi-floor guidance & facility pins</p>
            </div>
            <button
              onClick={() => setActiveTab('navigation')}
              className="text-xs font-bold text-[#263D88] hover:text-[#53AADF] flex items-center gap-1"
            >
              <span>Full 3D Map</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <Campus3DCanvas compact interactive={false} onLocationSelect={(loc) => startNavigationTo(loc)} />
        </section>

        {/* 5. Canteen & Food Hubs */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-base text-[#101214]">Canteen & Food Hubs</h3>
            <button
              onClick={() => openService('canteen')}
              className="text-xs font-semibold text-[#53AADF] hover:text-[#263D88]"
            >
              See all canteens →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CANTEENS_DATA.map((canteen) => (
              <div
                key={canteen.id}
                onClick={() => openService('canteen')}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="relative h-28 overflow-hidden">
                  <img
                    src={canteen.image}
                    alt={canteen.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{canteen.rating}</span>
                  </div>
                  <div className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold">
                    {canteen.openStatus}
                  </div>
                </div>

                <div className="p-3.5">
                  <h4 className="text-sm font-bold text-[#101214] group-hover:text-[#263D88] transition-colors">
                    {canteen.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{canteen.tagline}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                    <span>{canteen.reviewsCount} reviews</span>
                    <span className="text-[#263D88] font-semibold">View Menu →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
