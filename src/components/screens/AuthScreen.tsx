import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { CampusLogo } from '../common/CampusLogo';
import {
  GraduationCap,
  Briefcase,
  Compass,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Shield,
  Sparkles,
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const {
    loginWithGoogle,
    loginWithCredentials,
    loginAsGuest,
    isLoggingIn,
    authError,
    clearAuthError,
    isFirebaseConfigured,
  } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [showFirebaseInfo, setShowFirebaseInfo] = useState<boolean>(false);

  const rolesConfig: {
    id: UserRole;
    title: string;
    description: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      id: 'student',
      title: 'Student',
      description: 'Access courses, timetable, cafeteria, and digital bus passes.',
      icon: GraduationCap,
    },
    {
      id: 'faculty',
      title: 'Faculty',
      description: 'Manage teaching schedule, faculty parking, and classroom navigation.',
      icon: Briefcase,
    },
    {
      id: 'admin',
      title: 'Admin',
      description: 'Review bus pass applications, monitor facilities, and broadcast notices.',
      icon: Shield,
    },
    {
      id: 'guest',
      title: 'Guest',
      description: 'Explore campus 3D maps, visitor appointments, and university events (view-only).',
      icon: Compass,
    },
  ];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginWithCredentials(
      email || `${selectedRole}@university.edu`,
      selectedRole,
      name || undefined
    );
  };

  const handleDemoSignIn = (role: UserRole, firstTime: boolean = false) => {
    if (role === 'student') {
      if (firstTime) {
        loginWithCredentials('new.student@university.edu', 'student', 'Aarav Patel');
        // mark profile incomplete
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
        loginWithCredentials('rohit.sharma@university.edu', 'student', 'Rohit Sharma');
      }
    } else if (role === 'faculty') {
      loginWithCredentials('dr.verma@university.edu', 'faculty', 'Dr. Rajesh Verma');
    } else if (role === 'admin') {
      loginWithCredentials('admin.menon@university.edu', 'admin', 'Dr. Arvind Menon');
    } else {
      loginAsGuest();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#263D88] via-[#1E2F6B] to-[#101214] text-white flex flex-col justify-between p-4 sm:p-6 select-none font-['Poppins',sans-serif]">
      {/* Top Branding Section */}
      <div className="pt-4 sm:pt-8 flex flex-col items-center text-center">
        <CampusLogo size="lg" layout="vertical" showTagline theme="white" />
        <div className="mt-3 px-4 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-blue-100 font-medium inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#BADDF2]" />
          <span>University Smart Campus Navigation & Services</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md mx-auto my-4 sm:my-6 bg-white text-[#101214] rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/40 border border-white/20">
        <div className="text-center mb-5">
          <h2 className="text-xl font-bold text-[#263D88] tracking-tight">
            {isSignUp ? 'Create Campus Connect Account' : 'Welcome to CAMPUS CONNECT'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in with your Google account or institutional email
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
              className="text-red-400 hover:text-red-700 p-0.5 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Role Selector Tabs (Student, Faculty, Admin, Guest) */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 px-1">
            Select Your Campus Role
          </label>
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#F4F7FB] rounded-2xl border border-slate-200/80">
            {rolesConfig.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`py-2 px-1 rounded-xl flex flex-col items-center text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#263D88] text-white shadow-md font-bold scale-[1.02]'
                      : 'text-slate-600 hover:text-[#263D88] font-medium'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 mb-1 ${
                      isSelected ? 'text-[#BADDF2]' : 'text-slate-400'
                    }`}
                  />
                  <span className="text-[11px]">{role.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. Official Google Sign-In Button (Standard Google Branding Guidelines) */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => loginWithGoogle(selectedRole)}
            disabled={isLoggingIn}
            className="w-full py-3 px-4 rounded-2xl bg-white border border-[#dadce0] hover:bg-[#f8fafd] hover:border-[#53AADF] hover:shadow-sm active:bg-[#f1f3f4] text-[#3c4043] font-semibold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-xs cursor-pointer"
            title={`Sign in with Google as ${selectedRole.toUpperCase()}`}
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
              {isLoggingIn ? 'Signing in with Google...' : 'Sign in with Google'}
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
                {isFirebaseConfigured ? 'Firebase Auth Connected' : 'Google Sign-In Ready'}
              </span>
            </span>

            <button
              type="button"
              onClick={() => setShowFirebaseInfo(!showFirebaseInfo)}
              className="text-[#263D88] hover:underline font-medium inline-flex items-center gap-0.5 text-[10px]"
            >
              <span>Setup Guide</span>
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
                  Google Authentication Setup
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                  Firebase & OAuth
                </span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[10.5px] leading-relaxed text-slate-600">
                <li>
                  <strong>Enable Google Provider:</strong> In{' '}
                  <span className="text-[#263D88] font-mono">Firebase Console &gt; Authentication &gt; Sign-in method</span>, enable <strong>Google</strong>.
                </li>
                <li>
                  <strong>Authorized Domains:</strong> Add your current host (
                  <code className="bg-slate-200 px-1 rounded text-[10px]">
                    {window.location.hostname}
                  </code>
                  ) in Firebase Authentication settings.
                </li>
                <li>
                  <strong>Client Keys:</strong> Add <code className="text-slate-800 font-mono">VITE_FIREBASE_API_KEY</code>,{' '}
                  <code className="text-slate-800 font-mono">VITE_FIREBASE_AUTH_DOMAIN</code>, and{' '}
                  <code className="text-slate-800 font-mono">VITE_FIREBASE_PROJECT_ID</code> to your environment.
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
            or use email & password
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Rohit Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#263D88] focus:border-transparent transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Campus Email</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="email"
                placeholder="e.g. rohit.sharma@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#263D88] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#263D88] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-1 py-2.5 px-4 rounded-xl bg-[#263D88] text-white font-semibold text-xs hover:bg-[#1E2F6B] shadow-md shadow-[#263D88]/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>{isSignUp ? 'Create Account' : 'Sign In with Email'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#53AADF]" />
          </button>
        </form>

        {/* Quick Demo Access Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              1-Click Demo Profiles
            </span>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#263D88] font-semibold text-xs hover:underline"
            >
              {isSignUp ? 'Sign In Instead' : 'Register New'}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => handleDemoSignIn('student')}
              className="py-1.5 px-1 bg-slate-50 hover:bg-[#BADDF2]/30 border border-slate-200 rounded-lg text-[10.5px] font-medium text-slate-700 hover:text-[#263D88] transition-colors flex flex-col items-center justify-center gap-0.5 cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#53AADF]" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoSignIn('faculty')}
              className="py-1.5 px-1 bg-slate-50 hover:bg-[#BADDF2]/30 border border-slate-200 rounded-lg text-[10.5px] font-medium text-slate-700 hover:text-[#263D88] transition-colors flex flex-col items-center justify-center gap-0.5 cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#263D88]" />
              <span>Faculty</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoSignIn('admin')}
              className="py-1.5 px-1 bg-slate-50 hover:bg-[#BADDF2]/30 border border-slate-200 rounded-lg text-[10.5px] font-medium text-slate-700 hover:text-[#263D88] transition-colors flex flex-col items-center justify-center gap-0.5 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoSignIn('guest')}
              className="py-1.5 px-1 bg-slate-50 hover:bg-[#BADDF2]/30 border border-slate-200 rounded-lg text-[10.5px] font-medium text-slate-700 hover:text-[#263D88] transition-colors flex flex-col items-center justify-center gap-0.5 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>Guest</span>
            </button>
          </div>

          <div className="mt-2 text-center">
            <button
              type="button"
              onClick={() => handleDemoSignIn('student', true)}
              className="text-[11px] text-[#263D88] hover:text-[#1E2F6B] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Test First-Time Login (Mandatory Profile Setup Flow)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-[11px] text-blue-200/60 pb-2">
        Campus Connect • University Smart Campus Navigation & Services
      </div>
    </div>
  );
};
