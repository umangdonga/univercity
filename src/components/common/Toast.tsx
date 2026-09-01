import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none px-4 w-full max-w-sm">
      <div className="bg-[#101214]/95 backdrop-blur-md text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-white/15 flex items-center gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="truncate">{toastMessage}</span>
      </div>
    </div>
  );
};
