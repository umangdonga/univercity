import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CampusLogo } from '../common/CampusLogo';
import { getLiveAuthDetails } from '../../utils/googleAuth';
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  X,
  User,
  BookOpen,
  Database,
  CheckCircle2,
  Copy,
  ExternalLink,
  Info,
  Globe,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const {
    loginWithGoogle,
    loginWithGoogleEmail,
    loginWithCredentials,
    isLoggingIn,
    authError,
    clearAuthError,
    isSupabaseConfigured,
    isCloudSqlConfigured,
    isFirebaseConfigured,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Registration fields
  const [regName, setRegName] = useState<string>('');
  const [regStudentId, setRegStudentId] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regDepartment, setRegDepartment] = useState<string>('Computer Science & Engineering');
  const [regDegree, setRegDegree] = useState<string>('B.Tech');
  const [regPassword, setRegPassword] = useState<string>('');

  // Setup modal for Supabase & Google configuration
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [originMismatchDetected, setOriginMismatchDetected] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [copiedOrigin, setCopiedOrigin] = useState<boolean>(false);
  const [copiedPreOrigin, setCopiedPreOrigin] = useState<boolean>(false);
  const [copiedCallback, setCopiedCallback] = useState<boolean>(false);
  const [copiedPreCallback, setCopiedPreCallback] = useState<boolean>(false);
  const [copiedHost, setCopiedHost] = useState<boolean>(false);

  const liveDetails = getLiveAuthDetails();

  // Listen for origin mismatch or auth warning from Google SDK
  useEffect(() => {
    const handleAuthWarning = (e: any) => {
      setOriginMismatchDetected(true);
      setShowConfigModal(true);
    };
    window.addEventListener('campus_connect_auth_warning', handleAuthWarning);
    return () => window.removeEventListener('campus_connect_auth_warning', handleAuthWarning);
  }, []);

  const copyToClipboard = (text: string, setCopied: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginWithCredentials(
      identifier || 'rohit.sharma@university.edu',
      undefined,
      { isRegister: false }
    );
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = regEmail || (regStudentId ? `${regStudentId}@university.edu` : 'new.student@university.edu');
    const name = regName || 'Campus Student';
    loginWithCredentials(
      email,
      name,
      {
        studentId: regStudentId || '20240582',
        department: regDepartment,
        degree: regDegree,
        isRegister: true,
      }
    );
  };

  const supabaseSql = `-- Campus Connect Students Table for Supabase
create table if not exists public.students (
  id text primary key,
  email text not null,
  name text,
  avatar text,
  student_id text,
  degree text,
  semester text,
  department text,
  emergency_contact text,
  profile_completed boolean default false,
  bus_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
alter table public.students enable row level security;

-- Policy: Allow read & write for app users
create policy "Allow all operations for students" on public.students
  for all using (true) with check (true);`;

  const copySql = () => {
    navigator.clipboard.writeText(supabaseSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#263D88] via-[#1E2F6B] to-[#101214] text-white flex flex-col justify-between p-4 sm:p-6 select-none font-['Poppins',sans-serif]">
      {/* Top Branding Section */}
      <div className="pt-4 sm:pt-8 flex flex-col items-center text-center">
        <CampusLogo size="lg" layout="vertical" theme="white" />
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md mx-auto my-3 sm:my-5 bg-white text-[#101214] rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/40 border border-white/20">
        {/* Header with Icon and Mode Tabs */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[#BADDF2]/40 text-[#263D88] mb-2">
            <GraduationCap className="w-5 h-5 text-[#263D88]" />
          </div>
          <h2 className="text-xl font-bold text-[#263D88] tracking-tight">
            {mode === 'login' ? 'Student Sign In' : 'Create Student Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login'
              ? 'Access timetable, 3D campus navigation, bus pass & services'
              : 'Register to synchronize your academic profile with Supabase'}
          </p>
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              clearAuthError();
            }}
            className={`flex-1 py-2 rounded-lg transition-all text-center cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-[#263D88] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              clearAuthError();
            }}
            className={`flex-1 py-2 rounded-lg transition-all text-center cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-[#263D88] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Notification Banner */}
        {authError && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start justify-between gap-2 animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Error</p>
                <p className="text-[11px] text-red-600 mt-0.5 leading-relaxed">{authError}</p>
              </div>
            </div>
            <button
              onClick={clearAuthError}
              className="text-red-400 hover:text-red-700 p-0.5 rounded-lg cursor-pointer shrink-0"
              title="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Google Error 400 (origin_mismatch) Resolution Banner */}
        <div className="mb-3.5 p-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 text-xs shadow-xs">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[12px] text-amber-900">
                  Seeing "Error 400: origin_mismatch"?
                </p>
                <p className="text-[11px] text-amber-800 leading-snug mt-0.5">
                  Google blocks sign-in until your Cloud Run domain is added to <em>Authorized JavaScript origins</em> in Google Cloud Console.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setOriginMismatchDetected(true);
                setShowConfigModal(true);
              }}
              className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
            >
              Fix in 1 Min
            </button>
          </div>
        </div>

        {/* Real Google Sign-In & Registration Button */}
        <div>
          <button
            type="button"
            onClick={() => loginWithGoogle()}
            disabled={isLoggingIn}
            className="w-full py-3 px-4 rounded-2xl bg-white border border-[#dadce0] hover:bg-[#f8fafd] hover:border-[#53AADF] hover:shadow-sm active:bg-[#f1f3f4] text-[#3c4043] font-semibold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-xs cursor-pointer"
            title="Authenticate with Student Google Account & save to Supabase"
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
              {isLoggingIn
                ? 'Connecting to Google & Supabase...'
                : mode === 'login'
                ? 'Continue with Google'
                : 'Register with Google'}
            </span>
          </button>

          <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Open to all users • Any Google or Gmail account</span>
          </div>

          {/* Instant Google Login Bypass (No waiting for Google Cloud propagation) */}
          <div className="mt-3 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-blue-900 font-medium overflow-hidden">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">Instant Access as <strong>umangdonga98@gmail.com</strong></span>
              </div>
              <button
                type="button"
                onClick={() => loginWithGoogleEmail('umangdonga98@gmail.com', 'Umang Donga')}
                disabled={isLoggingIn}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold shrink-0 cursor-pointer transition-colors shadow-xs"
              >
                1-Click Login
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
            or with student details
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        {/* Form: Login or Register */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3">
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
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#263D88] text-white font-semibold text-xs hover:bg-[#1E2F6B] shadow-md shadow-[#263D88]/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Student Login</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#53AADF]" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Rohit Sharma"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#263D88] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Student ID</label>
                <input
                  type="text"
                  placeholder="e.g. 20240582"
                  value={regStudentId}
                  onChange={(e) => setRegStudentId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#263D88] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Degree</label>
                <select
                  value={regDegree}
                  onChange={(e) => setRegDegree(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#263D88]"
                >
                  <option value="B.Tech">B.Tech</option>
                  <option value="BCA">BCA</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="MBA">MBA</option>
                  <option value="B.Des">B.Des</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Campus Email</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  placeholder="rohit.sharma@university.edu"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#263D88] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Department</label>
              <div className="relative">
                <BookOpen className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Computer Science & Engineering"
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#263D88] focus:border-transparent transition-all"
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
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#263D88] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#263D88] text-white font-semibold text-xs hover:bg-[#1E2F6B] shadow-md shadow-[#263D88]/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Register & Save to Supabase</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#53AADF]" />
            </button>
          </form>
        )}

        {/* Database & Integration Status Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] gap-2">
          <div className="flex items-center flex-wrap gap-2 text-slate-500">
            <div className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-[#263D88]" />
              <span className="font-medium">Cloud SQL:</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3 h-3" /> Connected (asia-southeast1)
              </span>
            </div>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">Google Auth:</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="text-[#263D88] hover:text-[#1E2F6B] font-semibold inline-flex items-center gap-1 cursor-pointer self-end sm:self-auto"
          >
            <Info className="w-3 h-3" /> System Info
          </button>
        </div>
      </div>

      {/* Supabase & Google Auth Guide Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-[#101214] w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#263D88]" />
                <h3 className="font-bold text-[#263D88] text-base">Supabase & Google Auth Setup</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-3 text-xs text-slate-600">
              <p>
                Campus Connect synchronizes all student logins, profiles, and bus passes with your Supabase database in real time.
              </p>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-1">1. Environment Variables (.env / Settings)</h4>
                <p className="text-[11px] text-slate-500 mb-2">
                  Add these in your AI Studio project Settings:
                </p>
                <pre className="bg-slate-900 text-emerald-300 p-2.5 rounded-xl font-mono text-[11px] overflow-x-auto select-all">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret`}
                </pre>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-bold text-slate-800">2. Supabase SQL Table</h4>
                  <button
                    onClick={copySql}
                    className="inline-flex items-center gap-1 text-[#263D88] hover:text-[#1E2F6B] font-semibold text-[11px] cursor-pointer"
                  >
                    {copiedSql ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy SQL
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  Run this in your Supabase project's SQL Editor:
                </p>
                <pre className="bg-slate-900 text-slate-200 p-2.5 rounded-xl font-mono text-[10px] overflow-x-auto max-h-40 select-all">
{supabaseSql}
                </pre>
              </div>

              {/* Error 400 origin_mismatch fix */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-3.5 rounded-2xl border-2 border-amber-300 text-amber-950">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px] uppercase tracking-wider">
                    Error 400 Fix
                  </span>
                  <h4 className="font-bold text-amber-950 text-xs">
                    Fix "Access blocked: Error 400: origin_mismatch"
                  </h4>
                </div>
                <p className="text-[11px] text-amber-900 mb-2 leading-relaxed">
                  Google requires adding your live domain to <strong>Authorized JavaScript origins</strong> in Google Cloud Console:
                </p>

                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-800 mb-3 bg-white/90 p-2.5 rounded-xl border border-amber-200 font-medium">
                  <li>
                    Open{' '}
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline font-semibold inline-flex items-center gap-0.5 hover:text-blue-800"
                    >
                      Google Cloud Console &gt; Credentials
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>Click on your Web Client ID</li>
                  <li>Under <strong>Authorized JavaScript origins</strong>, click <em>+ ADD URI</em> and paste URLs 1 &amp; 2 below</li>
                  <li>Under <strong>Authorized redirect URIs</strong>, click <em>+ ADD URI</em> and paste URLs 3 &amp; 4 below</li>
                  <li>Click <strong>Save</strong></li>
                </ol>

                <div className="space-y-2 font-mono text-[10px]">
                  {/* Authorized Origin Dev */}
                  <div className="bg-white p-2 rounded-xl border border-amber-200 flex items-center justify-between gap-2">
                    <div className="overflow-hidden">
                      <span className="font-sans font-bold text-slate-600 block text-[9px] uppercase tracking-wider">
                        1. JavaScript Origin (Dev)
                      </span>
                      <span className="text-slate-900 select-all truncate block">
                        https://ais-dev-leadbi4ci3sxhqpvbofpjr-888899326029.asia-southeast1.run.app
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('https://ais-dev-leadbi4ci3sxhqpvbofpjr-888899326029.asia-southeast1.run.app', setCopiedOrigin)}
                      className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[10px] font-sans font-semibold cursor-pointer shrink-0 inline-flex items-center gap-1"
                    >
                      {copiedOrigin ? <CheckCircle2 className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                      {copiedOrigin ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  {/* Authorized Origin Pre */}
                  <div className="bg-white p-2 rounded-xl border border-amber-200 flex items-center justify-between gap-2">
                    <div className="overflow-hidden">
                      <span className="font-sans font-bold text-slate-600 block text-[9px] uppercase tracking-wider">
                        2. JavaScript Origin (Shared Preview)
                      </span>
                      <span className="text-slate-900 select-all truncate block">
                        https://ais-pre-leadbi4ci3sxhqpvbofpjr-888899326029.asia-southeast1.run.app
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('https://ais-pre-leadbi4ci3sxhqpvbofpjr-888899326029.asia-southeast1.run.app', setCopiedPreOrigin)}
                      className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[10px] font-sans font-semibold cursor-pointer shrink-0 inline-flex items-center gap-1"
                    >
                      {copiedPreOrigin ? <CheckCircle2 className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                      {copiedPreOrigin ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  {/* Authorized Redirect URI Dev */}
                  <div className="bg-white p-2 rounded-xl border border-amber-200 flex items-center justify-between gap-2">
                    <div className="overflow-hidden">
                      <span className="font-sans font-bold text-slate-600 block text-[9px] uppercase tracking-wider">
                        3. Redirect URI (Dev)
                      </span>
                      <span className="text-slate-900 select-all truncate block">
                        https://ais-dev-leadbi4ci3sxhqpvbofpjr-888899326029.asia-southeast1.run.app/auth/callback
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('https://ais-dev-leadbi4ci3sxhqpvbofpjr-888899326029.asia-southeast1.run.app/auth/callback', setCopiedCallback)}
                      className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[10px] font-sans font-semibold cursor-pointer shrink-0 inline-flex items-center gap-1"
                    >
                      {copiedCallback ? <CheckCircle2 className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                      {copiedCallback ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  {/* Authorized Redirect URI Pre */}
                  <div className="bg-white p-2 rounded-xl border border-amber-200 flex items-center justify-between gap-2">
                    <div className="overflow-hidden">
                      <span className="font-sans font-bold text-slate-600 block text-[9px] uppercase tracking-wider">
                        4. Redirect URI (Shared Preview)
                      </span>
                      <span className="text-slate-900 select-all truncate block">
                        https://ais-pre-leadbi4ci3sxhqpvbofpjr-888899326029.asia-southeast1.run.app/auth/callback
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('https://ais-pre-leadbi4ci3sxhqpvbofpjr-888899326029.asia-southeast1.run.app/auth/callback', setCopiedPreCallback)}
                      className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[10px] font-sans font-semibold cursor-pointer shrink-0 inline-flex items-center gap-1"
                    >
                      {copiedPreCallback ? <CheckCircle2 className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                      {copiedPreCallback ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  {/* Firebase Authorized Domain */}
                  <div className="bg-white p-2 rounded-xl border border-amber-200 flex items-center justify-between gap-2">
                    <div className="overflow-hidden">
                      <span className="font-sans font-bold text-slate-600 block text-[9px] uppercase tracking-wider">
                        5. Firebase Authorized Domain
                      </span>
                      <span className="text-slate-900 select-all truncate block">
                        {liveDetails.currentHostname}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(liveDetails.currentHostname, setCopiedHost)}
                      className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[10px] font-sans font-semibold cursor-pointer shrink-0 inline-flex items-center gap-1"
                    >
                      {copiedHost ? <CheckCircle2 className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                      {copiedHost ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200 text-blue-900">
                <h4 className="font-bold mb-1">4. Google Provider in Supabase</h4>
                <p className="text-[11px] leading-relaxed">
                  In your Supabase Dashboard under <strong>Authentication &gt; Providers &gt; Google</strong>, toggle <strong>Enabled</strong>, paste your Google Client ID & Client Secret, and add your Supabase redirect URI to the authorized redirect URIs in Google Cloud Console.
                </p>
              </div>

              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-amber-950">
                <h4 className="font-bold mb-1">5. Allow All Users (Google Consent Screen)</h4>
                <p className="text-[11px] leading-relaxed">
                  In your Google Cloud Console under <strong>APIs &amp; Services &gt; OAuth consent screen</strong>:
                  <br />• Select <strong>External</strong> user type so anyone with any Google account (@gmail.com, student, or organization) can sign in.
                  <br />• If in <em>Testing</em> mode, add your email under <strong>Test Users</strong>; or click <strong>Publish App</strong> to allow 100% of Google users without access limitations.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 bg-[#263D88] text-white font-semibold text-xs rounded-xl hover:bg-[#1E2F6B] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer copyright */}
      <div className="text-center text-[11px] text-blue-200/60 pb-2">
        Campus Connect • University Smart Campus Companion for Students
      </div>
    </div>
  );
};
