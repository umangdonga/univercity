import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BUS_ROUTES_DATA } from '../../data/mockCampusData';
import { BusRoute } from '../../types';
import {
  Bus,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Download,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface BusScreenProps {
  onBack?: () => void;
}

export const BusScreen: React.FC<BusScreenProps> = ({ onBack }) => {
  const { user, registerBusPass, setActiveBusTicket, activeBusTicket } = useApp();
  const [selectedRouteId, setSelectedRouteId] = useState<string>('bus-4');

  const selectedRoute = BUS_ROUTES_DATA.find((r) => r.id === selectedRouteId) || BUS_ROUTES_DATA[0];

  const handleRegister = (route: BusRoute) => {
    registerBusPass(route.routeNumber, route.busNumber);
  };

  return (
    <div className="bg-[#F4F7FB] min-h-screen pb-24 font-['Poppins',sans-serif]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-base font-bold text-[#101214] tracking-tight">Campus Bus Schedules</h1>
            <p className="text-[11px] text-slate-400">Routes, real timings & digital pass</p>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-blue-50 text-[#263D88]">
          <Bus className="w-4 h-4" />
        </div>
      </div>

      <main className="px-4 py-4 space-y-4 max-w-md mx-auto sm:max-w-xl md:max-w-2xl">
        {/* Route Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {BUS_ROUTES_DATA.map((route) => {
            const isSelected = selectedRouteId === route.id;
            return (
              <button
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={`shrink-0 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
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
              <span className="text-[10px] text-blue-200 font-medium">Registered Pass</span>
              <p className="text-sm font-bold text-white">{selectedRoute.registeredCount} Students</p>
            </div>
          </div>

          <button
            onClick={() => handleRegister(selectedRoute)}
            className="w-full py-3 px-4 rounded-xl bg-white text-[#263D88] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#BADDF2] shadow-md transition-all active:scale-[0.98]"
          >
            <QrCode className="w-4 h-4 text-[#263D88]" />
            <span>Generate & View Digital Bus Pass</span>
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
              className="py-1.5 px-3 rounded-xl bg-slate-100 text-[#263D88] font-bold hover:bg-slate-200 transition-colors"
            >
              Call Driver
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};
