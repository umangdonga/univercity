import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface ChatFloatingButtonProps {
  onClick: () => void;
}

export const ChatFloatingButton: React.FC<ChatFloatingButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 sm:right-6 z-40 p-3.5 rounded-2xl bg-gradient-to-tr from-[#263D88] to-[#53AADF] text-white shadow-xl shadow-[#263D88]/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-2 group border border-white/20"
      title="Ask CampusAI"
    >
      <div className="relative">
        <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#263D88] animate-ping" />
      </div>
      <span className="text-xs font-bold tracking-wide pr-0.5 hidden xs:inline">
        Ask AI
      </span>
      <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
    </button>
  );
};
