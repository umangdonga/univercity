import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfileData } from '../../types';
import {
  Camera,
  Upload,
  User,
  GraduationCap,
  Calendar,
  Phone,
  Bus,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  LogOut,
  Sparkles,
} from 'lucide-react';

export const ProfileCompletionScreen: React.FC = () => {
  const { user, completeUserProfile, showToast, logout } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-filled from Google
  const [fullName, setFullName] = useState<string>(user.name || '');
  const [email] = useState<string>(user.email || 'student@university.edu');
  const [photo, setPhoto] = useState<string>(
    user.photo ||
      user.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  );

  // University Profile Fields
  const [branchCourse, setBranchCourse] = useState<string>(
    user.branchCourse || user.degree || 'B.Tech'
  );
  const [enrollmentNumber, setEnrollmentNumber] = useState<string>(
    user.enrollmentNumber || (user.studentId && user.studentId !== '20240582' ? user.studentId : '')
  );
  const [phone, setPhone] = useState<string>(user.contact && user.contact !== '+91 98765 43210' ? user.contact : '');
  const [dateOfBirth, setDateOfBirth] = useState<string>(user.dob || '');
  const [gender, setGender] = useState<string>(user.gender || '');
  const [busIdNumber, setBusIdNumber] = useState<string>(user.busIdNumber || '');

  const [formError, setFormError] = useState<string>('');
  const [photoError, setPhotoError] = useState<string>('');

  const branchOptions = [
    'BCA (Bachelor of Computer Applications)',
    'B.Tech (Computer Science & Engineering)',
    'B.Tech (Artificial Intelligence & Data Science)',
    'B.Tech (Information Technology)',
    'B.Tech (Electronics & Communication)',
    'MCA (Master of Computer Applications)',
    'M.Des (Master of Design)',
    'MBA (Master of Business Administration)',
    'BBA (Bachelor of Business Administration)',
    'B.Com (Honours)',
    'M.Tech (Software Engineering)',
  ];

  const genderOptions = [
    'Male',
    'Female',
    'Other',
    'Prefer not to say',
  ];

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setPhotoError('Please select a valid image file (PNG, JPG, WEBP).');
        return;
      }
      setPhotoError('');
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!photo || photo.trim() === '') {
      setPhotoError('Profile photo is required.');
      showToast('Please add a profile photo.');
      return;
    }

    if (!fullName.trim()) {
      setFormError('Full Name is required.');
      return;
    }

    if (!branchCourse) {
      setFormError('Please select your Branch / Course.');
      return;
    }

    if (!enrollmentNumber.trim()) {
      setFormError('Enrollment Number is required.');
      return;
    }

    if (!phone.trim()) {
      setFormError('Phone Number is required.');
      return;
    }

    if (!dateOfBirth) {
      setFormError('Date of Birth is required.');
      return;
    }

    if (!gender) {
      setFormError('Please select your Gender.');
      return;
    }

    setFormError('');
    setPhotoError('');

    const profileData: UserProfileData = {
      fullName: fullName.trim(),
      branchCourse,
      enrollmentNumber: enrollmentNumber.trim(),
      email,
      profilePhoto: photo,
      phone: phone.trim(),
      dateOfBirth,
      gender,
      busIdNumber: busIdNumber.trim() || undefined,
      // backwards compatibility mappings
      studentId: enrollmentNumber.trim(),
      course: branchCourse,
      department: branchCourse,
    };

    completeUserProfile(profileData, photo);
  };

  return (
    <div
      id="create-profile-screen"
      className="w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden font-['Poppins',sans-serif] my-3 sm:my-6"
    >
      {/* Header Section */}
        <div className="bg-[#263D88] text-white p-6 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#53AADF]/30 text-[#BADDF2] uppercase tracking-wider border border-[#53AADF]/30 backdrop-blur-xs">
              <GraduationCap className="w-3.5 h-3.5 text-[#53AADF]" />
              Student Registration
            </span>

            <button
              onClick={logout}
              type="button"
              className="text-xs text-blue-200 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              title="Sign out or switch Google account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch Account</span>
            </button>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white">Create Your Profile</h1>
          <p className="text-xs text-blue-100/90 mt-1">Complete your profile to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Circular Profile Photo at Top */}
          <div className="flex flex-col items-center justify-center pt-1 pb-2">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-3 border-[#263D88] shadow-md flex items-center justify-center">
                {photo ? (
                  <img
                    src={photo}
                    alt={fullName || 'Student Avatar'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-10 h-10 text-slate-400" />
                )}
              </div>

              {/* Camera Change Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-[#263D88] hover:bg-[#53AADF] text-white rounded-full shadow-lg border-2 border-white transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="Change or upload photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Google-fetched info label */}
            <div className="mt-2.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Google photo loaded
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-[#263D88] hover:text-[#53AADF] underline cursor-pointer"
              >
                Change photo
              </button>
            </div>

            {/* Sample avatars preset quick picks */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400">Or pick:</span>
              {sampleAvatars.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPhoto(url);
                    setPhotoError('');
                  }}
                  className={`w-5 h-5 rounded-full overflow-hidden border transition-all cursor-pointer ${
                    photo === url ? 'ring-2 ring-[#263D88] scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {photoError && (
              <p className="text-xs font-semibold text-red-500 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {photoError}
              </p>
            )}
          </div>

          {/* Form Error Banner */}
          {formError && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Google Account Summary Badge */}
          <div className="bg-[#BADDF2]/20 border border-[#BADDF2] rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
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
              <div>
                <p className="text-xs font-bold text-[#101214]">Connected with Google</p>
                <p className="text-[11px] text-slate-500">{email}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Verified
            </span>
          </div>

          {/* Form Fields Grid */}
          <div className="space-y-4">
            {/* 1. Full Name (Auto-filled from Google, Editable, Required) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] font-medium text-slate-400">Auto-filled from Google</span>
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rohit Sharma"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F7FB] text-xs font-medium text-[#101214] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#263D88] transition-all"
              />
            </div>

            {/* 2. Email (Auto-filled from Google, Non-editable, Required) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Email</span>
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] font-semibold text-slate-400">Non-editable</span>
              </div>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  readOnly
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-xs font-medium text-slate-500 cursor-not-allowed"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-600 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                  Google
                </span>
              </div>
            </div>

            {/* 3. Branch / Course (Dropdown, Required) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Branch / Course <span className="text-red-500">*</span>
              </label>
              <select
                value={branchCourse}
                onChange={(e) => setBranchCourse(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F7FB] text-xs font-medium text-[#101214] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#263D88] transition-all"
              >
                <option value="" disabled>
                  Select your Branch / Course
                </option>
                {branchOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Enrollment Number (Text input, Required) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Enrollment Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={enrollmentNumber}
                onChange={(e) => setEnrollmentNumber(e.target.value)}
                placeholder="e.g. 20240582 or EN20249871"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F7FB] text-xs font-medium text-[#101214] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#263D88] transition-all"
              />
            </div>

            {/* 5. Phone Number (Phone input, Required) & 6. Gender (Dropdown, Required) in 2-cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F7FB] text-xs font-medium text-[#101214] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#263D88] transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F7FB] text-xs font-medium text-[#101214] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#263D88] transition-all"
                >
                  <option value="" disabled>
                    Select Gender
                  </option>
                  {genderOptions.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 7. Date of Birth (Date picker, Required) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F7FB] text-xs font-medium text-[#101214] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#263D88] transition-all"
              />
            </div>

            {/* 8. Bus ID Number (Optional) */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Bus className="w-3.5 h-3.5 text-[#263D88]" />
                  <span>Bus ID Number</span>
                </label>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  Optional
                </span>
              </div>
              <input
                type="text"
                value={busIdNumber}
                onChange={(e) => setBusIdNumber(e.target.value)}
                placeholder="e.g. BUS-2024-8849 or leave blank"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F7FB] text-xs font-medium text-[#101214] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#263D88] transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Only enter this if you are already registered for university bus service.
              </p>
            </div>
          </div>

          {/* Primary Action Button: Continue */}
          <div className="pt-3">
            <button
              id="create-profile-continue-btn"
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-[#263D88] hover:bg-[#1E2F6B] text-white shadow-md shadow-[#263D88]/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4 text-[#53AADF]" />
            </button>
          </div>
        </form>
      </div>
    );
  };
