import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, X, ArrowRight, UserCheck } from 'lucide-react';

export const GuestAccessModal: React.FC = () => {
  const {
    guestAccessDeniedModalOpen,
    setGuestAccessDeniedModalOpen,
    guestRestrictedActionName,
    logout,
  } = useApp();

  if (!guestAccessDeniedModalOpen) return null;

  return (
    <div
      id="guest-access-denied-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
    >
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 font-['Poppins',sans-serif]">
        <div className="bg-amber-500 text-white p-5 text-center relative">
          <button
            id="close-guest-modal-btn"
            onClick={() => setGuestAccessDeniedModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-2 text-white">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white">Access Restricted</h2>
          <p className="text-xs text-amber-100 mt-0.5">Guest Mode • View-Only</p>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed text-center">
            <p className="font-semibold text-amber-900 mb-1">
              Guest access is view-only.
            </p>
            <p className="text-slate-600">
              Please log in as a <span className="font-bold text-[#263D88]">Student</span>, <span className="font-bold text-[#263D88]">Faculty</span>, or <span className="font-bold text-[#263D88]">Admin</span> to access {guestRestrictedActionName}.
            </p>
          </div>

          <div className="space-y-2">
            <button
              id="switch-to-login-btn"
              onClick={() => {
                setGuestAccessDeniedModalOpen(false);
                logout();
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#263D88] text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#1E2F6B] shadow-md shadow-[#263D88]/20 transition-all cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-[#53AADF]" />
              <span>Log in with Full Permissions</span>
            </button>

            <button
              id="stay-in-guest-mode-btn"
              onClick={() => setGuestAccessDeniedModalOpen(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-600 font-medium text-xs hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Continue Exploring in Guest Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
