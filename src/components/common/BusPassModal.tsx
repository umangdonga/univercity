import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bus, Download, QrCode, X, CheckCircle, Clock } from 'lucide-react';

export const BusPassModal: React.FC = () => {
  const { activeBusTicket, setActiveBusTicket, showToast } = useApp();

  if (!activeBusTicket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95">
        <div className="bg-[#263D88] text-white p-5 text-center relative">
          <button
            onClick={() => setActiveBusTicket(null)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-2 text-[#53AADF]">
            <Bus className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Campus Transit Pass</h2>
          <p className="text-xs text-blue-100 mt-0.5">Verified Digital Student Shuttle Pass</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-[#F4F7FB] border border-[#BADDF2]/50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-400">TICKET NO</span>
              <span className="text-xs font-mono font-bold text-[#263D88]">{activeBusTicket.ticketId}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Passenger</span>
                <p className="text-sm font-bold text-[#101214]">{activeBusTicket.studentName}</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Assigned Bus</span>
                <p className="text-sm font-bold text-[#263D88]">{activeBusTicket.busNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Route</span>
                <p className="text-sm font-semibold text-[#101214]">{activeBusTicket.routeNumber}</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Validity</span>
                <p className="text-sm font-semibold text-emerald-600">Active / Valid</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-xl gap-3">
            <QrCode className="w-12 h-12 text-[#263D88]" />
            <div className="text-left">
              <p className="text-xs font-semibold text-[#101214]">Driver Tap & Go</p>
              <p className="text-[10px] text-slate-400">Show to conductor when boarding</p>
            </div>
          </div>

          <button
            onClick={() => {
              showToast('Bus transit pass saved to offline storage!');
              setActiveBusTicket(null);
            }}
            className="w-full py-3 px-4 rounded-xl bg-[#263D88] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#1E2F6B] shadow-md shadow-[#263D88]/20 transition-all"
          >
            <Download className="w-4 h-4 text-[#53AADF]" />
            <span>Download Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
};
