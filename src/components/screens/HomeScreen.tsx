import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { Campus3DCanvas } from '../map/Campus3DCanvas';
import {
  CAMPUS_LOCATIONS,
  CANTEENS_DATA,
  CAMPUS_EVENTS_DATA,
  BUS_ROUTES_DATA,
} from '../../data/mockCampusData';
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
  ShieldCheck,
  AlertTriangle,
  Megaphone,
  Briefcase,
  Ticket,
  Eye,
  Send,
  X,
  FileText,
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
    showToast,
    triggerGuestRestriction,
  } = useApp();

  // Next class & Bus route data for Student & Faculty
  const nextClassLoc =
    CAMPUS_LOCATIONS.find((loc) => loc.id === 'classroom-b304') || CAMPUS_LOCATIONS[0];
  const busRoute4 = BUS_ROUTES_DATA[0];

  // Admin Broadcast Notice Modal State
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState<boolean>(false);
  const [broadcastTitle, setBroadcastTitle] = useState<string>('');
  const [broadcastCategory, setBroadcastCategory] = useState<string>('Academic');
  const [broadcastBody, setBroadcastBody] = useState<string>('');

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) {
      showToast('Please fill in title and notice text.');
      return;
    }
    showToast(`Notice "${broadcastTitle}" broadcasted to all active campus devices!`);
    setBroadcastTitle('');
    setBroadcastBody('');
    setIsBroadcastModalOpen(false);
  };

  /* -------------------------------------------------------------
     A. STUDENT DASHBOARD
  ------------------------------------------------------------- */
  const renderStudentDashboard = () => {
    const studentPrimaryShortcuts = [
      {
        label: '3D Nav',
        icon: Navigation,
        action: () => setActiveTab('navigation'),
      },
      {
        label: 'Classrooms',
        icon: GraduationCap,
        action: () => startNavigationTo(nextClassLoc),
      },
      {
        label: 'Canteen',
        icon: Sparkles,
        action: () => openService('canteen'),
      },
      {
        label: 'Bus',
        icon: Bus,
        action: () => openService('bus'),
      },
    ];

    const studentSecondaryShortcuts = [
      {
        label: 'Labs',
        icon: FlaskConical,
        action: () => openService('labs'),
      },
      { label: 'Hostel', icon: Home, action: () => openService('hostel') },
      { label: 'Library', icon: FileText, action: () => openService('library') },
      { label: 'Parking', icon: Car, action: () => openService('parking') },
    ];

    return (
      <div className="space-y-5">
        {/* 1. Quick Navigation - View Map Removed as requested */}
        <section className="space-y-2.5">
          <div className="flex justify-between items-end px-1">
            <h3 className="font-bold text-base text-[#101214]">Quick Navigation</h3>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {studentPrimaryShortcuts.map((item, idx) => {
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

          <div className="grid grid-cols-4 gap-2 pt-1">
            {studentSecondaryShortcuts.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className="py-1.5 px-2 rounded-xl bg-white border border-slate-100 hover:border-[#53AADF] text-[10px] font-medium text-slate-600 hover:text-[#263D88] flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer"
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
                className="py-1.5 px-3 rounded-xl bg-white text-[#263D88] font-bold text-[11px] flex items-center gap-1 hover:bg-[#BADDF2] transition-colors shadow-xs cursor-pointer"
              >
                <Navigation className="w-3 h-3 fill-[#263D88]" />
                <span>Navigate</span>
              </button>
            </div>
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
                className="py-1.5 px-3 rounded-xl bg-[#BADDF2]/50 hover:bg-[#263D88] hover:text-white text-[#263D88] font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Live Route</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
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

        {/* 4. Trending Campus Events with 1-Click Register */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <div>
              <h3 className="font-bold text-base text-[#101214]">Trending Campus Events</h3>
              <p className="text-[11px] text-slate-400">1-click pass registration & venue guide</p>
            </div>
            <span className="text-xs font-bold text-[#263D88]">{CAMPUS_EVENTS_DATA.length} Available</span>
          </div>

          <div className="space-y-2.5">
            {CAMPUS_EVENTS_DATA.slice(0, 3).map((event) => {
              const isRegistered = registeredEvents.includes(event.id);
              return (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#263D88]">
                        {event.category}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {event.date} • {event.time}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#101214] truncate">{event.title}</h4>
                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#53AADF]" />
                      {event.venue}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleEventRegistration(event.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      isRegistered
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-[#263D88] hover:bg-[#1E2F6B] text-white shadow-2xs'
                    }`}
                  >
                    {isRegistered ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Registered</span>
                      </>
                    ) : (
                      <>
                        <span>Register</span>
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. 3D Campus Map Preview */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="font-bold text-base text-[#101214]">3D Campus Map Preview</h3>
              <p className="text-[11px] text-slate-400">Interactive multi-floor guidance & facility pins</p>
            </div>
            <button
              onClick={() => setActiveTab('navigation')}
              className="text-xs font-bold text-[#263D88] hover:text-[#53AADF] flex items-center gap-1 cursor-pointer"
            >
              <span>Full 3D Map</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <Campus3DCanvas compact interactive={false} onLocationSelect={(loc) => startNavigationTo(loc)} />
        </section>

        {/* 6. Food Spot Highlights */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-base text-[#101214]">Food Spot Highlights</h3>
            <button
              onClick={() => openService('canteen')}
              className="text-xs font-semibold text-[#53AADF] hover:text-[#263D88] cursor-pointer"
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
      </div>
    );
  };

  /* -------------------------------------------------------------
     B. FACULTY DASHBOARD
  ------------------------------------------------------------- */
  const renderFacultyDashboard = () => {
    const facultyTeachingSchedule = [
      {
        subject: 'CS-301: Advanced Data Structures & Algorithms',
        batch: 'B.Tech CSE - 3rd Year (Section A)',
        room: 'Lecture Hall C-202 (Science Wing)',
        time: '09:30 AM - 11:00 AM',
        status: 'In Progress Now',
        statusColor: 'bg-amber-100 text-amber-800 border-amber-200',
        locationId: 'classroom-b304',
      },
      {
        subject: 'CS-402: Distributed Systems Architecture',
        batch: 'BCA - Final Year (Honors)',
        room: 'Seminar Room B-105 (Knowledge Tower)',
        time: '11:45 AM - 01:15 PM',
        status: 'Upcoming Next',
        statusColor: 'bg-blue-100 text-[#263D88] border-blue-200',
        locationId: 'classroom-b304',
      },
      {
        subject: 'LAB-204: Cloud Computing Practical Review',
        batch: 'MCA - 1st Year (Group 2)',
        room: 'Innovation Lab A-101',
        time: '02:30 PM - 04:30 PM',
        status: 'Afternoon Lab',
        statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        locationId: 'innovation-lab',
      },
    ];

    const facultyShortcuts = [
      {
        label: 'Classrooms',
        icon: GraduationCap,
        action: () => startNavigationTo(nextClassLoc),
      },
      {
        label: 'Department',
        icon: Building2,
        action: () => openService('admission'),
      },
      {
        label: 'Faculty Parking',
        icon: Car,
        action: () => openService('parking'),
      },
      {
        label: 'Research Labs',
        icon: FlaskConical,
        action: () => openService('labs'),
      },
    ];

    return (
      <div className="space-y-5">
        {/* Quick Navigation without View Map */}
        <section className="space-y-2.5">
          <div className="flex justify-between items-end px-1">
            <h3 className="font-bold text-base text-[#101214]">Faculty Quick Shortcuts</h3>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {facultyShortcuts.map((item, idx) => {
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
        </section>

        {/* Today's Teaching Schedule */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <div>
              <h3 className="font-bold text-base text-[#101214]">Today&apos;s Teaching Schedule</h3>
              <p className="text-[11px] text-slate-400">Assigned lectures, student batches & rooms</p>
            </div>
            <span className="text-xs font-bold text-[#263D88]">3 Sessions Today</span>
          </div>

          <div className="space-y-3">
            {facultyTeachingSchedule.map((lecture, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${lecture.statusColor}`}>
                      {lecture.status}
                    </span>
                    <h4 className="text-xs font-bold text-[#101214] mt-1.5 leading-snug">
                      {lecture.subject}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{lecture.batch}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-[#263D88]">{lecture.time}</span>
                  </div>
                </div>

                <div className="bg-[#F4F7FB] p-2.5 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 truncate max-w-[200px]">
                    <MapPin className="w-3.5 h-3.5 text-[#53AADF] shrink-0" />
                    <span className="truncate">{lecture.room}</span>
                  </div>
                  <button
                    onClick={() => {
                      const loc = CAMPUS_LOCATIONS.find((l) => l.id === lecture.locationId) || nextClassLoc;
                      startNavigationTo(loc);
                    }}
                    className="py-1.5 px-3 rounded-lg bg-[#263D88] hover:bg-[#1E2F6B] text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    <Navigation className="w-3 h-3 fill-white" />
                    <span>3D Route</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Student Consultation & Office Hours */}
        <section className="bg-gradient-to-br from-[#263D88] to-[#1E2F6B] text-white rounded-3xl p-5 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#53AADF]" />
              <h3 className="text-sm font-bold text-white">Student Office Hours</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-slate-900">
              Active Queue
            </span>
          </div>
          <p className="text-xs text-blue-100 leading-relaxed">
            Faculty Cabin F-12 • Available today from 01:30 PM to 03:00 PM.
          </p>
          <div className="bg-white/10 rounded-2xl p-3 flex items-center justify-between text-xs">
            <div>
              <p className="text-[10px] text-blue-200">Current Queue</p>
              <p className="font-bold text-white text-sm">3 Students Waiting</p>
            </div>
            <button
              onClick={() => showToast('Student Consultation Queue managed. Next student alerted.')}
              className="py-1.5 px-3 rounded-xl bg-white text-[#263D88] font-bold text-xs hover:bg-[#BADDF2] transition-colors cursor-pointer"
            >
              Call Next Student
            </button>
          </div>
        </section>

        {/* Faculty Academic Notices */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-base text-[#101214]">Academic Notices & Circulars</h3>
            <span className="text-[11px] text-slate-400">Faculty Senate</span>
          </div>

          <div className="space-y-2.5">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#101214]">Mid-Term Evaluation Marks Submission</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  All departments must finalize internal marks by Friday 5:00 PM via ERP portal.
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">Due: Nov 28, 2026</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#263D88] flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#101214]">Departmental Curriculum Committee Meeting</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Agenda: Revision of 2027 AI & Data Engineering syllabus in Conference Room 2.
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">Today at 4:30 PM</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  };

  /* -------------------------------------------------------------
     C. ADMIN DASHBOARD
  ------------------------------------------------------------- */
  const renderAdminDashboard = () => {
    return (
      <div className="space-y-5">
        {/* Key Campus Statistics Row */}
        <section className="space-y-2.5">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-base text-[#101214]">Campus Analytics & Operations</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Sensor Sync
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Active Students</span>
                <Users className="w-4 h-4 text-[#263D88]" />
              </div>
              <p className="text-xl font-extrabold text-[#101214]">4,820</p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">98.4% on campus today</p>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Faculty Active</span>
                <GraduationCap className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-xl font-extrabold text-[#101214]">342</p>
              <p className="text-[10px] text-purple-600 font-semibold mt-0.5">28 departments checked in</p>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Bus Passes Issued</span>
                <Ticket className="w-4 h-4 text-[#53AADF]" />
              </div>
              <p className="text-xl font-extrabold text-[#263D88]">1,280</p>
              <p className="text-[10px] text-blue-600 font-semibold mt-0.5">14 pending verification</p>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Active Shuttles</span>
                <Bus className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xl font-extrabold text-emerald-700">24 / 24</p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">100% on schedule</p>
            </div>
          </div>
        </section>

        {/* Bus Pass Management Summary */}
        <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bus className="w-4 h-4 text-[#263D88]" />
              <h3 className="text-xs font-bold text-[#101214] uppercase tracking-wider">
                Bus Pass Management
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              14 Pending
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            1,280 student bus passes active for Fall 2026. 14 new applications from Ahmedabad & Gandhinagar stops awaiting admin verification.
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => openService('bus')}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#263D88] hover:bg-[#1E2F6B] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Review Bus Applications</span>
            </button>
          </div>
        </section>

        {/* Broadcast Campus Notice Shortcut */}
        <section className="bg-gradient-to-br from-[#263D88] to-[#101214] text-white rounded-3xl p-5 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#53AADF]" />
              <h3 className="text-sm font-bold text-white">Broadcast Campus Notice</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
              Instant Push
            </span>
          </div>
          <p className="text-xs text-blue-100 leading-relaxed">
            Send high-priority academic notifications, emergency updates, or weather advisories to all students and faculty.
          </p>
          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#53AADF] hover:bg-[#BADDF2] text-[#263D88] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Compose & Send Broadcast</span>
          </button>
        </section>

        {/* Campus Facilities Live Status */}
        <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-[#101214] uppercase tracking-wider">
            Campus Facilities Status
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#F4F7FB]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-800">S Y Cafe & Dining Hall</span>
              </div>
              <span className="text-slate-500">92% Capacity (Normal)</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-[#F4F7FB]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-800">Computing & Research Labs</span>
              </div>
              <span className="text-slate-500">18 Sessions Ongoing</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-[#F4F7FB]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-800">Central Knowledge Library</span>
              </div>
              <span className="text-slate-500">Open (340 Visitors)</span>
            </div>
          </div>
        </section>
      </div>
    );
  };

  /* -------------------------------------------------------------
     D. GUEST DASHBOARD
  ------------------------------------------------------------- */
  const renderGuestDashboard = () => {
    return (
      <div className="space-y-5">
        {/* Notice: Guest Mode - View Only */}
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
          <Eye className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-bold text-amber-900">Guest Mode - View Only</p>
            <p className="text-[11px] text-amber-700 leading-tight">
              You are browsing as a campus visitor. Certain features like course exams and bus pass registration require full Student or Faculty sign-in.
            </p>
          </div>
        </div>

        {/* Campus Welcome & Visitor Information */}
        <section className="bg-gradient-to-br from-[#263D88] via-[#1E2F6B] to-[#101214] text-white rounded-3xl p-6 shadow-md relative overflow-hidden space-y-3">
          <div className="relative z-10">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#53AADF] text-white uppercase tracking-wider">
              Welcome to Campus
            </span>
            <h2 className="text-xl font-bold mt-1 text-white">Explore Our Smart University Campus</h2>
            <p className="text-xs text-blue-100 leading-relaxed mt-1">
              Browse world-class facilities, preview interactive 3D floor navigation, and discover dining spots.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2 pt-2">
            <button
              onClick={() => setActiveTab('navigation')}
              className="py-2.5 px-4 rounded-xl bg-white text-[#263D88] font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-[#BADDF2] transition-colors cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 fill-[#263D88]" />
              <span>Explore 3D Campus Map</span>
            </button>
            <button
              onClick={() => openService('admission')}
              className="py-2.5 px-4 rounded-xl bg-[#53AADF]/30 border border-white/30 text-white font-semibold text-xs hover:bg-white/20 transition-colors cursor-pointer"
            >
              Campus Tour Pass
            </button>
          </div>
        </section>

        {/* Visitor Appointment / Tour Booking Card */}
        <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#263D88]" />
              <h3 className="text-xs font-bold text-[#101214] uppercase tracking-wider">
                Visitor Appointment & Campus Tour
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Open Daily
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Planning a visit for admission counseling or campus tour? Book an official visitor appointment to receive a verified digital entry pass for security gates.
          </p>

          <button
            onClick={() => openService('admission')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#263D88] hover:bg-[#1E2F6B] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            <Ticket className="w-4 h-4 text-[#53AADF]" />
            <span>Book Official Campus Tour Pass</span>
          </button>
        </section>

        {/* Public 3D Campus Map */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="font-bold text-base text-[#101214]">Public Campus Map</h3>
              <p className="text-[11px] text-slate-400">Interactive 3D building exploration</p>
            </div>
            <button
              onClick={() => setActiveTab('navigation')}
              className="text-xs font-bold text-[#263D88] hover:text-[#53AADF] flex items-center gap-1 cursor-pointer"
            >
              <span>Full 3D Map</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <Campus3DCanvas compact interactive={false} onLocationSelect={(loc) => startNavigationTo(loc)} />
        </section>

        {/* Public Events & Exhibitions */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-base text-[#101214]">Public Events & Exhibitions</h3>
            <span className="text-[11px] text-slate-400">Open to All</span>
          </div>

          <div className="space-y-2.5">
            {CAMPUS_EVENTS_DATA.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#263D88]">
                    {event.category}
                  </span>
                  <h4 className="text-xs font-bold text-[#101214] mt-1 truncate">{event.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{event.date} • {event.venue}</p>
                </div>

                <button
                  onClick={() => triggerGuestRestriction('Event Ticket Registration')}
                  className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#263D88] text-xs font-bold shrink-0 transition-colors cursor-pointer"
                >
                  Register Pass
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Food Spots & Cafeterias */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-base text-[#101214]">Food Spots & Cafeterias</h3>
            <button
              onClick={() => openService('canteen')}
              className="text-xs font-semibold text-[#53AADF] hover:text-[#263D88] cursor-pointer"
            >
              See dining spots →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CANTEENS_DATA.map((canteen) => (
              <div
                key={canteen.id}
                onClick={() => openService('canteen')}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="relative h-24 overflow-hidden">
                  <img
                    src={canteen.image}
                    alt={canteen.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">
                    ★ {canteen.rating}
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="text-xs font-bold text-[#101214] group-hover:text-[#263D88] transition-colors">
                    {canteen.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 truncate">{canteen.tagline}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  };

  return (
    <div id="home-screen-page" className="bg-[#F4F7FB] min-h-screen pb-24 font-['Poppins',sans-serif]">
      {/* Top Curved Navy Header with Google Avatar & Notification Trigger */}
      <Header isHomeBanner={true} />

      <main className="px-5 py-4 space-y-5 max-w-md mx-auto sm:max-w-xl md:max-w-2xl">
        {user.role === 'student' && renderStudentDashboard()}
        {user.role === 'faculty' && renderFacultyDashboard()}
        {user.role === 'admin' && renderAdminDashboard()}
        {user.role === 'guest' && renderGuestDashboard()}
      </main>

      {/* Admin Broadcast Notice Compose Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#263D88]" />
                <h3 className="text-sm font-bold text-[#101214]">Broadcast Campus Notice</h3>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Notice Headline</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Heavy Rain Advisory: Afternoon classes online"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#263D88] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notice Category</label>
                <select
                  value={broadcastCategory}
                  onChange={(e) => setBroadcastCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#263D88] outline-none"
                >
                  <option>Academic</option>
                  <option>Emergency Alert</option>
                  <option>Campus Facilities</option>
                  <option>Transportation</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Announcement Body</label>
                <textarea
                  rows={3}
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  placeholder="Provide complete details for students and staff..."
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#263D88] outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#263D88] hover:bg-[#1E2F6B] text-white font-bold cursor-pointer"
                >
                  Send Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
