import React from 'react';
import { useApp } from '../../context/AppContext';
import { MainTab } from '../../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, isNavigating } = useApp();

  const navItems: {
    id: MainTab;
    label: string;
    renderIcon: (isActive: boolean) => React.ReactNode;
  }[] = [
    {
      id: 'home',
      label: 'Home',
      renderIcon: (isActive) => (
        <svg
          viewBox="0 0 24 24"
          className={`w-6 h-6 transition-transform duration-200 ${
            isActive ? 'text-[#0C3558] scale-105' : 'text-[#809FB8]'
          }`}
          fill="currentColor"
        >
          <path d="M12 3L2 12h3v8h5v-5h4v5h5v-8h3L12 3z" />
        </svg>
      ),
    },
    {
      id: 'navigation',
      label: 'Step Guide',
      renderIcon: (isActive) => (
        <svg
          viewBox="0 0 24 24"
          className={`w-6 h-6 transition-transform duration-200 ${
            isActive ? 'text-[#0C3558] scale-105' : 'text-[#809FB8]'
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth={isActive ? '2.4' : '2'}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Step guide list with directional arrow */}
          <line x1="10" y1="6" x2="21" y2="6" />
          <line x1="10" y1="12" x2="21" y2="12" />
          <line x1="10" y1="18" x2="21" y2="18" />
          <polyline points="3 6 5 8 7 6" />
          <polyline points="3 14 5 12 7 14" />
        </svg>
      ),
    },
    {
      id: 'services',
      label: 'Service',
      renderIcon: (isActive) => (
        <svg
          viewBox="0 0 24 24"
          className={`w-6 h-6 transition-transform duration-200 ${
            isActive ? 'text-[#0C3558] scale-105' : 'text-[#809FB8]'
          }`}
          fill="currentColor"
        >
          {/* 4 network nodes with connecting horizontal & vertical lines as in Figma Page 1 */}
          <circle cx="6" cy="6" r="3" />
          <circle cx="18" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="18" r="3" />
          <rect x="5" y="6" width="2" height="12" rx="1" />
          <rect x="17" y="6" width="2" height="12" rx="1" />
          <rect x="6" y="5" width="12" height="2" rx="1" />
        </svg>
      ),
    },
    {
      id: 'profile',
      label: 'Profile',
      renderIcon: (isActive) => (
        <svg
          viewBox="0 0 24 24"
          className={`w-6 h-6 transition-transform duration-200 ${
            isActive ? 'text-[#0C3558] scale-105' : 'text-[#809FB8]'
          }`}
          fill="currentColor"
        >
          <circle cx="12" cy="7" r="4.5" />
          <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8v1H4v-1z" />
        </svg>
      ),
    },
  ];

  const activeIndex = navItems.findIndex((item) => item.id === activeTab);

  return (
    <nav className="sticky bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_25px_rgba(12,53,88,0.08)]">
      {/* Page 1: Smooth sliding blue indicator capsule attached to top border */}
      <div className="relative w-full max-w-md mx-auto">
        <div
          className="absolute top-0 h-1.5 rounded-b-lg bg-gradient-to-r from-[#0C3558] via-[#1F5C8B] to-[#0C3558] shadow-xs transition-all duration-300 ease-out"
          style={{
            width: '42px',
            left: `calc(${(activeIndex + 0.5) * 25}% - 21px)`,
          }}
        />
      </div>

      <div className="flex items-center justify-around py-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex-1 flex flex-col items-center justify-center py-1 group cursor-pointer focus:outline-none"
            >
              <div className="relative flex items-center justify-center">
                {item.renderIcon(isActive)}

                {/* Pulsing indicator when navigating */}
                {item.id === 'navigation' && isNavigating && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white animate-ping" />
                )}
              </div>

              <span
                className={`text-[11px] mt-1 tracking-tight transition-colors duration-150 ${
                  isActive ? 'text-[#0C3558] font-bold' : 'text-[#809FB8] font-medium'
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
