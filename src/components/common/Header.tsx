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
            <div className="relative">
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
              {user.isAuthenticatedWithGoogle && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                </div>
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
            <span className="text-white/90 font-normal">Search buildings, labs, canteen...</span>
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

