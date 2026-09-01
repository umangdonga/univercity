import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { CampusLogo } from '../common/CampusLogo';
import { GraduationCap, Briefcase, Compass, ShieldCheck, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { loginWithGoogle, loginWithCredentials, loginAsGuest, isLoggingIn } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');

  const rolesConfig: {
    id: UserRole;
    title: string;
    description: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      id: 'student',
      title: 'Student',
      description: 'Access courses, grades, and campus life events in one place.',
      icon: GraduationCap,
    },
    {
      id: 'faculty',
      title: 'Faculty',
      description: 'Manage classes, academic tools, and student communications.',
      icon: Briefcase,
    },
    {
      id: 'guest',
      title: 'Guest',
      description: 'Explore campus map, visitor appointments, and facility finders.',
      icon: Compass,
    },
  ];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginWithCredentials(email || `${selectedRole}@university.edu`, selectedRole, name || undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#263D88] via-[#1E2F6B] to-[#101214] text-white flex flex-col justify-between p-4 sm:p-6 select-none font-['Poppins',sans-serif]">
      {/* Top Branding Section */}
      <div className="pt-6 sm:pt-10 flex flex-col items-center text-center">
        <CampusLogo size="lg" layout="vertical" showTagline theme="white" />
        <div className="mt-4 px-4 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-blue-100 font-medium">
          Navigate your campus • Access everything in one place
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md mx-auto my-6 bg-white text-[#101214] rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/40 border border-white/20">
        <div className="text-center mb-5">
          <h2 className="text-xl font-bold text-[#263D88] tracking-tight">
            {isSignUp ? 'Create Campus Connect Account' : 'Welcome to CAMPUS CONNECT'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Please select your role to continue
          </p>
        </div>

        {/* Role Selector Tabs (Student, Faculty, Guest) */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-[#F4F7FB] rounded-2xl mb-5 border border-slate-200/80">
          {rolesConfig.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`py-2.5 px-2 rounded-xl flex flex-col items-center text-center transition-all ${
                  isSelected
                    ? 'bg-[#263D88] text-white shadow-md font-bold scale-[1.02]'
                    : 'text-slate-600 hover:text-[#263D88] font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-[#BADDF2]' : 'text-slate-400'}`} />
                <span className="text-xs">{role.title}</span>
              </button>
            );
          })}
        </div>

        {/* Role Description Callout */}
        <div className="mb-5 p-3 rounded-xl bg-[#BADDF2]/25 border border-[#BADDF2]/50 text-[11px] text-[#263D88] text-center font-medium">
          {rolesConfig.find((r) => r.id === selectedRole)?.description}
        </div>

        {/* 1. Real Google OAuth Button */}
        <button
          type="button"
          onClick={loginWithGoogle}
          disabled={isLoggingIn}
          className="w-full py-3.5 px-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-[#53AADF] hover:bg-slate-50 text-[#101214] font-semibold text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {isLoggingIn ? (
            <div className="w-5 h-5 border-2 border-[#263D88] border-t-transparent rounded-full animate-spin" />
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
          <span>{isLoggingIn ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            or use email
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#263D88] focus:border-transparent transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Campus Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                placeholder="e.g. rohit.sharma@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#263D88] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#263D88] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#263D88] text-white font-semibold text-sm hover:bg-[#1E2F6B] shadow-md shadow-[#263D88]/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 text-[#53AADF]" />
          </button>
        </form>

        {/* Guest Access & Switch Mode */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#263D88] font-semibold hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>

          <button
            type="button"
            onClick={loginAsGuest}
            className="text-slate-500 font-medium hover:text-[#263D88] hover:underline"
          >
            Sign in as Guest →
          </button>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-[11px] text-blue-200/60 pb-2">
        Campus Connect • University Smart Campus Navigation & Services
      </div>
    </div>
  );
};
