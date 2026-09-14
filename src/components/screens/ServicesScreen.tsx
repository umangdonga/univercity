import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceType } from '../../types';
import { Header } from '../common/Header';
import {
  Utensils,
  Home,
  Bus,
  BookOpen,
  GraduationCap,
  Headphones,
  Car,
  FolderClosed,
  Search,
  X,
  Layers,
} from 'lucide-react';

export const ServicesScreen: React.FC = () => {
  const { openService } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');

  // The exact 8 primary campus services shown in Figma Page 55
  const servicesList: {
    id: ServiceType;
    title: string;
    subtitle: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      id: 'bus',
      title: 'Bus service',
      subtitle: 'Menu & Specials',
      icon: Bus,
    },
    {
      id: 'admission',
      title: 'Admission',
      subtitle: 'Status & Faqs',
      icon: GraduationCap,
    },
    {
      id: 'hostel',
      title: 'Hostel',
      subtitle: 'Room info',
      icon: Home,
    },
    {
      id: 'library',
      title: 'Library',
      subtitle: 'Book Service',
      icon: BookOpen,
    },
    {
      id: 'canteen',
      title: 'Canteen Menu',
      subtitle: 'Room info',
      icon: Utensils,
    },
    {
      id: 'support',
      title: 'Support',
      subtitle: 'Student,faculty,other',
      icon: Headphones,
    },
    {
      id: 'parking',
      title: 'Parking',
      subtitle: 'Availability',
      icon: Car,
    },
    {
      id: 'courses',
      title: 'Course',
      subtitle: 'Information',
      icon: FolderClosed,
    },
  ];

  const filteredServices = servicesList.filter((service) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      service.title.toLowerCase().includes(query) ||
      service.subtitle.toLowerCase().includes(query)
    );
  });

  return (
    <div id="services-screen-page" className="bg-[#F4F7FB] min-h-screen pb-24 font-['Poppins',sans-serif]">
      {/* Standard Header */}
      <Header title="Campus Services" />

      <main className="px-4 py-4 space-y-4 max-w-md mx-auto sm:max-w-xl md:max-w-2xl">
        {/* Figma Page 55: Search Input with "Finding building,lab and classroom" placeholder */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Finding building,lab and classroom"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0C3558] text-[#101214] placeholder:text-slate-400 shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3 p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Figma Page 55: 2-Column Grid of 8 Deep Navy Cards */}
        <div className="grid grid-cols-2 gap-3.5 pt-1">
          {filteredServices.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-white rounded-3xl p-6 border border-slate-100">
              <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No matching service found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Try searching for Bus, Admission, Hostel, or Library</p>
            </div>
          ) : (
            filteredServices.map((service) => {
              const Icon = service.icon;

              return (
                <div
                  key={service.id}
                  id={`service-card-${service.id}`}
                  onClick={() => openService(service.id)}
                  className="bg-[#0C3558] hover:bg-[#12426c] text-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center text-center group active:scale-[0.98] min-h-[140px]"
                >
                  {/* Icon in top center */}
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Title & Subtitle */}
                  <h2 className="text-sm font-bold text-white tracking-tight leading-tight">
                    {service.title}
                  </h2>
                  <p className="text-[11px] text-white/70 mt-1 font-medium">
                    {service.subtitle}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

