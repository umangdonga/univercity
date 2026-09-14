import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  User,
  Shield,
  Bell,
  Volume2,
  LogOut,
  Sparkles,
  QrCode,
  Calendar,
  BookOpen,
  Bus,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Compass,
  ArrowRight,
  KeyRound,
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const {
    user,
    logout,
    updateUserRole,
    activeBusTicket,
    activeAppointmentPass,
    issuedBooks,
    setActiveBusTicket,
    setActiveAppointmentPass,
    isVoiceGuidanceEnabled,
    setIsVoiceGuidanceEnabled,
    openService,
    showToast,
  } = useApp();

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);

  const rolesList: { id: UserRole; title: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'student', title: 'Student', icon: GraduationCap },
    { id: 'faculty', title: 'Faculty', icon: Briefcase },
    { id: 'admin', title: 'Admin', icon: Shield },
    { id: 'guest', title: 'Guest', icon: Compass },
  ];

  return (
    <div className="bg-[#F4F7FB] min-h-screen pb-24 font-['Poppins',sans-serif]">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-br from-[#263D88] to-[#1E2F6B] text-white pt-8 pb-14 px-4 relative overflow-hidden">
        <div className="max-w-md mx-auto sm:max-w-xl md:max-w-2xl flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-white/20 shadow-md bg-white/10"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-[#263D88] rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-white tracking-tight">{user.name}</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#53AADF] text-white uppercase">
                  {user.role}
                </span>
                {user.isAuthenticatedWithGoogle && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-white text-slate-800 shadow-xs border border-white/40">
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>Google Account</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100">{user.email}</p>
              {user.studentId && (
                <p className="text-[11px] font-mono text-blue-200 mt-0.5">ID: {user.studentId}</p>
              )}
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <main className="px-4 -mt-8 space-y-4 max-w-md mx-auto sm:max-w-xl md:max-w-2xl relative z-20">
        {/* Role Switcher Card */}
        <section className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Campus Role
            </span>
            <span className="text-[11px] text-slate-400">Switch permissions</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {rolesList.map((r) => {
              const Icon = r.icon;
              const isCurrent = user.role === r.id;

              return (
                <button
                  key={r.id}
                  onClick={() => updateUserRole(r.id)}
                  className={`py-2 px-1 rounded-2xl text-[11px] font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    isCurrent
                      ? 'bg-[#263D88] text-white shadow-md'
                      : 'bg-[#F4F7FB] text-slate-600 hover:bg-[#BADDF2]/30'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-[#BADDF2]' : 'text-slate-400'}`} />
                  <span className="truncate">{r.title}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Profile Details & Academic Verification */}
        <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold text-[#101214] uppercase tracking-wider">
              Profile & Campus Details
            </h2>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Profile Complete
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 text-[10px]">Enrollment / Employee ID</span>
              <p className="font-semibold text-slate-800">{user.studentId || user.profileData?.studentId || '20240582'}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px]">Department</span>
              <p className="font-semibold text-slate-800">{user.profileData?.department || user.branch || 'Information Technology'}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px]">Course / Program</span>
              <p className="font-semibold text-slate-800 truncate">{user.profileData?.course || 'BCA Specialization'}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px]">Contact Phone</span>
              <p className="font-semibold text-slate-800">{user.profileData?.phone || user.contact || '+91 98765 43210'}</p>
            </div>
          </div>
        </section>

        {/* Bus Information Section - Synchronized with Bus Pass Application */}
        <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bus className="w-4 h-4 text-[#263D88]" />
              <h2 className="text-xs font-bold text-[#101214] uppercase tracking-wider">
                Bus Information
              </h2>
            </div>
            {user.busData ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Pass
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">Not Registered</span>
            )}
          </div>

          {user.busData ? (
            <div className="bg-[#F4F7FB] rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Pickup Stop:</span>
                <span className="font-bold text-[#263D88]">{user.busData.pickupLocation}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Drop Terminal:</span>
                <span className="font-medium text-[#101214]">{user.busData.dropLocation}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Assigned Route:</span>
                <span className="font-bold text-[#263D88]">{user.busData.routeNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Assigned Bus:</span>
                <span className="font-semibold text-emerald-700">{user.busData.busNumber}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Pass Number:</span>
                <span className="font-mono font-bold text-xs text-[#101214]">{user.busData.passNumber}</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#F4F7FB] p-3.5 rounded-2xl flex items-center justify-between text-xs text-slate-500">
              <span>No bus route assigned yet</span>
              <button
                onClick={() => openService('bus')}
                className="font-bold text-[#263D88] hover:text-[#53AADF] transition-colors cursor-pointer"
              >
                Apply for Bus Pass →
              </button>
            </div>
          )}
        </section>

        {/* My Active Passes & Bookings */}
        <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
          <h2 className="text-xs font-bold text-[#101214] uppercase tracking-wider">
            My Digital Passes & Bookings
          </h2>

          <div className="space-y-2.5">
            {/* Bus Pass */}
            {activeBusTicket ? (
              <div
                onClick={() => setActiveBusTicket(activeBusTicket)}
                className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#263D88] text-white">
                    <Bus className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#101214]">{activeBusTicket.busNumber} Pass</h4>
                    <p className="text-[11px] text-slate-500">{activeBusTicket.routeNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#263D88]">View Pass →</span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => openService('bus')}
                className="p-3 rounded-2xl bg-[#F4F7FB] border border-dashed border-slate-200 text-xs text-slate-500 flex items-center justify-between cursor-pointer hover:border-[#263D88]"
              >
                <span>No active bus pass</span>
                <span className="font-bold text-[#263D88]">Register →</span>
              </div>
            )}

            {/* Admission Appointment Pass */}
            {activeAppointmentPass ? (
              <div
                onClick={() => setActiveAppointmentPass(activeAppointmentPass)}
                className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between cursor-pointer hover:bg-emerald-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-700 text-white">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#101214]">Visitor Inquiry Pass</h4>
                    <p className="text-[11px] text-slate-500">{activeAppointmentPass.date} • {activeAppointmentPass.timeSlot}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700">View Ticket →</span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => openService('admission')}
                className="p-3 rounded-2xl bg-[#F4F7FB] border border-dashed border-slate-200 text-xs text-slate-500 flex items-center justify-between cursor-pointer hover:border-[#263D88]"
              >
                <span>No admission appointment</span>
                <span className="font-bold text-[#263D88]">Book Slip →</span>
              </div>
            )}

            {/* Library Books Issued */}
            <div
              onClick={() => openService('library')}
              className="p-3.5 rounded-2xl bg-[#F4F7FB] border border-slate-100 flex items-center justify-between cursor-pointer hover:border-[#BADDF2] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#101214]">Library Borrowing</h4>
                  <p className="text-[11px] text-slate-500">{issuedBooks.length} Books issued (1 Overdue)</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#263D88]">Manage →</span>
            </div>
          </div>
        </section>

        {/* Preferences & Settings */}
        <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-[#101214] uppercase tracking-wider">
            Campus App Preferences
          </h2>

          <div className="space-y-3">
            {/* Voice guidance */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-[#263D88]" />
                <div>
                  <h4 className="text-xs font-bold text-[#101214]">3D Voice Guidance</h4>
                  <p className="text-[11px] text-slate-400">Audio navigation turn prompts</p>
                </div>
              </div>
              <button
                onClick={() => setIsVoiceGuidanceEnabled(!isVoiceGuidanceEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  isVoiceGuidanceEnabled ? 'bg-[#263D88]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    isVoiceGuidanceEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between py-1 border-t border-slate-100">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-[#53AADF]" />
                <div>
                  <h4 className="text-xs font-bold text-[#101214]">Campus Announcements</h4>
                  <p className="text-[11px] text-slate-400">Class alerts, bus timing updates</p>
                </div>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  notificationsEnabled ? 'bg-[#263D88]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notificationsEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Sign Out Action Button */}
        <button
          onClick={logout}
          className="w-full py-3.5 px-4 rounded-2xl bg-white border border-red-200 text-[#FF0000] font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-50 transition-colors shadow-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out from Campus Connect</span>
        </button>

        <div className="text-center text-[10px] text-slate-400 pb-4">
          Campus Connect App Version 2.4.0 • Built with Google OAuth & 3D Navigation
        </div>
      </main>
    </div>
  );
};
