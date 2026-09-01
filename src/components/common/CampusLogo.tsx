import React from 'react';

interface CampusLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  layout?: 'vertical' | 'horizontal';
  className?: string;
  theme?: 'dark' | 'light' | 'white';
}

export const CampusLogo: React.FC<CampusLogoProps> = ({
  size = 'md',
  showTagline = false,
  layout = 'horizontal',
  className = '',
  theme = 'dark',
}) => {
  const iconSizes = {
    sm: 28,
    md: 38,
    lg: 54,
    xl: 72,
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const currentIconSize = iconSizes[size];

  return (
    <div
      className={`inline-flex items-center select-none ${
        layout === 'vertical' ? 'flex-col text-center gap-2' : 'flex-row gap-3 text-left'
      } ${className}`}
    >
      {/* 3D Geometric Cube / Bookmark Logo Icon from Case Study */}
      <svg
        width={currentIconSize}
        height={currentIconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm transition-transform hover:scale-105 duration-200"
      >
        {/* Outer Isometric Cube / Building Silhouette */}
        {/* Top Face */}
        <polygon
          points="50,10 88,30 50,50 12,30"
          fill={theme === 'white' ? '#FFFFFF' : '#263D88'}
          opacity={theme === 'white' ? 0.95 : 1}
        />
        {/* Left Face */}
        <polygon
          points="12,30 50,50 50,90 12,70"
          fill={theme === 'white' ? '#E2E8F0' : '#1E2F6B'}
        />
        {/* Right Face */}
        <polygon
          points="50,50 88,30 88,70 50,90"
          fill={theme === 'white' ? '#CBD5E1' : '#53AADF'}
        />

        {/* Inner Stylized Open Book / Navigation Core */}
        <polygon
          points="50,30 72,42 50,54 28,42"
          fill="#FFFFFF"
          opacity="0.95"
        />
        <polygon
          points="50,54 72,42 72,66 50,78"
          fill="#BADDF2"
        />
        <polygon
          points="28,42 50,54 50,78 28,66"
          fill="#FFFFFF"
        />

        {/* Center Point Sparkle / Location Beacon */}
        <circle cx="50" cy="50" r="4.5" fill="#263D88" />
        <circle cx="50" cy="50" r="2" fill="#BADDF2" />
      </svg>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className={`font-bold tracking-tight leading-none ${textSizes[size]}`}>
          <span className={theme === 'white' ? 'text-white' : 'text-[#263D88]'}>CAMPUS </span>
          <span className={theme === 'white' ? 'text-[#BADDF2]' : 'text-[#53AADF]'}>CONNECT</span>
        </div>
        {showTagline && (
          <span
            className={`text-xs mt-1 font-medium tracking-wide ${
              theme === 'white' ? 'text-blue-100/90' : 'text-slate-500'
            }`}
          >
            Smart campus life, all in one place
          </span>
        )}
      </div>
    </div>
  );
};
