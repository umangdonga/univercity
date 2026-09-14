import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfileData } from '../../types';
import {
  Upload,
  User,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Camera,
  Phone,
  Building,
  BookOpen,
  Hash,
  MapPin,
  HeartPulse,
} from 'lucide-react';

export const ProfileCompletionScreen: React.FC = () => {
  const { user, completeUserProfile, showToast, logout } = useApp();

  const [photo, setPhoto] = useState<string>(user.avatar || '');
  const [photoError, setPhotoError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [name, setName] = useState<string>(user.name || '');
  const [email] = useState<string>(user.email || '');
  const [idNumber, setIdNumber] = useState<string>(user.studentId || '20240582');
  const [department, setDepartment] = useState<string>('Computer Science & Engineering');
  const [course, setCourse] = useState<string>('Bachelor of Computer Applications (BCA)');
  const [semester, setSemester] = useState<string>('Semester 4');
  const [phone, setPhone] = useState<string>(user.contact || '+91 98765 43210');
  const [address, setAddress] = useState<string>('Campus Residence Block A, Room 204');
  const [emergencyContact, setEmergencyContact] = useState<string>('+91 98220 11223');
  const [bloodGroup, setBloodGroup] = useState<string>('O+');

  const [formError, setFormError] = useState<string>('');

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

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mandatory Photo Validation
    if (!photo || photo.trim() === '') {
      setPhotoError('Profile photo is mandatory! Please upload your photo before proceeding.');
      showToast('Profile photo is mandatory for student enrollment.');
      return;
    }

    if (!name.trim()) {
      setFormError('Full Name is required.');
      return;
    }

    if (!idNumber.trim()) {
      setFormError('Student ID is required.');
      return;
    }

    if (!phone.trim()) {
      setFormError('Phone number is required.');
      return;
    }

    setFormError('');

    const profileData: UserProfileData = {
      studentId: idNumber,
      department,
      course,
      semester,
      phone,
      address,
      emergencyContact,
      bloodGroup,
    };

    completeUserProfile(profileData, photo);
  };

  return (
    <div
      id="profile-completion-page"
      className="min-h-screen bg-[#F4F7FB] py-8 px-4 font-['Poppins',sans-serif] flex items-center justify-center"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-[#263D88] text-white p-6 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#53AADF] text-white uppercase tracking-wider">
              Student Enrollment Setup
            </span>
            <button
              onClick={logout}
              className="text-xs text-blue-200 hover:text-white underline cursor-pointer"
            >
              Sign Out
            </button>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white">Student Profile Setup</h1>
          <p className="text-xs text-blue-100 mt-1">
            Complete your verified student identity details to unlock your campus services.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Mandatory Photo Upload Section */}
          <div
            id="photo-upload-section"
            className={`p-4 rounded-2xl border-2 transition-all ${
              photoError ? 'border-red-400 bg-red-50/50' : 'border-dashed border-slate-200 bg-[#F4F7FB]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-[#101214] flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#263D88]" />
                <span>Profile Photo</span>
                <span className="text-red-500 font-bold">* (MANDATORY)</span>
              </label>
              {photo ? (
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Photo Attached
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                  Upload Required
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-200 border-2 border-[#263D88] flex items-center justify-center shadow-xs">
                  {photo ? (
                    <img
                      src={photo}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 p-1.5 bg-[#263D88] hover:bg-[#53AADF] text-white rounded-xl shadow-md transition-colors cursor-pointer"
                  title="Upload from device"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 flex-1 min-w-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-300 hover:border-[#263D88] text-xs font-semibold text-[#263D88] flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Photo from Device</span>
                </button>

                <p className="text-[10px] text-slate-400">
                  Select student ID portrait (JPG, PNG, max 5MB)
                </p>

                {/* Sample quick choices */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500">Or pick template:</span>
                  {sampleAvatars.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Sample ${i}`}
                      onClick={() => {
                        setPhoto(url);
                        setPhotoError('');
                      }}
                      className={`w-6 h-6 rounded-full cursor-pointer object-cover border-2 hover:scale-110 transition-transform ${
                        photo === url ? 'border-[#263D88] ring-2 ring-[#53AADF]' : 'border-white'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {photoError && (
              <p className="text-xs font-semibold text-red-600 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {photoError}
              </p>
            )}
          </div>

          {/* Form Error Notice */}
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Core User Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohit Sharma"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F7FB] text-xs font-medium text-[#101214] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#263D88]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Google Email <span className="text-slate-400 font-normal">(Verified)</span>
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-xs font-medium text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Student ID / Enrollment No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="20240582"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F7FB] text-xs font-medium text-[#101214] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#263D88]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F7FB] text-xs font-medium text-[#101214] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#263D88]"
              />
            </div>
          </div>

          {/* Academic Program Details */}
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <h3 className="text-xs font-bold text-[#263D88] uppercase tracking-wider">
              Academic Program Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Course / Degree
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F7FB] text-xs font-medium text-[#101214] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#263D88]"
                >
                  <option>Bachelor of Computer Applications (BCA)</option>
                  <option>B.Tech Computer Science & Engineering</option>
                  <option>B.Tech Electronics & Communication</option>
                  <option>Master of Design (M.Des)</option>
                  <option>Master of Business Administration (MBA)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Current Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F7FB] text-xs font-medium text-[#101214] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#263D88]"
                >
                  <option>Semester 1</option>
                  <option>Semester 2</option>
                  <option>Semester 3</option>
                  <option>Semester 4</option>
                  <option>Semester 5</option>
                  <option>Semester 6</option>
                  <option>Semester 7</option>
                  <option>Semester 8</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F7FB] text-xs font-medium text-[#101214] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#263D88]"
                />
              </div>
            </div>
          </div>

          {/* Additional details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Campus Residence / Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Block A, Room 204"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F7FB] text-xs font-medium text-[#101214] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#263D88]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Emergency Contact
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="+91 98220 11223"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F7FB] text-xs font-medium text-[#101214] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#263D88]"
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            id="save-profile-btn"
            type="submit"
            disabled={!photo}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              !photo
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-[#263D88] hover:bg-[#1E2F6B] text-white shadow-[#263D88]/20 active:scale-[0.99]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#53AADF]" />
            <span>Complete Profile & Access Campus</span>
          </button>

          {!photo && (
            <p className="text-center text-[11px] text-red-500 font-medium">
              * Profile photo is mandatory. Upload or choose a photo above to enable access.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
