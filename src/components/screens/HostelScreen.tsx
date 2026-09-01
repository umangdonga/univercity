import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HOSTELS_DATA, CAMPUS_LOCATIONS } from '../../data/mockCampusData';
import {
  Home,
  Users,
  Shield,
  Phone,
  Mail,
  CheckCircle2,
  Navigation,
  ArrowLeft,
  Sparkles,
  Wifi,
  Wind,
  Coffee,
  Clock,
  Layers,
  Building,
} from 'lucide-react';

interface HostelScreenProps {
  onBack?: () => void;
}

export const HostelScreen: React.FC<HostelScreenProps> = ({ onBack }) => {
  const { startNavigationTo, showToast } = useApp();
  const [selectedHostelId, setSelectedHostelId] = useState<string>('hostel-block-a');
  const [inquiryModalOpen, setInquiryModalOpen] = useState<boolean>(false);
  const [selectedSharing, setSelectedSharing] = useState<string>('2 Sharing (Twin)');

  const currentHostel = HOSTELS_DATA.find((h) => h.id === selectedHostelId) || HOSTELS_DATA[0];

  const handleNavigate = () => {
    const loc = CAMPUS_LOCATIONS.find((l) => l.id === currentHostel.id) || CAMPUS_LOCATIONS[8];
    startNavigationTo(loc);
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Application submitted for ${currentHostel.name} (${selectedSharing})! Warden will reach out.`);
    setInquiryModalOpen(false);
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
            <h1 className="text-base font-bold text-[#101214] tracking-tight">Campus Hostels</h1>
            <p className="text-[11px] text-slate-400">Accommodations, fees, rules & warden details</p>
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
        {/* Hostel Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-white rounded-2xl border border-slate-200 shadow-xs">
          {HOSTELS_DATA.map((h) => {
            const isSelected = selectedHostelId === h.id;
            return (
              <button
                key={h.id}
                onClick={() => setSelectedHostelId(h.id)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isSelected ? 'bg-[#263D88] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>{h.name}</span>
              </button>
            );
          })}
        </div>

        {/* Hostel Hero Card */}
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs">
          <div className="relative h-44">
            <img
              src={currentHostel.roomTypes[0]?.image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop&q=80'}
              alt={currentHostel.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#53AADF] text-white uppercase tracking-wider">
                {currentHostel.gender}
              </span>
              <h2 className="text-xl font-bold mt-1">{currentHostel.name}</h2>
              <p className="text-xs text-blue-100">{currentHostel.block}</p>
            </div>
          </div>

          <div className="p-4 bg-[#F4F7FB]/50 border-b border-slate-100 flex items-center justify-around text-xs text-slate-700">
            <div className="text-center">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Location</span>
              <p className="font-bold text-xs text-[#263D88] truncate max-w-[120px]">{currentHostel.location}</p>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-center">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Room Options</span>
              <p className="font-bold text-sm text-emerald-600">{currentHostel.roomTypes.length} Sharing Plans</p>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-center">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Curfew</span>
              <p className="font-bold text-sm text-[#FF0000]">9:30 PM</p>
            </div>
          </div>
        </div>

        {/* Room Sharing Plans from Case Study (2 sharing, 3 sharing, 5 sharing) */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-[#101214] uppercase tracking-wider px-1">
            Room Options & Fee Structure
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {currentHostel.roomTypes.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between hover:border-[#53AADF] transition-all space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#263D88] uppercase">{room.sharingType}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        room.isAC
                          ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {room.isAC ? 'AC' : 'Non-AC'}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-[#101214] mt-1">
                    ₹{room.feePerTerm.toLocaleString('en-IN')}
                    <span className="text-[10px] text-slate-400 font-normal"> / term</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2">{room.description}</p>

                <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{room.available ? 'Beds Available' : 'Full / Waitlist'}</span>
                </div>

                <button
                  onClick={() => {
                    setSelectedSharing(room.sharingType);
                    setInquiryModalOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[#263D88] text-white text-xs font-bold hover:bg-[#1E2F6B] transition-colors"
                >
                  Apply for Room
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Hostel Rules from Case Study */}
        <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-[#101214] uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#263D88]" />
            <span>Hostel Guidelines & Rules</span>
          </h3>

          <ul className="space-y-2 text-xs text-slate-600">
            {currentHostel.rules.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#263D88] mt-1.5 shrink-0" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Warden Contact Card */}
        <section className="bg-gradient-to-r from-[#263D88] to-[#1E2F6B] text-white rounded-3xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-[#BADDF2] uppercase tracking-wider">
            Hostel Warden Office
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">{currentHostel.wardenContact.name}</p>
              <p className="text-xs text-blue-200">{currentHostel.wardenContact.email}</p>
            </div>
            <a
              href={`tel:${currentHostel.wardenContact.phone}`}
              className="py-2 px-3.5 rounded-xl bg-white text-[#263D88] font-bold text-xs flex items-center gap-1.5 hover:bg-[#BADDF2] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#263D88]" />
              <span>Call Warden</span>
            </a>
          </div>
        </section>
      </main>

      {/* Room Application Modal */}
      {inquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#263D88]">Hostel Accommodation Inquiry</h3>
            <p className="text-xs text-slate-500">Apply for a bed in {currentHostel.name} ({selectedSharing})</p>

            <form onSubmit={handleApply} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohit Sharma"
                  defaultValue="Rohit Sharma"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#263D88]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Roll / Application ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CC-2026-8942"
                  defaultValue="CC-2026-8942"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#263D88]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Diet Preference</label>
                <select className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#263D88]">
                  <option>Vegetarian</option>
                  <option>Non-Vegetarian</option>
                  <option>Jain / Special</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInquiryModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#263D88] text-white text-xs font-bold"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
