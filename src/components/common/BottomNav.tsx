import React from 'react';
import { useApp } from '../../context/AppContext';
import { MainTab } from '../../types';
import { Home, Navigation, LayoutGrid, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, unreadCount, isNavigating } = useApp();

  const navItems: { id: MainTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'navigation', label: 'Map', icon: Navigation },
    { id: 'services', label: 'Services', icon: LayoutGrid },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="sticky bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-lg border-t border-slate-100 shadow-[0_-4px_20px_rgba(38,61,136,0.06)] px-4 py-2">
      <div className="flex items-center justify-between px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-[#263D88] font-bold scale-105'
                  : 'text-gray-400 font-medium hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive ? 'text-[#263D88]' : 'text-gray-400'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-[#263D88] stroke-[2.4]' : 'text-gray-400'
                    }`}
                  />
                </div>

                {/* Badge indicators */}
                {item.id === 'navigation' && isNavigating && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white animate-ping" />
                )}
              </div>

              <span
                className={`text-[10px] tracking-tight ${
                  isActive ? 'text-[#263D88] font-bold' : 'text-gray-400 font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
