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
import { Toast } from './components/common/Toast';
import { Smartphone, Monitor } from 'lucide-react';

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

  if (!user.isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-0 sm:p-4">
        <div className="w-full max-w-md mx-auto min-h-screen sm:min-h-0">
          <AuthScreen />
        </div>
      </div>
    );
  }

  // Only prompt for profile completion if not authenticated with Google and profile explicitly pending
  if (!user.profileCompleted && !user.isAuthenticatedWithGoogle) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-2 sm:p-4 font-['Poppins',sans-serif]">
        <div className="w-full max-w-lg mx-auto">
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

          {/* Modals & Overlays */}
          <AppointmentPassModal />
          <BusPassModal />
          <NotificationDetailModal />
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
