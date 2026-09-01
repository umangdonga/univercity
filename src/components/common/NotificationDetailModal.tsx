import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCircle2, Clock, MapPin, X } from 'lucide-react';
import { CAMPUS_LOCATIONS } from '../../data/mockCampusData';

export const NotificationDetailModal: React.FC = () => {
  const { activeNotifModal, setActiveNotifModal, markNotificationRead, startNavigationTo, openService, setActiveTab } = useApp();

  if (!activeNotifModal) return null;

  const handleClose = () => {
    markNotificationRead(activeNotifModal.id);
    setActiveNotifModal(null);
  };

  const handleAction = () => {
    markNotificationRead(activeNotifModal.id);
    setActiveNotifModal(null);

    if (activeNotifModal.id === 'notif-1') {
      openService('courses');
    } else if (activeNotifModal.id === 'notif-2') {
      openService('library');
    } else if (activeNotifModal.id === 'notif-3') {
      const lab = CAMPUS_LOCATIONS.find((l) => l.id === 'innovation-lab');
      if (lab) startNavigationTo(lab);
    } else if (activeNotifModal.id === 'notif-6') {
      openService('canteen');
    } else {
      setActiveTab('home');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95">
        <div className="bg-[#263D88] text-white p-5 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#53AADF] text-white uppercase tracking-wider">
              {activeNotifModal.category} update
            </span>
            <span className="text-xs text-blue-200 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {activeNotifModal.timestamp}
            </span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white leading-snug">
            {activeNotifModal.title}
          </h2>
          {activeNotifModal.subtitle && (
            <p className="text-xs text-[#BADDF2] mt-0.5">{activeNotifModal.subtitle}</p>
          )}
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-[#F4F7FB] p-4 rounded-2xl border border-slate-100 text-sm text-slate-700 leading-relaxed">
            {activeNotifModal.message}
          </div>

          <div className="space-y-2">
            <button
              onClick={handleAction}
              className="w-full py-3 px-4 rounded-xl bg-[#263D88] text-white font-semibold text-sm hover:bg-[#1E2F6B] shadow-md shadow-[#263D88]/20 transition-all flex items-center justify-center gap-2"
            >
              <span>View Details & Actions</span>
            </button>
            <button
              onClick={handleClose}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-600 font-medium text-xs hover:bg-slate-200 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
