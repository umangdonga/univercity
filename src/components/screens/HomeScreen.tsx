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
  BookOpen,
  ChevronRight,
  Share2,
  CalendarPlus,
} from 'lucide-react';

interface CampusNewsItem {
  id: string;
  title: string;
  category: string;
  badge: string;
  timeAgo: string;
  date: string;
  author: string;
  summary: string;
  description: string;
  image: string;
}

const CAMPUS_NEWS_LIST: CampusNewsItem[] = [
  {
    id: 'news-1',
    title: 'Annual Science Fair 2026',
    category: 'ON CAMPUS',
    badge: 'ON CAMPUS',
    timeAgo: '2 hours ago',
    date: 'October 14, 2026',
    author: 'Admin Office & Research Council',
    summary: 'Registration is now open for students across all engineering and science faculties.',
    description:
      'All undergraduate and postgraduate students are cordially invited to submit innovative research models, robotics prototypes, and AI solutions for the Annual Science Fair 2026. Top three project teams will receive prestigious university research grants, incubation backing, and direct mentoring from industry technology partners.',
    image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'news-2',
    title: 'Campus 16 Celebration',
    category: 'ON CAMPUS',
    badge: 'ON CAMPUS',
    timeAgo: '4 hours ago',
    date: 'October 18, 2026',
    author: 'Student Cultural Committee',
    summary: 'Grand Cultural Evening in the Open-Air Amphitheater with musical bands and food stalls.',
    description:
      'Join us for the milestone 16th Campus Anniversary Celebration in the central Open-Air Amphitheater! The evening will feature live indie rock and fusion bands, traditional and contemporary dance battles, stand-up comedy by alumni, and artisan food trucks set up along the South Quad.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'news-3',
    title: 'Health Care Project',
    category: 'ON CAMPUS',
    badge: 'ON CAMPUS',
    timeAgo: 'Yesterday',
    date: 'October 12, 2026',
    author: 'Campus Medical Center',
    summary: 'Free dental screening, vision checkups, and wellness counseling for all campus members.',
    description:
      'The University Teaching Hospital is conducting a three-day campus wellness camp. Certified physicians, optometrists, and dental specialists will provide free diagnostics, blood pressure and BMI checks, and preventive healthcare advice. Walk-ins welcome at the Student Health Center.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'news-4',
    title: 'New Canteen Open',
    category: 'ON CAMPUS',
    badge: 'ON CAMPUS',
    timeAgo: 'Yesterday',
    date: 'October 11, 2026',
    author: 'Campus Amenities & Services',
    summary: 'SKY Cafe officially opens on Level 4 of Block C with panoramic rooftop views.',
    description:
      'Experience scenic skyline dining and artisan espresso at the newly opened SKY Cafe! Located on Level 4 of Block C, the cafe features open-air botanical terrace seating, study desks with charging outlets, and a fresh gourmet menu including grilled paninis, Belgian waffles, and iced cold brews.',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop&q=80',
  },
];

export const HomeScreen: React.FC = () => {
  const {
    setActiveTab,
    setIsSearchOpen,
    openService,
    startNavigationTo,
    registeredEvents,
    toggleEventRegistration,
    setActiveEventModal,
    showToast,
  } = useApp();

  // Next class & Bus route data for Student
  const nextClassLoc =
    CAMPUS_LOCATIONS.find((loc) => loc.id === 'classroom-b304') || CAMPUS_LOCATIONS[0];
  const busRoute4 = BUS_ROUTES_DATA[0];

  // News detail modal state
  const [selectedNews, setSelectedNews] = useState<CampusNewsItem | null>(null);
  const [isAllNewsModalOpen, setIsAllNewsModalOpen] = useState<boolean>(false);

  /* -------------------------------------------------------------
     A. STUDENT DASHBOARD (Figma Page 15 Specification)
  ------------------------------------------------------------- */
  const renderStudentDashboard = () => {
    // Top 3 canteens matching Page 15: UNIQUE canteen, SKY Cafe, Leaf Cafe
    const displayCanteens = [
      CANTEENS_DATA.find((c) => c.id === 'unique-canteen') || CANTEENS_DATA[1],
      CANTEENS_DATA.find((c) => c.id === 'sky-cafe') || CANTEENS_DATA[0],
      CANTEENS_DATA.find((c) => c.id === 'leaf-cafe') || CANTEENS_DATA[2],
    ].filter(Boolean);

    return (
      <div className="space-y-6">
        {/* 1. Campus Map Section (Page 15) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-base text-[#101214]">Campus Map</h3>
            <button
              onClick={() => setActiveTab('navigation')}
              className="text-xs font-bold text-[#263D88] hover:text-[#53AADF] transition-colors cursor-pointer"
            >
              Interactive Map →
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            {/* Map Preview Graphic with 3D Canvas / Campus Overview */}
            <div className="relative h-48 bg-[#EAF2F8] overflow-hidden">
              <Campus3DCanvas compact interactive={false} onLocationSelect={(loc) => startNavigationTo(loc)} />

              {/* Floating Pill: View Full Map */}
              <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-20">
                <button
                  onClick={() => setActiveTab('navigation')}
                  className="px-4 py-2 rounded-full bg-white/95 hover:bg-white text-[#101214] font-bold text-xs shadow-md border border-slate-200/80 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 backdrop-blur-md"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#263D88]" />
                  <span>View Full Map</span>
                </button>
              </div>
            </div>

            {/* Sub-card: Explore Campus Buildings */}
            <div
              onClick={() => setActiveTab('navigation')}
              className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors cursor-pointer border-t border-slate-100"
            >
              <div>
                <h4 className="text-sm font-bold text-[#101214]">Explore Campus Buildings</h4>
                <p className="text-xs text-slate-500 mt-0.5">Find labs, department, and reception area</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#BADDF2]/40 hover:bg-[#263D88] hover:text-white flex items-center justify-center text-[#263D88] transition-colors shrink-0">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </section>

        {/* 2. Quick Action - 2x2 Grid of Navy Cards (Page 15) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-base text-[#101214]">Quick Action</h3>
            <button
              onClick={() => setActiveTab('services')}
              className="text-xs font-bold text-[#263D88] hover:text-[#53AADF] transition-colors cursor-pointer"
            >
              See All
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Bus service */}
            <div
              onClick={() => openService('bus')}
              className="bg-[#0C3558] hover:bg-[#08243c] text-white rounded-3xl p-4 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98] flex flex-col justify-between min-h-[114px]"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                <Bus className="w-5 h-5" />
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-bold text-white leading-tight">Bus service</h4>
                <p className="text-[11px] text-white/70 mt-0.5">Menu &amp; Specials</p>
              </div>
            </div>

            {/* Admission */}
            <div
              onClick={() => openService('admission')}
              className="bg-[#0C3558] hover:bg-[#08243c] text-white rounded-3xl p-4 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98] flex flex-col justify-between min-h-[114px]"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-bold text-white leading-tight">Admission</h4>
                <p className="text-[11px] text-white/70 mt-0.5">Status &amp; Faqs</p>
              </div>
            </div>

            {/* Hostel */}
            <div
              onClick={() => openService('hostel')}
              className="bg-[#0C3558] hover:bg-[#08243c] text-white rounded-3xl p-4 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98] flex flex-col justify-between min-h-[114px]"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                <Home className="w-5 h-5" />
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-bold text-white leading-tight">Hostel</h4>
                <p className="text-[11px] text-white/70 mt-0.5">Room info</p>
              </div>
            </div>

            {/* Library */}
            <div
              onClick={() => openService('library')}
              className="bg-[#0C3558] hover:bg-[#08243c] text-white rounded-3xl p-4 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98] flex flex-col justify-between min-h-[114px]"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-bold text-white leading-tight">Library</h4>
                <p className="text-[11px] text-white/70 mt-0.5">Book Service</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Next Class & Campus Shuttle - 2-Column Schedule */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Next Class Card */}
          <div className="bg-[#263D88] rounded-3xl p-4 text-white relative overflow-hidden shadow-sm flex flex-col justify-between">
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
                className="py-1.5 px-3 rounded-xl bg-white text-[#263D88] font-bold text-[11px] flex items-center gap-1 hover:bg-[#BADDF2] transition-colors shadow-xs cursor-pointer active:scale-95"
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
                className="py-1.5 px-3 rounded-xl bg-[#BADDF2]/50 hover:bg-[#263D88] hover:text-white text-[#263D88] font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer active:scale-95"
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

        {/* 4. Canteens Section (Page 15: UNIQUE canteen, SKY Cafe, Leaf Cafe) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-base text-[#101214]">Canteens</h3>
            <button
              onClick={() => openService('canteen')}
              className="text-xs font-bold text-[#263D88] hover:text-[#53AADF] transition-colors cursor-pointer"
            >
              See all canteens
            </button>
          </div>

          <div className="space-y-3">
            {displayCanteens.map((canteen) => (
              <div
                key={canteen.id}
                onClick={() => openService('canteen')}
                className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs hover:border-[#53AADF] hover:shadow-md transition-all cursor-pointer flex items-start gap-3.5 group"
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 relative">
                  <img
                    src={canteen.image}
                    alt={canteen.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">
                    {canteen.openStatus}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#101214] group-hover:text-[#263D88] transition-colors">
                      {canteen.name}
                    </h4>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{canteen.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-snug">
                    {canteen.tagline}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span>{canteen.timings.split('•')[0]}</span>
                    <span>•</span>
                    <span className="text-[#263D88] font-semibold">View Menu →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Latest News Section (Page 15) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-base text-[#101214]">Latest News</h3>
            <button
              onClick={() => setIsAllNewsModalOpen(true)}
              className="text-xs font-bold text-[#263D88] hover:text-[#53AADF] transition-colors cursor-pointer"
            >
              See all News
            </button>
          </div>

          <div className="space-y-2.5">
            {CAMPUS_NEWS_LIST.map((news) => (
              <div
                key={news.id}
                onClick={() => setSelectedNews(news)}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs hover:border-[#53AADF] hover:shadow-sm transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#EBF4FA] text-[#263D88] uppercase tracking-wider">
                      {news.badge}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {news.timeAgo}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#101214] truncate group-hover:text-[#263D88] transition-colors">
                    {news.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{news.summary}</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#263D88] group-hover:text-white flex items-center justify-center text-slate-400 shrink-0 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Events Section (Page 15) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-base text-[#101214]">Events</h3>
            <button
              onClick={() => showToast('All campus events listed below. Tap Register to claim pass.')}
              className="text-xs font-bold text-[#263D88] hover:text-[#53AADF] transition-colors cursor-pointer"
            >
              See all events
            </button>
          </div>

          <div className="space-y-3">
            {CAMPUS_EVENTS_DATA.slice(0, 3).map((event) => {
              const isRegistered = registeredEvents.includes(event.id);
              return (
                <div
                  key={event.id}
                  className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EBF4FA] text-[#263D88]">
                        {event.category}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {event.date}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#101214] truncate">{event.title}</h4>
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#53AADF] shrink-0" />
                      <span>{event.venue}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => toggleEventRegistration(event.id)}
                    className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                      isRegistered
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-[#263D88] hover:bg-[#1E2F6B] text-white'
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
      </div>
    );
  };





  return (
    <div id="home-screen-page" className="bg-[#F4F7FB] min-h-screen pb-24 font-['Poppins',sans-serif]">
      {/* Top Curved Navy Header with Google Avatar & Notification Trigger */}
      <Header isHomeBanner={true} />

      <main className="px-5 py-4 space-y-5 max-w-md mx-auto sm:max-w-xl md:max-w-2xl">
        {renderStudentDashboard()}
      </main>

      {/* Campus News Detail Modal (Page 28 Specification) */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="relative h-44 shrink-0 overflow-hidden">
              <img
                src={selectedNews.image}
                alt={selectedNews.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <button
                onClick={() => setSelectedNews(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-4 right-4">
                <span className="px-2.5 py-0.5 rounded-full bg-[#53AADF] text-white text-[10px] font-extrabold uppercase tracking-wider">
                  {selectedNews.badge}
                </span>
                <h3 className="text-white font-bold text-base mt-1 leading-snug">
                  {selectedNews.title}
                </h3>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
                <span className="font-semibold text-slate-700">{selectedNews.author}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {selectedNews.timeAgo}
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                <p className="font-medium text-slate-800 text-[13px]">{selectedNews.summary}</p>
                <p>{selectedNews.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-2.5">
                <button
                  onClick={() => {
                    showToast(`Event "${selectedNews.title}" added to your student calendar.`);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#263D88] hover:bg-[#1E2F6B] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  <CalendarPlus className="w-4 h-4" />
                  <span>Add to Calendar</span>
                </button>
                <button
                  onClick={() => {
                    showToast('Announcement link copied to clipboard!');
                  }}
                  className="py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Campus News Modal */}
      {isAllNewsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#101214]">All Campus News</h3>
                <p className="text-xs text-slate-400">Verified official university bulletins</p>
              </div>
              <button
                onClick={() => setIsAllNewsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              {CAMPUS_NEWS_LIST.map((news) => (
                <div
                  key={news.id}
                  onClick={() => {
                    setIsAllNewsModalOpen(false);
                    setSelectedNews(news);
                  }}
                  className="p-3.5 rounded-2xl border border-slate-200/80 hover:border-[#53AADF] hover:shadow-xs transition-all cursor-pointer group flex items-start gap-3"
                >
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#BADDF2]/50 text-[#263D88] uppercase">
                      {news.badge}
                    </span>
                    <h4 className="text-xs font-bold text-[#101214] mt-1 group-hover:text-[#263D88] truncate">
                      {news.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                      {news.summary}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{news.timeAgo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
