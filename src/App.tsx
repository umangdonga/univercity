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
    <div className="min-h-screen bg-white flex flex-col text-[#101214] font-['Poppins',sans-serif] relative overflow-x-hidden">
      {/* Main Canvas Area */}
      <div className="w-full h-[100dvh] flex flex-col relative mx-auto">
        {/* Scrollable Screen Content */}
        <div className="flex-1 overflow-y-auto relative w-full" style={{ scrollbarWidth: 'thin' }}>
          {renderTabContent()}
        </div>

        {/* Sticky Global Bottom Navigation (hide when search or sub-service is open) */}
        {!isSearchOpen && !activeService && (
          <div className="w-full max-w-screen-xl mx-auto">
            <BottomNav />
          </div>
        )}

        {/* Modals & Overlays */}
        <AppointmentPassModal />
        <BusPassModal />
        <NotificationDetailModal />
        <Toast />
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
