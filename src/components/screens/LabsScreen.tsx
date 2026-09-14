import React from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { CAMPUS_LOCATIONS } from '../../data/mockCampusData';
import { FlaskConical, Navigation, Clock, Users, Laptop, Cpu, Atom, Sparkles } from 'lucide-react';

interface LabsScreenProps {
  onBack: () => void;
}

export const LabsScreen: React.FC<LabsScreenProps> = ({ onBack }) => {
  const { startNavigationTo, showToast, user, triggerGuestRestriction } = useApp();

  const labs = [
    {
      id: 'innovation-lab',
      name: 'Advanced Innovation & Robotics Lab',
      code: 'LAB-A101',
      building: 'Knowledge Tower • 1st Floor',
      capacity: '45 Workstations',
      status: 'Open (18 available)',
      icon: Cpu,
      timings: '08:00 AM - 08:00 PM',
      equipment: 'NVIDIA RTX Workstations, 3D Printers, ROS Robotic Arms',
    },
    {
      id: 'computer-systems-lab',
      name: 'Cloud Computing & Cyber Systems Lab',
      code: 'LAB-C204',
      building: 'B-Block • 2nd Floor',
      capacity: '60 Terminals',
      status: 'In Session until 03:30 PM',
      icon: Laptop,
      timings: '09:00 AM - 06:00 PM',
      equipment: 'Gigabit Fiber, Kubernetes Clusters, Linux Dual-boot',
    },
    {
      id: 'physics-lab',
      name: 'Applied Physics & Optics Lab',
      code: 'LAB-P102',
      building: 'Science Pavilion • Ground Floor',
      capacity: '30 Stations',
      status: 'Open (12 available)',
      icon: Atom,
      timings: '09:30 AM - 05:30 PM',
      equipment: 'Spectrophotometers, Laser Interferometers, Digital Oscilloscopes',
    },
  ];

  const handleBookLab = (labName: string) => {
    if (user.role === 'guest') {
      triggerGuestRestriction('Lab Workstation Reservation');
      return;
    }
    showToast(`Workstation reserved at ${labName}! QR pass added to your dashboard.`);
  };

  return (
    <div id="labs-screen-page" className="bg-[#F4F7FB] min-h-screen pb-24 font-['Poppins',sans-serif]">
      {/* 8. Functional Back Button in Header */}
      <Header showBack={true} onBack={onBack} title="Labs & Research Facilities" subtitle="Campus Research & Computing Hubs" />

      <main className="px-4 py-4 space-y-4 max-w-md mx-auto sm:max-w-xl md:max-w-2xl">
        <div className="bg-[#263D88] text-white p-5 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#53AADF] text-white uppercase tracking-wider">
              Research Infrastructure
            </span>
            <h2 className="text-base font-bold mt-2 text-white">University Computing & Specialized Labs</h2>
            <p className="text-xs text-blue-100 mt-1 leading-relaxed">
              Equipped with high-performance clusters, rapid prototyping tools, and certified safety equipment.
            </p>
          </div>
          <FlaskConical className="w-24 h-24 absolute -right-4 -bottom-4 text-white/10 pointer-events-none" />
        </div>

        <div className="space-y-3">
          {labs.map((lab) => {
            const Icon = lab.icon;
            return (
              <div
                key={lab.id}
                id={`lab-card-${lab.id}`}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#101214]">{lab.name}</h3>
                      <p className="text-[11px] text-slate-500">{lab.building} • {lab.code}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    {lab.status}
                  </span>
                </div>

                <div className="bg-[#F4F7FB] p-2.5 rounded-xl text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Hours:</span>
                    <span className="font-semibold text-slate-700">{lab.timings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Equipment:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[200px]">{lab.equipment}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      const found = CAMPUS_LOCATIONS.find((l) => l.id === lab.id) || CAMPUS_LOCATIONS[0];
                      startNavigationTo(found);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#263D88] hover:bg-[#1E2F6B] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Navigation className="w-3.5 h-3.5 fill-white" />
                    <span>3D Navigate</span>
                  </button>

                  <button
                    onClick={() => handleBookLab(lab.name)}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Reserve Bench
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
