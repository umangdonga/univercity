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
    return (
      <header className="pt-7 px-5 pb-5 bg-[#263D88] text-white rounded-b-[32px] shadow-md relative z-30 transition-all">
        {/* User Info & Notification */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-3 text-left group focus:outline-none"
            title="View Profile"
          >
            <div className="w-10 h-10 rounded-full bg-[#53AADF] border-2 border-white flex items-center justify-center font-bold text-white shadow-sm overflow-hidden text-xs shrink-0 group-hover:scale-105 transition-transform">
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
            <div>
              <p className="text-[10px] opacity-80 uppercase tracking-wider font-medium">Welcome back,</p>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold tracking-tight truncate max-w-[160px]">{user.name}</p>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-white/20 text-white uppercase tracking-wider border border-white/30">
                  {user.role}
                </span>
              </div>
            </div>
          </button>

          <div className="relative">
            <button
              onClick={() => {
                const unread = notifications.find((n) => !n.read) || notifications[0];
                setActiveNotifModal(unread);
              }}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors active:scale-95 focus:outline-none"
              aria-label="Notifications"
              title="Campus Notifications"
            >
              <Bell className="w-5 h-5 text-white" />
            </button>
            {unreadCount > 0 && (
              <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#FF0000] rounded-full border-2 border-[#263D88] animate-pulse" />
            )}
          </div>
        </div>

        {/* Embedded Search Input */}
        <div
          onClick={() => setIsSearchOpen(true)}
          className="relative cursor-pointer group"
        >
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 group-hover:text-white transition-colors">
            <Search className="w-4 h-4" />
          </span>
          <div className="w-full bg-white/20 hover:bg-white/25 border border-white/30 rounded-2xl py-2.5 pl-11 pr-4 text-xs text-white placeholder:text-white/70 outline-none flex items-center justify-between transition-all">
            <span className="text-white/80 font-normal">Search buildings, labs, canteen...</span>
            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-lg text-white">
              Ctrl+K
            </span>
          </div>
        </div>
      </header>
    );
  }

  // Standard Header for Subpages
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 shadow-[0_2px_12px_rgba(38,61,136,0.04)]">
      <div className="flex items-center justify-between gap-3">
        {showBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#263D88] hover:text-[#53AADF] transition-colors py-1 px-2 rounded-xl hover:bg-slate-50 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : (
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setActiveTab('profile')}
              className="relative shrink-0 rounded-full ring-2 ring-[#53AADF]/30 hover:ring-[#263D88] transition-all p-0.5"
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
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Campus Connect</p>
                  <h1 className="text-sm font-bold text-[#101214] truncate">{user.name}</h1>
                </>
              )}
            </div>
          </div>
        )}

        {/* Right Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              const unread = notifications.find((n) => !n.read) || notifications[0];
              setActiveNotifModal(unread);
            }}
            className="relative p-2 rounded-xl bg-[#F4F7FB] text-[#263D88] hover:bg-[#BADDF2]/40 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-[#263D88]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center bg-[#FF0000] text-white text-[9px] font-bold rounded-full px-1 shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

