import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PARKING_AREAS_DATA, CAMPUS_LOCATIONS } from '../../data/mockCampusData';
import { Car, Navigation, ArrowLeft, CheckCircle2, ShieldAlert, Sparkles, MapPin } from 'lucide-react';

interface ParkingScreenProps {
  onBack?: () => void;
}

export const ParkingScreen: React.FC<ParkingScreenProps> = ({ onBack }) => {
  const { startNavigationTo, showToast } = useApp();
  const [selectedSlotCode, setSelectedSlotCode] = useState<string | null>(null);

  const parkingZone = PARKING_AREAS_DATA[0];

  const handleReserve = (slotCode: string) => {
    setSelectedSlotCode(slotCode);
    showToast(`Parking Slot #${slotCode} reserved for 30 minutes!`);
  };

  const handleNavigate = () => {
    const loc = CAMPUS_LOCATIONS.find((l) => l.id === 'parking-zone-a') || CAMPUS_LOCATIONS[9];
    startNavigationTo(loc);
  };

  return (
    <div className="bg-[#F4F7FB] min-h-screen pb-24 font-['Poppins',sans-serif]">
      {/* Header Bar */}
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
            <h1 className="text-base font-bold text-[#101214] tracking-tight">{parkingZone.name}</h1>
            <p className="text-[11px] text-slate-400">Live slot tracking & parking reservation</p>
          </div>
        </div>

        <button
          onClick={handleNavigate}
          className="py-1.5 px-3 rounded-xl bg-[#263D88] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#1E2F6B] shadow-sm transition-all"
        >
          <Navigation className="w-3.5 h-3.5 text-[#53AADF]" />
          <span>Navigate</span>
        </button>
      </div>

      <main className="px-4 py-4 space-y-4 max-w-md mx-auto sm:max-w-xl md:max-w-2xl">
        {/* Availability Hero Spotlight */}
        <div className="bg-gradient-to-br from-[#263D88] to-[#1E2F6B] text-white rounded-3xl p-5 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#BADDF2] uppercase tracking-wider">
              North Gate Parking (Zone A)
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Live Sensor Active
            </span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <span className="text-3xl font-bold text-white tracking-tight">
                {parkingZone.availableSpaces}
              </span>
              <span className="text-sm text-blue-200 font-medium ml-1.5">
                / {parkingZone.totalSpaces} Slots Free
              </span>
              <p className="text-xs text-blue-100/80 mt-0.5">{parkingZone.location}</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 text-white">
              <Car className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Visual Parking Lot Matrix from Case Study */}
        <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#101214] uppercase tracking-wider">
              Select & Reserve Slot
            </h3>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Free
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Taken
              </span>
            </div>
          </div>

          {/* Slots Grid */}
          <div className="grid grid-cols-4 gap-2.5">
            {parkingZone.slots.map((slot) => {
              const isSelected = selectedSlotCode === slot.code;
              const isOccupied = slot.isOccupied;

              return (
                <button
                  key={slot.id}
                  disabled={isOccupied}
                  onClick={() => handleReserve(slot.code)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    isOccupied
                      ? 'bg-slate-100/70 border-slate-200 text-slate-400 cursor-not-allowed'
                      : isSelected
                      ? 'bg-[#263D88] text-white border-[#263D88] shadow-md scale-105'
                      : 'bg-[#F4F7FB] border-slate-200 hover:border-[#53AADF] text-[#101214]'
                  }`}
                >
                  <Car className={`w-4 h-4 ${isOccupied ? 'text-slate-300' : isSelected ? 'text-white' : 'text-[#263D88]'}`} />
                  <span className="text-xs font-bold">{slot.code}</span>
                  <span className="text-[9px] font-semibold uppercase">
                    {isOccupied ? 'Occupied' : isSelected ? 'Reserved' : slot.type}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedSlotCode && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-900">
                  Slot #{selectedSlotCode} Confirmed
                </span>
              </div>
              <button
                onClick={handleNavigate}
                className="py-1 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
              >
                Drive There
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
