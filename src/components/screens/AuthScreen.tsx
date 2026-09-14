import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CampusLogo } from '../common/CampusLogo';
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Shield,
  Sparkles,
  UserCheck,
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const {
    loginWithGoogle,
    loginWithCredentials,
    isLoggingIn,
    authError,
    clearAuthError,
    isFirebaseConfigured,
  } = useApp();

  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [showFirebaseInfo, setShowFirebaseInfo] = useState<boolean>(false);

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginWithCredentials(
      identifier || 'rohit.sharma@university.edu',
      name || undefined
    );
  };

  const handleDemoSignIn = (firstTime: boolean = false) => {
    if (firstTime) {
      loginWithCredentials('new.student@university.edu', 'Aarav Patel');
      setTimeout(() => {
        const userStr = localStorage.getItem('campus_connect_user');
        if (userStr) {
          const u = JSON.parse(userStr);
          u.profileCompleted = false;
          u.avatar = '';
          localStorage.setItem('campus_connect_user', JSON.stringify(u));
          window.location.reload();
        }
      }, 100);
    } else {
      loginWithCredentials('rohit.sharma@university.edu', 'Rohit Sharma');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#263D88] via-[#1E2F6B] to-[#101214] text-white flex flex-col justify-between p-4 sm:p-6 select-none font-['Poppins',sans-serif]">
      {/* Top Branding Section */}
      <div className="pt-4 sm:pt-8 flex flex-col items-center text-center">
        <CampusLogo size="lg" layout="vertical" showTagline theme="white" />
        <div className="mt-3 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-blue-100 font-medium inline-flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-[#BADDF2]" />
          <span>Student Smart Campus Companion</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md mx-auto my-4 sm:my-6 bg-white text-[#101214] rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/40 border border-white/20">
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#BADDF2]/40 text-[#263D88] mb-2.5">
            <GraduationCap className="w-6 h-6 text-[#263D88]" />
          </div>
          <h2 className="text-xl font-bold text-[#263D88] tracking-tight">
            {isSignUp ? 'Create Student Account' : 'Student Login'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your timetable, navigation, shuttle bus, library & cafeteria
          </p>
        </div>

        {/* Error Notification Banner */}
        {authError && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start justify-between gap-2 animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Error</p>
                <p className="text-[11px] text-red-600 mt-0.5">{authError}</p>
              </div>
            </div>
            <button
              onClick={clearAuthError}
              className="text-red-400 hover:text-red-700 p-0.5 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Google Student Sign-In */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => loginWithGoogle()}
            disabled={isLoggingIn}
            className="w-full py-3 px-4 rounded-2xl bg-white border border-[#dadce0] hover:bg-[#f8fafd] hover:border-[#53AADF] hover:shadow-sm active:bg-[#f1f3f4] text-[#3c4043] font-semibold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-xs cursor-pointer"
            title="Sign in with Student Google Account"
          >
            {isLoggingIn ? (
              <div className="w-5 h-5 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span className="font-medium text-[13px] sm:text-sm text-slate-800">
              {isLoggingIn ? 'Connecting to Student Account...' : 'Continue with Google'}
            </span>
          </button>

          {/* Firebase Configuration Indicator */}
          <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isFirebaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className="font-medium text-[10px]">
                {isFirebaseConfigured ? 'Firebase Auth Connected' : 'Institutional Sign-In Ready'}
              </span>
            </span>

            <button
              type="button"
              onClick={() => setShowFirebaseInfo(!showFirebaseInfo)}
              className="text-[#263D88] hover:underline font-medium inline-flex items-center gap-0.5 text-[10px] cursor-pointer"
            >
              <span>Setup Info</span>
              {showFirebaseInfo ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>

          {/* Expandable Firebase & Google Setup Details */}
          {showFirebaseInfo && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-[#263D88] font-bold">
                <span className="inline-flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-[#53AADF]" />
                  Student Portal Authentication
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                  Firebase & OAuth
                </span>
              </div>
              <p className="text-[10.5px] leading-relaxed text-slate-600">
                Sign-in is enabled via standard campus credentials and optional Firebase / Google OAuth integration.
              </p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
            or student credentials
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        {/* Student ID / Email & Password Form */}
        <form onSubmit={handleStudentSubmit} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Rohit Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#263D88] focus:border-transparent transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Student ID or Campus Email
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="e.g. 20240582 or rohit.sharma@university.edu"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#263D88] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#263D88] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-1 py-3 px-4 rounded-xl bg-[#263D88] text-white font-semibold text-xs hover:bg-[#1E2F6B] shadow-md shadow-[#263D88]/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isSignUp ? 'Create Student Account' : 'Student Login'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#53AADF]" />
          </button>
        </form>

        {/* Quick Demo Access Buttons - Student Only */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Student Demo
            </span>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#263D88] font-semibold text-xs hover:underline cursor-pointer"
            >
              {isSignUp ? 'Sign In Instead' : 'Register New'}
            </button>
          </div>

          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => handleDemoSignIn(false)}
              className="w-full py-2 px-3 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 rounded-xl text-xs font-medium text-[#263D88] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-[#263D88]" />
              <span>Quick Student Login (Rohit Sharma - BCA)</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSignIn(true)}
              className="w-full py-1.5 px-3 text-[11px] text-slate-600 hover:text-[#263D88] font-medium hover:underline inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Test First-Time Login (Profile Setup Flow)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-[11px] text-blue-200/60 pb-2">
        Campus Connect • University Smart Campus Companion for Students
      </div>
    </div>
  );
};
