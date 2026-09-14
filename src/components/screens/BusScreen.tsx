import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BUS_ROUTES_DATA } from '../../data/mockCampusData';
import { BusRoute, BusPassData } from '../../types';
import { Header } from '../common/Header';
import {
  Bus,
  Clock,
  MapPin,
  CheckCircle2,
  QrCode,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Calendar,
  User,
  ChevronRight,
  Download,
  Share2,
} from 'lucide-react';

interface BusScreenProps {
  onBack?: () => void;
}

export const BusScreen: React.FC<BusScreenProps> = ({ onBack }) => {
  const {
    user,
    submitBusPassApplication,
    activeBusTicket,
    setActiveBusTicket,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'schedule' | 'apply' | 'mypass'>(
    user.busData ? 'mypass' : 'schedule'
  );

  const [selectedRouteId, setSelectedRouteId] = useState<string>('bus-4');

  // Multi-step Application state
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields pre-filled from user profile
  const [fullName, setFullName] = useState<string>(user.name || 'Rohit Sharma');
  const [studentId, setStudentId] = useState<string>(
    user.studentId || user.profileData?.studentId || '20240582'
  );
  const [course, setCourse] = useState<string>(
    user.branch || user.profileData?.course || 'Bachelor of Computer Applications (BCA)'
  );
  const [department, setDepartment] = useState<string>(
    user.profileData?.department || 'Computer Science & Engineering'
  );
  const [pickupPoint, setPickupPoint] = useState<string>(
    user.busData?.pickupLocation || 'Ahmedabad'
  );
  const [dropLocation, setDropLocation] = useState<string>(
    user.busData?.dropLocation || 'Campus Main Terminal'
  );
  const [routeNumber, setRouteNumber] = useState<string>(
    user.busData?.routeNumber || 'Route 04 (Express Corridor)'
  );
  const [duration, setDuration] = useState<string>('Semester Pass (Fall 2026)');

  const pickupOptions = [
    'Ahmedabad',
    'Gandhinagar',
    'Satellite',
    'Bopal',
    'Naroda',
    'Maninagar',
    'Chandkheda',
    'SG Highway',
  ];

  const dropOptions = [
    'Campus Main Terminal',
    'North Gate Terminal',
    'South Gate Science Complex',
  ];

  const routeOptions = [
    'Route 01 (North City Express)',
    'Route 02 (Suburban Shuttle)',
    'Route 03 (East Campus Link)',
    'Route 04 (Express Corridor)',
    'Route 05 (South Gate Direct)',
    'Route 06 (West Ring Rapid)',
    'Route 07 (Central Hub Connector)',
    'Route 08 (Metro Feeder Line)',
  ];

  const assignedBus =
    routeNumber.includes('04')
      ? 'Bus #12 (KA-01-F-8821)'
      : routeNumber.includes('01')
      ? 'Bus #03 (KA-01-F-1102)'
      : routeNumber.includes('02')
      ? 'Bus #08 (KA-01-E-4589)'
      : 'Bus #16 (KA-01-G-9034)';

  const feeAmount = duration.includes('Annual') ? '$220' : duration.includes('Semester') ? '$120' : '$40';

  const selectedRoute =
    BUS_ROUTES_DATA.find((r) => r.id === selectedRouteId) || BUS_ROUTES_DATA[0];

  const handleStartApplication = () => {
    setActiveTab('apply');
    setStep(1);
  };

  const handleReviewStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleConfirmAndSubmit = () => {

    const newPassData: BusPassData = {
      passNumber: `BUS-PASS-${Math.floor(100000 + Math.random() * 900000)}`,
      studentName: fullName,
      studentId: studentId,
      course: course || user.branch || 'Information Technology',
      semester: user.profileData?.semester || 'Semester 4',
      phone: user.profileData?.phone || user.contact || '+91 98765 43210',
      address: user.profileData?.address || 'Campus Residence / Local Address',
      emergencyContact: user.profileData?.emergencyContact || '+91 98222 11000',
      routeNumber: routeNumber,
      busNumber: assignedBus,
      pickupLocation: pickupPoint,
      dropLocation: dropLocation,
      applicationType: 'New Bus Pass',
      validity: duration.includes('Annual') ? 'Valid until Jul 2027' : 'Valid until Jan 2027',
      status: 'Approved',
      appliedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    submitBusPassApplication(newPassData);
    setStep(3);
  };

  return (
    <div id="bus-screen-page" className="bg-[#F4F7FB] min-h-screen pb-24 font-['Poppins',sans-serif]">
      {/* 8. Functional Back Button in Header */}
      <Header
        showBack={true}
        onBack={onBack}
        title="Bus Services & Digital Pass"
        subtitle="Live Campus Shuttles & Transport Applications"
      />

      <main className="px-4 py-4 space-y-4 max-w-md mx-auto sm:max-w-xl md:max-w-2xl">
        {/* Navigation Mode Tabs */}
        <div className="flex p-1 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <button
            id="tab-bus-schedule-btn"
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-[#263D88] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#263D88]'
            }`}
          >
            Live Schedules
          </button>
          <button
            id="tab-bus-apply-btn"
            onClick={handleStartApplication}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'apply'
                ? 'bg-[#263D88] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#263D88]'
            }`}
          >
            Apply for Pass
          </button>
          <button
            id="tab-bus-mypass-btn"
            onClick={() => {
              setActiveTab('mypass');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'mypass'
                ? 'bg-[#263D88] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#263D88]'
            }`}
          >
            Digital Pass
          </button>
        </div>

        {/* -------------------- 1. APPLICATION MULTI-STEP FLOW -------------------- */}
        {activeTab === 'apply' && (
          <div className="space-y-4">
            {/* Step Tracker Indicator */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-[#263D88] font-bold' : 'text-slate-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-[#263D88] text-white' : 'bg-slate-200 text-slate-500'}`}>
                    1
                  </span>
                  <span>Application Form</span>
                </div>
                <div className="h-0.5 w-8 bg-slate-200" />
                <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-[#263D88] font-bold' : 'text-slate-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-[#263D88] text-white' : 'bg-slate-200 text-slate-500'}`}>
                    2
                  </span>
                  <span>Verification</span>
                </div>
                <div className="h-0.5 w-8 bg-slate-200" />
                <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    3
                  </span>
                  <span>Issued Pass</span>
                </div>
              </div>
            </div>

            {/* STEP 1: Application Form */}
            {step === 1 && (
              <form onSubmit={handleReviewStep} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Bus className="w-5 h-5 text-[#263D88]" />
                  <div>
                    <h2 className="text-sm font-bold text-[#101214]">Student Bus Pass Application</h2>
                    <p className="text-[11px] text-slate-500">Student credentials auto-synced with profile</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F7FB] text-xs font-semibold text-[#101214] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#263D88]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Student Enrollment ID</label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F7FB] text-xs font-semibold text-[#101214] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#263D88]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Course / Program</label>
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F7FB] text-xs font-medium text-[#101214] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#263D88]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F7FB] text-xs font-medium text-[#101214] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#263D88]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pickup Point / Stop <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={pickupPoint}
                      onChange={(e) => setPickupPoint(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F7FB] text-xs font-medium text-[#101214] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#263D88]"
                    >
                      {pickupOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Drop Location <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={dropLocation}
                      onChange={(e) => setDropLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F7FB] text-xs font-medium text-[#101214] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#263D88]"
                    >
                      {dropOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Route Selection <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={routeNumber}
                      onChange={(e) => setRouteNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F7FB] text-xs font-medium text-[#101214] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#263D88]"
                    >
                      {routeOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Term / Duration <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#F4F7FB] text-xs font-medium text-[#101214] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#263D88]"
                    >
                      <option>Semester Pass (Fall 2026)</option>
                      <option>Annual Pass (2026-2027)</option>
                      <option>Monthly Commuter Pass</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Auto-links to Student Profile</span>
                  <button
                    id="continue-to-review-btn"
                    type="submit"
                    className="py-2.5 px-5 rounded-xl bg-[#263D88] hover:bg-[#1E2F6B] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#263D88]/20 transition-all cursor-pointer"
                  >
                    <span>Proceed to Review</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Review & Verification Summary */}
            {step === 2 && (
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-bold text-[#101214]">Review Application Summary</h2>
                    <p className="text-[11px] text-slate-500">Confirm all details before final pass generation</p>
                  </div>
                  <span className="text-xs font-bold text-[#263D88] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                    Step 2 of 3
                  </span>
                </div>

                <div className="bg-[#F4F7FB] rounded-2xl p-4 space-y-2.5 text-xs text-slate-700">
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Student Name:</span>
                    <span className="font-bold text-[#101214]">{fullName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Student ID:</span>
                    <span className="font-semibold text-[#101214]">{studentId}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Pickup Point:</span>
                    <span className="font-bold text-[#263D88]">{pickupPoint}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Drop Point:</span>
                    <span className="font-medium text-[#101214]">{dropLocation}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Assigned Route:</span>
                    <span className="font-bold text-[#263D88]">{routeNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Assigned Bus:</span>
                    <span className="font-semibold text-emerald-700">{assignedBus}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500">Duration & Fee:</span>
                    <span className="font-bold text-base text-[#263D88]">{feeAmount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Edit Details
                  </button>

                  <button
                    id="confirm-bus-pass-btn"
                    type="button"
                    onClick={handleConfirmAndSubmit}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#263D88] hover:bg-[#1E2F6B] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#263D88]/20 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#53AADF]" />
                    <span>Confirm & Issue Digital Pass</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Instant Approved Pass */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-emerald-500 text-white rounded-3xl p-5 shadow-lg space-y-2 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto text-white">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Application Approved & Pass Issued!</h2>
                  <p className="text-xs text-emerald-100">
                    Your bus application has been verified and permanently linked to your Student Profile.
                  </p>
                </div>

                {/* Digital Card Preview */}
                <div className="bg-gradient-to-br from-[#263D88] via-[#1E2F6B] to-[#101214] text-white rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/20 pb-3">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-[#101214] uppercase tracking-wider">
                        Active • Verified
                      </span>
                      <h3 className="text-base font-bold mt-1 text-white">Campus Digital Bus Pass</h3>
                    </div>
                    <Bus className="w-8 h-8 text-[#53AADF]" />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#53AADF] bg-slate-700 shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <User className="w-8 h-8 text-white m-auto" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-white">{fullName}</p>
                      <p className="text-xs text-blue-200">ID: {studentId}</p>
                      <p className="text-xs text-emerald-300 font-semibold">{assignedBus}</p>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-2xl p-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-blue-200">Pickup Station</span>
                      <p className="font-bold text-white">{pickupPoint}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-200">Drop Destination</span>
                      <p className="font-bold text-white">{dropLocation}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-200">Route Number</span>
                      <p className="font-bold text-white">{routeNumber}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-200">Validity</span>
                      <p className="font-bold text-emerald-300">Fall Term 2026</p>
                    </div>
                  </div>

                  {/* QR Code section */}
                  <div className="bg-white rounded-2xl p-4 text-[#101214] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold">Conductor Verification QR</p>
                      <p className="text-[10px] text-slate-500">Scan on terminal entrance</p>
                      <span className="text-[10px] font-mono text-[#263D88] font-bold mt-1 block">
                        {user.busData?.passNumber || 'BUS-PASS-882194'}
                      </span>
                    </div>
                    <div className="w-16 h-16 bg-slate-100 rounded-xl p-1.5 border border-slate-200 flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-[#263D88]" />
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('mypass')}
                    className="w-full py-2.5 rounded-xl bg-[#53AADF] hover:bg-[#BADDF2] text-[#263D88] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View in My Digital Passes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------- 2. DIGITAL PASS TAB -------------------- */}
        {activeTab === 'mypass' && (
          <div className="space-y-4">
            {user.busData ? (
              <div className="bg-gradient-to-br from-[#263D88] via-[#1E2F6B] to-[#101214] text-white rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/20 pb-3">
                  <div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-400 text-[#101214] uppercase tracking-wider">
                      {user.busData.status}
                    </span>
                    <h3 className="text-base font-bold mt-1 text-white">Verified Campus Bus Pass</h3>
                  </div>
                  <Bus className="w-8 h-8 text-[#53AADF]" />
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#53AADF] bg-slate-700 shrink-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="w-8 h-8 text-white m-auto" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-white">{user.busData.studentName}</p>
                    <p className="text-xs text-blue-200">ID: {user.busData.studentId}</p>
                    <p className="text-xs text-emerald-300 font-semibold">{user.busData.busNumber}</p>
                  </div>
                </div>

                <div className="bg-white/10 rounded-2xl p-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-blue-200">Pickup Station</span>
                    <p className="font-bold text-white">{user.busData.pickupLocation}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-200">Drop Terminal</span>
                    <p className="font-bold text-white">{user.busData.dropLocation}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-200">Route</span>
                    <p className="font-bold text-white">{user.busData.routeNumber}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-200">Validity</span>
                    <p className="font-bold text-emerald-300">{user.busData.validity}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 text-[#101214] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold">Pass # {user.busData.passNumber}</p>
                    <p className="text-[10px] text-slate-500">Connected with University Profile</p>
                    <span className="text-[10px] font-semibold text-emerald-700 mt-0.5 block">
                      Sync Status: Active in Profile
                    </span>
                  </div>
                  <div className="w-16 h-16 bg-slate-100 rounded-xl p-1.5 border border-slate-200 flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-[#263D88]" />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      setActiveTab('apply');
                      setStep(1);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Modify Route / Re-Apply
                  </button>
                  <button
                    onClick={() => {
                      alert(`Pass #${user.busData?.passNumber} downloaded as secure PDF!`);
                    }}
                    className="py-2.5 px-4 rounded-xl bg-[#53AADF] hover:bg-white text-[#263D88] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save PDF</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-xs space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#263D88] flex items-center justify-center mx-auto">
                  <Bus className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#101214]">No Active Bus Pass Found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Submit your application with your route and pickup stop to generate an official digital bus pass.
                  </p>
                </div>
                <button
                  onClick={handleStartApplication}
                  className="py-2.5 px-6 rounded-xl bg-[#263D88] hover:bg-[#1E2F6B] text-white text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-[#263D88]/20 transition-all cursor-pointer"
                >
                  <Bus className="w-4 h-4 text-[#53AADF]" />
                  <span>Apply for Bus Pass Now</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* -------------------- 3. LIVE SCHEDULES TAB -------------------- */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            {/* Route Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {BUS_ROUTES_DATA.map((route) => {
                const isSelected = selectedRouteId === route.id;
                return (
                  <button
                    key={route.id}
                    onClick={() => setSelectedRouteId(route.id)}
                    className={`shrink-0 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#263D88] text-white shadow-md'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-[#BADDF2]'
                    }`}
                  >
                    <Bus className="w-3.5 h-3.5" />
                    <span>{route.routeNumber}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Route Spotlight Card */}
            <div className="bg-gradient-to-br from-[#263D88] to-[#1E2F6B] text-white rounded-3xl p-5 shadow-lg shadow-[#263D88]/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#53AADF] text-white uppercase tracking-wider">
                    {selectedRoute.routeNumber}
                  </span>
                  <h2 className="text-xl font-bold mt-1 text-white">{selectedRoute.busNumber}</h2>
                  <p className="text-xs text-blue-100">{selectedRoute.title}</p>
                </div>

                <div className="text-right">
                  <span className="text-lg font-bold text-amber-300">{selectedRoute.nextTiming}</span>
                  <p className="text-[10px] text-blue-200">Next Departure</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/15">
                <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm">
                  <span className="text-[10px] text-blue-200 font-medium">Available Seats</span>
                  <p className="text-sm font-bold text-emerald-300">{selectedRoute.availableSeats} Seats</p>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm">
                  <span className="text-[10px] text-blue-200 font-medium">Registered Students</span>
                  <p className="text-sm font-bold text-white">{selectedRoute.registeredCount} Students</p>
                </div>
              </div>

              <button
                onClick={handleStartApplication}
                className="w-full py-3 px-4 rounded-xl bg-white text-[#263D88] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#BADDF2] shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-[#263D88]" />
                <span>Apply for Digital Bus Pass on This Route</span>
              </button>
            </div>

            {/* Route Stops Timeline */}
            <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-[#101214] uppercase tracking-wider">
                Route Stops & Timings
              </h3>

              <div className="space-y-4 relative pl-4 border-l-2 border-[#BADDF2] ml-2">
                {selectedRoute.stops.map((stop, idx) => (
                  <div key={idx} className="relative group">
                    <span className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#263D88] group-hover:bg-[#53AADF] transition-colors" />
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[#101214]">{stop.name}</h4>
                        <span className="text-[10px] text-slate-400">Stop #{idx + 1}</span>
                      </div>
                      <span className="text-xs font-semibold text-[#263D88]">{stop.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Driver & Conductor Card */}
            <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#101214] uppercase tracking-wider">
                Bus Crew Contact
              </h3>
              <div className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#101214]">{selectedRoute.driverName}</p>
                  <p className="text-slate-400 text-[11px]">Authorized Campus Driver</p>
                </div>
                <a
                  href={`tel:${selectedRoute.driverPhone || '+919876543210'}`}
                  className="py-1.5 px-3 rounded-xl bg-slate-100 text-[#263D88] font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Call Driver
                </a>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};
