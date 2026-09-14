import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, ChevronLeft, Search } from 'lucide-react';

interface HeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
  isHomeBanner?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  showBack = false,
  onBack,
  title,
  subtitle,
  isHomeBanner = false,
}) => {
  const { user, unreadCount, setActiveTab, setActiveNotifModal, notifications, setIsSearchOpen } = useApp();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'JD';
  };

  if (isHomeBanner) {
    const todayFormatted = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(new Date());

    const firstName = user.name ? user.name.split(' ')[0] : 'Umang';

    return (
      <header className="relative z-30 font-['Poppins',sans-serif]">
        {/* Campus Amphitheater Banner matching Figma Page 15 */}
        <div className="relative h-56 rounded-b-[36px] overflow-hidden shadow-md flex flex-col justify-between p-5 text-white">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1000&auto=format&fit=crop&q=80"
            alt="Campus Amphitheater"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/75" />

          {/* Top Row: Date, Greeting & Notification Bell Button */}
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-white/80">{todayFormatted}</p>
              <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">
                Good Morning , {firstName}
              </h1>
            </div>

            <button
              onClick={() => {
                const unread = notifications.find((n) => !n.read) || notifications[0];
                setActiveNotifModal(unread);
              }}
              className="w-11 h-11 rounded-2xl bg-[#0C3558] hover:bg-[#12426c] flex items-center justify-center text-white shadow-md relative cursor-pointer active:scale-95 transition-all"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-white fill-white" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#FF0000] rounded-full border-2 border-[#0C3558] animate-pulse" />
              )}
            </button>
          </div>

          {/* Bottom Row in Banner: Pure White Pill Search Bar */}
          <div
            onClick={() => setIsSearchOpen(true)}
            className="relative z-10 w-full bg-white rounded-2xl py-3 px-4 shadow-lg flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Search className="w-4 h-4 text-[#0C3558] shrink-0" />
              <span className="text-xs text-slate-500 font-medium truncate">
                Finding building,lab and classroom
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#F4F7FB] text-[#0C3558] border border-slate-200 shrink-0">
              Search
            </span>
          </div>
        </div>
      </header>
    );
  }

  // Standard Header for Subpages
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 shadow-[0_2px_12px_rgba(38,61,136,0.04)] font-['Poppins',sans-serif]">
      <div className="flex items-center justify-between gap-2.5">
        {showBack ? (
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-xs font-bold text-[#263D88] hover:text-[#53AADF] transition-colors py-1.5 px-2.5 rounded-xl bg-slate-100/90 hover:bg-[#BADDF2]/50 active:scale-95 shrink-0 border border-slate-200/60 cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden xs:inline">Back</span>
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-bold text-[#101214] truncate tracking-tight">
                {title || 'Campus Connect'}
              </h1>
              {subtitle && (
                <p className="text-[10px] text-slate-500 truncate leading-tight">{subtitle}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <button
              onClick={() => setActiveTab('profile')}
              className="relative shrink-0 rounded-full ring-2 ring-[#53AADF]/30 hover:ring-[#263D88] transition-all p-0.5 cursor-pointer"
              title="View Profile"
            >
              <div className="w-9 h-9 rounded-full bg-[#53AADF] flex items-center justify-center font-bold text-white text-xs overflow-hidden shadow-xs">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span>{getInitials(user.name)}</span>
                )}
              </div>
            </button>
            <div className="min-w-0">
              {title ? (
                <>
                  <h1 className="text-sm font-bold text-[#101214] truncate tracking-tight">{title}</h1>
                  {subtitle && <p className="text-[10px] text-slate-400 truncate">{subtitle}</p>}
                </>
              ) : (
                <>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Campus Connect</p>
                  <h1 className="text-sm font-bold text-[#101214] truncate">{user.name}</h1>
                </>
              )}
            </div>
          </div>
        )}

        {/* Right Action */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              const unread = notifications.find((n) => !n.read) || notifications[0];
              setActiveNotifModal(unread);
            }}
            className="relative p-2 rounded-xl bg-[#F4F7FB] text-[#263D88] hover:bg-[#BADDF2]/40 transition-colors cursor-pointer border border-slate-200/60"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-[#263D88]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center bg-[#FF0000] text-white text-[9px] font-bold rounded-full px-1 shadow-xs animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

