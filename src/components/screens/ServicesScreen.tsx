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
  FlaskConical,
  ChevronRight,
} from 'lucide-react';

export const ServicesScreen: React.FC = () => {
  const { openService } = useApp();

  const servicesList: {
    id: ServiceType;
    title: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    iconBg: string;
  }[] = [
    {
      id: 'bus',
      title: 'Bus Services & Pass',
      description: 'Live shuttle routes, departure timings, and multi-step digital pass applications.',
      icon: Bus,
      iconBg: 'bg-blue-50 text-[#263D88]',
    },
    {
      id: 'canteen',
      title: 'Canteens & Dining',
      description: 'S Y Cafe & food court menus, ratings, operating hours, and verified reviews.',
      icon: Utensils,
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      id: 'library',
      title: 'Central Library',
      description: 'Catalog search, book reservations, renewal desk, and overdue penalty clearance.',
      icon: BookOpen,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'courses',
      title: 'Courses & Programs',
      description: 'Curriculum catalogs, syllabi, fee structures, and department academic guides.',
      icon: GraduationCap,
      iconBg: 'bg-indigo-50 text-indigo-600',
    },
    {
      id: 'hostel',
      title: 'Hostel & Residence',
      description: 'Campus residence blocks, room sharing plans, warden contacts, and rules.',
      icon: Home,
      iconBg: 'bg-purple-50 text-purple-600',
    },
    {
      id: 'admission',
      title: 'Admissions & Inquiries',
      description: 'Book verified counseling appointments, schedule campus visits, and visitor slips.',
      icon: Building2,
      iconBg: 'bg-rose-50 text-rose-600',
    },
    {
      id: 'parking',
      title: 'Campus Parking',
      description: 'Live sensor vacancy tracking for student, faculty, and visitor parking lots.',
      icon: Car,
      iconBg: 'bg-cyan-50 text-cyan-700',
    },
    {
      id: 'labs',
      title: 'Labs & Research Facilities',
      description: 'Computer systems labs, innovation hubs, physics & chemistry research centers.',
      icon: FlaskConical,
      iconBg: 'bg-teal-50 text-teal-700',
    },
    {
      id: 'support',
      title: 'Support & Emergency SOS',
      description: '24/7 security control room, grievance ticketing, and student welfare desk.',
      icon: Headphones,
      iconBg: 'bg-red-50 text-red-600',
    },
  ];

  return (
    <div id="services-screen-page" className="bg-[#F4F7FB] min-h-screen pb-24 font-['Poppins',sans-serif]">
      <Header />

      <main className="px-4 py-4 space-y-3.5 max-w-md mx-auto sm:max-w-xl md:max-w-2xl">
        <div className="px-1">
          <h1 className="text-base font-bold text-[#101214] tracking-tight">Campus Services</h1>
          <p className="text-xs text-slate-500">Tap any service to view full details and apply</p>
        </div>

        {/* Clean & Compact Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {servicesList.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.id}
                id={`service-card-${service.id}`}
                onClick={() => openService(service.id)}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-[#53AADF] shadow-xs hover:shadow-md transition-all cursor-pointer flex items-start gap-3.5 group active:scale-[0.99]"
              >
                {/* 1. Service Logo / Icon */}
                <div
                  className={`w-11 h-11 rounded-xl shrink-0 ${service.iconBg} flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* 2. Service Name & 3. Short Description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h2 className="text-xs font-bold text-[#101214] group-hover:text-[#263D88] transition-colors truncate">
                      {service.title}
                    </h2>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#263D88] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

