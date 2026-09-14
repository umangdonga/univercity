import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthScreen } from './components/screens/AuthScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { NavigationScreen } from './components/screens/NavigationScreen';
import { ServicesScreen } from './components/screens/ServicesScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { SearchScreen } from './components/screens/SearchScreen';
import { CanteenScreen } from './components/screens/CanteenScreen';
import { HostelScreen } from './components/screens/HostelScreen';
import { BusScreen } from './components/screens/BusScreen';
import { LibraryScreen } from './components/screens/LibraryScreen';
import { CoursesScreen } from './components/screens/CoursesScreen';
import { AdmissionScreen } from './components/screens/AdmissionScreen';
import { ParkingScreen } from './components/screens/ParkingScreen';
import { SupportScreen } from './components/screens/SupportScreen';
import { LabsScreen } from './components/screens/LabsScreen';
import { ProfileCompletionScreen } from './components/screens/ProfileCompletionScreen';
import { BottomNav } from './components/common/BottomNav';
import { AppointmentPassModal } from './components/common/AppointmentPassModal';
import { BusPassModal } from './components/common/BusPassModal';
import { NotificationDetailModal } from './components/common/NotificationDetailModal';
import { GuestAccessModal } from './components/common/GuestAccessModal';
import { Toast } from './components/common/Toast';
import { CampusAIChatbot } from './components/ai/CampusAIChatbot';
import { ChatFloatingButton } from './components/ai/ChatFloatingButton';
import { Smartphone, Monitor, Bot } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    user,
    activeTab,
    isSearchOpen,
    setIsSearchOpen,
    activeService,
    closeService,
    toastMessage,
  } = useApp();

  const [deviceView, setDeviceView] = useState<'mobile' | 'responsive'>('mobile');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  if (!user.isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-0 sm:p-4">
        <div className="w-full max-w-md mx-auto min-h-screen sm:min-h-0">
          <AuthScreen />
        </div>
      </div>
    );
  }

  // Mandatory Profile Completion Screen after login (for Student, Faculty, Admin)
  if (!user.profileCompleted && user.role !== 'guest') {
    return (
      <div className="min-h-screen bg-[#BADDF2]/70 sm:bg-gradient-to-br sm:from-[#BADDF2] sm:via-[#cbe4f6] sm:to-[#BADDF2] flex items-center justify-center p-0 sm:p-4 font-['Poppins',sans-serif]">
        <div className="w-full max-w-[440px] mx-auto min-h-screen sm:min-h-0 sm:rounded-[36px] overflow-hidden shadow-2xl bg-white sm:border-[6px] sm:border-[#101214]">
          <ProfileCompletionScreen />
        </div>
        <Toast />
      </div>
    );
  }

  // Render Sub-Services when selected
  const renderServiceScreen = () => {
    switch (activeService) {
      case 'canteen':
        return <CanteenScreen onBack={closeService} />;
      case 'hostel':
        return <HostelScreen onBack={closeService} />;
      case 'bus':
        return <BusScreen onBack={closeService} />;
      case 'library':
        return <LibraryScreen onBack={closeService} />;
      case 'courses':
        return <CoursesScreen onBack={closeService} />;
      case 'admission':
        return <AdmissionScreen onBack={closeService} />;
      case 'parking':
        return <ParkingScreen onBack={closeService} />;
      case 'labs':
        return <LabsScreen onBack={closeService} />;
      case 'support':
        return <SupportScreen onBack={closeService} />;
      default:
        return null;
    }
  };

  // Render Main Tabs
  const renderTabContent = () => {
    if (isSearchOpen) {
      return <SearchScreen onClose={() => setIsSearchOpen(false)} />;
    }

    if (activeService) {
      return renderServiceScreen();
    }

    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'navigation':
        return <NavigationScreen />;
      case 'services':
        return <ServicesScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#BADDF2]/70 sm:bg-gradient-to-br sm:from-[#BADDF2] sm:via-[#cbe4f6] sm:to-[#BADDF2] flex flex-col items-center justify-start text-[#101214] font-['Poppins',sans-serif] relative overflow-x-hidden">
      {/* Device View Switcher for Desktop Preview */}
      <header className="w-full bg-[#101214] border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between text-xs text-slate-300 z-50 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-[#263D88] flex items-center justify-center font-bold text-white text-xs shadow-xs">
            C
          </div>
          <span className="font-bold text-white tracking-wide">CAMPUS CONNECT</span>
          <span className="hidden sm:inline text-slate-400">• Smart campus life, all in one place</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsChatOpen(true)}
            className="px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-[#263D88] text-white hover:bg-[#53AADF] transition-all cursor-pointer shadow-xs"
            title="Open CampusAI Assistant"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">CampusAI</span>
          </button>

          <button
            onClick={() => setDeviceView('mobile')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              deviceView === 'mobile'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Phone Frame</span>
          </button>

          <button
            onClick={() => setDeviceView('responsive')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              deviceView === 'responsive'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Expanded</span>
          </button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <div className="w-full flex-1 flex items-center justify-center p-0 sm:p-4 lg:p-6 relative">
        {/* Left Side Showcase on Desktop when in Mobile View (Matching Design HTML) */}
        {deviceView === 'mobile' && (
          <div className="hidden xl:flex absolute top-12 left-10 2xl:left-16 flex-col gap-6 text-[#263D88] max-w-xs z-10 select-none animate-fadeIn">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#263D88] rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-xl">
                C
              </div>
              <div className="leading-tight">
                <h1 className="text-2xl font-bold tracking-tight text-[#263D88]">CAMPUS CONNECT</h1>
                <p className="text-[11px] font-semibold tracking-[0.2em] text-[#263D88]/80">SMART CAMPUS LIFE</p>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-bold leading-tight text-[#101214]">
                High-Fidelity Student Hub
              </h2>
              <p className="text-sm text-[#101214]/70 leading-relaxed">
                All university services integrated into a single touchpoint. Navigate Google Maps & 3D indoor blocks, ask CampusAI, manage bus routes, library, and canteen menus.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold border border-[#263D88]/20 shadow-xs text-[#263D88]">
                  STUDENT MODE
                </span>
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold border border-[#263D88]/20 shadow-xs text-[#263D88]">
                  FACULTY READY
                </span>
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold border border-[#263D88]/20 shadow-xs text-[#263D88]">
                  CAMPUS AI CHATBOT
                </span>
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold border border-[#263D88]/20 shadow-xs text-[#263D88]">
                  GOOGLE MAPS
                </span>
              </div>
            </div>
          </div>
        )}

        {/* The Mobile App Shell / Expanded View */}
        <div
          className={`w-full transition-all duration-300 relative bg-white flex flex-col ${
            deviceView === 'mobile'
              ? 'max-w-[420px] sm:w-[400px] h-[100dvh] sm:h-[840px] my-0 sm:my-2 sm:rounded-[36px] shadow-2xl sm:border-[6px] sm:border-[#101214] overflow-hidden'
              : 'max-w-4xl shadow-2xl rounded-2xl border border-slate-200 overflow-hidden min-h-[850px]'
          }`}
        >
          {/* Scrollable Screen Content */}
          <div className="flex-1 overflow-y-auto relative" style={{ scrollbarWidth: 'thin' }}>
            {renderTabContent()}
          </div>

          {/* Sticky Global Bottom Navigation (hide when search or sub-service is open) */}
          {!isSearchOpen && !activeService && <BottomNav />}

          {/* Floating AI Chatbot trigger button */}
          {!isChatOpen && <ChatFloatingButton onClick={() => setIsChatOpen(true)} />}

          {/* CampusAI Chatbot Modal Drawer */}
          <CampusAIChatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

          {/* Modals & Overlays */}
          <AppointmentPassModal />
          <BusPassModal />
          <NotificationDetailModal />
          <GuestAccessModal />
          <Toast />
        </div>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
