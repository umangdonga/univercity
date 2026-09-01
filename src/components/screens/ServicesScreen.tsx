import React from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceType } from '../../types';
import { Header } from '../common/Header';
import {
  Utensils,
  Home,
  Bus,
  BookOpen,
  GraduationCap,
  Building2,
  Car,
  Headphones,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';

export const ServicesScreen: React.FC = () => {
  const { openService } = useApp();

  const servicesList: {
    id: ServiceType;
    title: string;
    description: string;
    badge: string;
    icon: React.FC<{ className?: string }>;
    accentColor: string;
    iconBg: string;
  }[] = [
    {
      id: 'canteen',
      title: 'Canteens & Dining',
      description: 'S Y Cafe & UNIQUE Canteen menus, ratings, timings & live reviews.',
      badge: 'Open Now',
      icon: Utensils,
      accentColor: 'text-amber-600',
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      id: 'hostel',
      title: 'Hostel & Residence',
      description: 'Block A & B, room sharing plans, fees, rules & warden direct desk.',
      badge: 'Beds Available',
      icon: Home,
      accentColor: 'text-purple-600',
      iconBg: 'bg-purple-50 text-purple-600',
    },
    {
      id: 'bus',
      title: 'Bus Schedules & Pass',
      description: 'Route 1-5, Bus #12, live departure times & digital student pass.',
      badge: 'Real Timings',
      icon: Bus,
      accentColor: 'text-blue-600',
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      id: 'library',
      title: 'Knowledge Tower Library',
      description: 'Issued books tracking, overdue fine clearance, and catalog reservation.',
      badge: '1 Book Overdue',
      icon: BookOpen,
      accentColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'courses',
      title: 'Courses & Academics',
      description: 'BCA, B.Tech, M.Des, MBA branch catalog, fees & syllabus.',
      badge: 'Admissions Open',
      icon: GraduationCap,
      accentColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50 text-indigo-600',
    },
    {
      id: 'admission',
      title: 'Admission Inquiry Pass',
      description: 'Book official counseling appointment & get verified visitor pass.',
      badge: 'Visitor Slip',
      icon: Building2,
      accentColor: 'text-rose-600',
      iconBg: 'bg-rose-50 text-rose-600',
    },
    {
      id: 'parking',
      title: 'Parking Slot Finder',
      description: 'Live sensor tracking for North Gate lot with 6 slots available.',
      badge: '6 Free Slots',
      icon: Car,
      accentColor: 'text-cyan-600',
      iconBg: 'bg-cyan-50 text-cyan-600',
    },
    {
      id: 'support',
      title: 'Help & Emergency SOS',
      description: '24/7 security helpline, grievance ticketing & campus assistance.',
      badge: '24/7 SOS Active',
      icon: Headphones,
      accentColor: 'text-red-600',
      iconBg: 'bg-red-50 text-red-600',
    },
  ];

  return (
    <div className="bg-[#F4F7FB] min-h-screen pb-24 font-['Poppins',sans-serif]">
      <Header />

      <main className="px-4 py-4 space-y-4 max-w-md mx-auto sm:max-w-xl md:max-w-2xl">
        <div className="flex items-center justify-between px-1">
          <div>
            <h1 className="text-base font-bold text-[#101214] tracking-tight">Campus Services Directory</h1>
            <p className="text-xs text-slate-400">All campus utilities & student facilities in one place</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {servicesList.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.id}
                onClick={() => openService(service.id)}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs hover:border-[#53AADF] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group active:scale-[0.99]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-11 h-11 rounded-2xl ${service.iconBg} flex items-center justify-center transition-transform group-hover:scale-105`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#BADDF2]/40 text-[#263D88]">
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#101214] group-hover:text-[#263D88] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-[#263D88]">
                  <span>Explore Service</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
