import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Download, MapPin, X, Building2, QrCode } from 'lucide-react';
import { CAMPUS_LOCATIONS } from '../../data/mockCampusData';

export const AppointmentPassModal: React.FC = () => {
  const { activeAppointmentPass, setActiveAppointmentPass, startNavigationTo, showToast } = useApp();

  if (!activeAppointmentPass) return null;

  const handleDownload = () => {
    showToast(`Downloading Admission Pass #${activeAppointmentPass.ticketId}...`);
  };

  const handleNavigate = () => {
    const adminLoc = CAMPUS_LOCATIONS.find((l) => l.id === 'admin-office') || CAMPUS_LOCATIONS[6];
    setActiveAppointmentPass(null);
    startNavigationTo(adminLoc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header Ribbon */}
        <div className="bg-[#263D88] text-white p-5 text-center relative">
          <button
            onClick={() => setActiveAppointmentPass(null)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-2 text-white">
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Appointment Confirmed</h2>
          <p className="text-xs text-blue-100 mt-0.5">Visitor Inquiry Pass</p>
        </div>

        {/* Pass Details Body */}
        <div className="p-6 space-y-4">
          <div className="bg-[#F4F7FB] border border-[#BADDF2]/50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pass ID</span>
              <span className="text-xs font-mono font-bold text-[#263D88]">{activeAppointmentPass.ticketId}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Applicant Name</span>
                <p className="text-sm font-bold text-[#101214] truncate">{activeAppointmentPass.fullName}</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Department</span>
                <p className="text-sm font-bold text-[#263D88] truncate">{activeAppointmentPass.department}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Date</span>
                <p className="text-sm font-semibold text-[#101214]">{activeAppointmentPass.date}</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Time Slot</span>
                <p className="text-sm font-semibold text-emerald-700">{activeAppointmentPass.timeSlot}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Building2 className="w-3.5 h-3.5 text-[#263D88]" />
                <span>University Admission Office (A102)</span>
              </div>
            </div>
          </div>

          {/* QR Code Graphic Simulation */}
          <div className="flex items-center justify-center p-3 bg-white border border-dashed border-slate-200 rounded-xl gap-3">
            <QrCode className="w-12 h-12 text-[#263D88]" />
            <div className="text-left">
              <p className="text-xs font-semibold text-[#101214]">Scan at Gate 1 & Desk</p>
              <p className="text-[10px] text-slate-400">Valid for 1 visitor • ID required</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleNavigate}
              className="w-full py-3 px-4 rounded-xl bg-[#263D88] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#1E2F6B] shadow-md shadow-[#263D88]/20 transition-all active:scale-[0.98]"
            >
              <MapPin className="w-4 h-4 text-[#53AADF]" />
              <span>Navigate to Admission Office</span>
            </button>

            <button
              onClick={handleDownload}
              className="w-full py-2.5 px-4 rounded-xl bg-[#BADDF2]/40 text-[#263D88] font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[#BADDF2]/70 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
