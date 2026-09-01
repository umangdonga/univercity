import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  MainTab,
  ServiceType,
  CampusLocation,
  NavigationRoute,
  NavStep,
  NotificationItem,
  AdmissionAppointment,
  CanteenReview,
  LibraryBook,
} from '../types';
import {
  CAMPUS_LOCATIONS,
  NOTIFICATIONS_DATA,
  CANTEENS_DATA,
  CAMPUS_EVENTS_DATA,
  LIBRARY_BOOKS_DATA,
} from '../data/mockCampusData';
import { openGoogleOAuthPopup, GoogleUserPayload } from '../utils/googleAuth';
import confetti from 'canvas-confetti';

interface AppContextType {
  // Auth & Profile
  user: UserProfile;
  isLoggedIn: boolean;
  isLoggingIn: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithCredentials: (email: string, role: UserRole, name?: string) => void;
  loginAsGuest: () => void;
  logout: () => void;
  updateUserRole: (role: UserRole) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;

  // Navigation
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  activeService: ServiceType;
  setActiveService: (service: ServiceType) => void;
  openService: (service: ServiceType) => void;
  closeService: () => void;

  // Search & Locations
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  selectedLocation: CampusLocation | null;
  setSelectedLocation: (loc: CampusLocation | null) => void;

  // 3D Campus Navigation
  navDestination: CampusLocation | null;
  navOrigin: CampusLocation;
  isNavigating: boolean;
  currentNavStepIndex: number;
  isVoiceGuidanceEnabled: boolean;
  setIsVoiceGuidanceEnabled: (enabled: boolean) => void;
  selectedFloor: string;
  setSelectedFloor: (floor: string) => void;
  startNavigationTo: (location: CampusLocation) => void;
  stopNavigation: () => void;
  nextNavStep: () => void;
  prevNavStep: () => void;
  activeRoute: NavigationRoute | null;

  // Notifications
  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  activeNotifModal: NotificationItem | null;
  setActiveNotifModal: (notif: NotificationItem | null) => void;

  // Services Bookings & Passes
  appointments: AdmissionAppointment[];
  addAppointment: (appointment: Omit<AdmissionAppointment, 'id' | 'ticketId' | 'createdAt' | 'status'>) => AdmissionAppointment;
  bookAppointment: (params: { fullName: string; department: string; date: string; timeSlot: string; purpose?: string }) => void;
  activeAppointmentPass: AdmissionAppointment | null;
  setActiveAppointmentPass: (pass: AdmissionAppointment | null) => void;

  busPasses: { routeNumber: string; busNumber: string; studentName: string; issueDate: string; ticketId: string }[];
  registerForBus: (routeNumber: string, busNumber: string) => void;
  registerBusPass: (routeNumber: string, busNumber: string) => void;
  activeBusTicket: any | null;
  setActiveBusTicket: (ticket: any | null) => void;

  // Library Management
  issuedBooks: LibraryBook[];
  renewBook: (bookId: string) => void;
  payLibraryFine: (bookId: string) => void;
  reserveBook: (bookId: string) => void;

  registeredEvents: string[];
  toggleEventRegistration: (eventId: string) => void;
  activeEventModal: any | null;
  setActiveEventModal: (event: any | null) => void;

  // Canteen Reviews
  canteenReviews: Record<string, CanteenReview[]>;
  addCanteenReview: (canteenId: string, rating: number, comment: string) => void;

  // UI Presentation Mode
  previewMode: 'mobile-frame' | 'responsive-desktop';
  setPreviewMode: (mode: 'mobile-frame' | 'responsive-desktop') => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-20240582',
  name: 'Rohit Sharma',
  email: 'rohit.sharma@university.edu',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  role: 'student',
  studentId: '20240582',
  branch: 'Computer Science (BCA)',
  contact: '+1 (555) 012 3456',
  dob: '12 May 2002',
  occupation: 'Student',
  isAuthenticatedWithGoogle: false,
  isAuthenticated: true,
  twoFactorEnabled: true,
  privacyShareAcademic: true,
  notificationsEnabled: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication State
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('campus_connect_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.isAuthenticated = parsed.isAuthenticated ?? true;
      return parsed;
    }
    return DEFAULT_USER;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('campus_connect_logged_in') !== 'false';
  });

  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Tab & Service routing
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [activeService, setActiveService] = useState<ServiceType>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('campus_connect_recent_searches');
    return saved ? JSON.parse(saved) : ['S Y Cafe', 'Knowledge Tower', 'Bus #12', 'Library Overdue'];
  });
  const [selectedLocation, setSelectedLocation] = useState<CampusLocation | null>(null);

  // Navigation State
  const [navOrigin] = useState<CampusLocation>(CAMPUS_LOCATIONS[0]);
  const [navDestination, setNavDestination] = useState<CampusLocation | null>(CAMPUS_LOCATIONS[1]);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [currentNavStepIndex, setCurrentNavStepIndex] = useState<number>(0);
  const [isVoiceGuidanceEnabled, setIsVoiceGuidanceEnabled] = useState<boolean>(true);
  const [selectedFloor, setSelectedFloor] = useState<string>('Ground Floor');

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('campus_connect_notifications');
    return saved ? JSON.parse(saved) : NOTIFICATIONS_DATA;
  });
  const [activeNotifModal, setActiveNotifModal] = useState<NotificationItem | null>(null);

  // Services & Passes
  const [appointments, setAppointments] = useState<AdmissionAppointment[]>(() => {
    const saved = localStorage.getItem('campus_connect_appointments');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'apt-001',
            ticketId: 'ADM-2026-9481',
            fullName: 'Rohit Sharma',
            department: 'Master of Design (M.Des)',
            date: 'Mon, Oct 26, 2026',
            timeSlot: '10:30 AM',
            purpose: 'Portfolio Review & Campus Tour',
            status: 'confirmed',
            createdAt: '2026-09-01',
          },
        ];
  });
  const [activeAppointmentPass, setActiveAppointmentPass] = useState<AdmissionAppointment | null>(null);

  const [busPasses, setBusPasses] = useState<{ routeNumber: string; busNumber: string; studentName: string; issueDate: string; ticketId: string }[]>(() => {
    const saved = localStorage.getItem('campus_connect_bus_passes');
    return saved
      ? JSON.parse(saved)
      : [
          {
            routeNumber: 'Route 1 (North City Express)',
            busNumber: 'Bus #12 (KA-01-F-8821)',
            studentName: 'Rohit Sharma',
            issueDate: 'Fall Term 2026',
            ticketId: 'BUS-PASS-8821-V4',
          },
        ];
  });
  const [activeBusTicket, setActiveBusTicket] = useState<any | null>(null);

  // Library state
  const [issuedBooks, setIssuedBooks] = useState<LibraryBook[]>(() => {
    const saved = localStorage.getItem('campus_connect_issued_books');
    return saved ? JSON.parse(saved) : LIBRARY_BOOKS_DATA.slice(0, 3);
  });

  const [registeredEvents, setRegisteredEvents] = useState<string[]>(['event-science-fair']);
  const [activeEventModal, setActiveEventModal] = useState<any | null>(null);

  const [canteenReviews, setCanteenReviews] = useState<Record<string, CanteenReview[]>>(() => {
    const initial: Record<string, CanteenReview[]> = {};
    CANTEENS_DATA.forEach((c) => {
      initial[c.id] = c.reviews;
    });
    return initial;
  });

  const [previewMode, setPreviewMode] = useState<'mobile-frame' | 'responsive-desktop'>('mobile-frame');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('campus_connect_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('campus_connect_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('campus_connect_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('campus_connect_bus_passes', JSON.stringify(busPasses));
  }, [busPasses]);

  useEffect(() => {
    localStorage.setItem('campus_connect_issued_books', JSON.stringify(issuedBooks));
  }, [issuedBooks]);

  // Auth Methods
  const loginWithGoogle = async () => {
    setIsLoggingIn(true);
    try {
      const googleUser = await openGoogleOAuthPopup();
      const updatedUser: UserProfile = {
        ...user,
        id: `usr-${(googleUser.id || 'google').slice(0, 8)}`,
        name: googleUser.name,
        email: googleUser.email,
        avatar: googleUser.picture,
        isAuthenticatedWithGoogle: true,
        isAuthenticated: true,
        role: 'student',
      };
      setUser(updatedUser);
      setIsLoggedIn(true);
      localStorage.setItem('campus_connect_logged_in', 'true');
      showToast(`Welcome back, ${googleUser.name}!`);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch (err: any) {
      console.warn('Google login popup cancelled or error:', err);
      // Fallback guest login with toast
      showToast('Continuing with student profile');
      setUser({ ...user, isAuthenticated: true });
      setIsLoggedIn(true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const loginWithCredentials = (email: string, role: UserRole, name?: string) => {
    const updatedUser: UserProfile = {
      ...user,
      email,
      role,
      name: name || (email.split('@')[0].replace('.', ' ').toUpperCase()),
      isAuthenticated: true,
    };
    setUser(updatedUser);
    setIsLoggedIn(true);
    localStorage.setItem('campus_connect_logged_in', 'true');
    showToast(`Signed in as ${updatedUser.name} (${role})`);
  };

  const loginAsGuest = () => {
    const guestUser: UserProfile = {
      ...user,
      id: 'guest-visitor',
      name: 'Campus Visitor',
      email: 'visitor@guest.edu',
      role: 'guest',
      studentId: 'VISITOR-2026',
      isAuthenticated: true,
    };
    setUser(guestUser);
    setIsLoggedIn(true);
    localStorage.setItem('campus_connect_logged_in', 'true');
    showToast('Welcome Visitor! Exploring in Guest Mode');
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser({ ...user, isAuthenticated: false });
    localStorage.setItem('campus_connect_logged_in', 'false');
    showToast('Signed out successfully.');
  };

  const updateUserRole = (role: UserRole) => {
    setUser((prev) => ({ ...prev, role }));
    showToast(`Switched campus role to ${role.toUpperCase()}`);
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
    showToast('Profile settings updated');
  };

  // Service Helpers
  const openService = (service: ServiceType) => {
    setActiveService(service);
    setIsSearchOpen(false);
  };

  const closeService = () => {
    setActiveService(null);
  };

  // Search Helpers
  const addRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter((q) => q !== query)].slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem('campus_connect_recent_searches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('campus_connect_recent_searches');
  };

  // Navigation Logic
  const startNavigationTo = (location: CampusLocation) => {
    setNavDestination(location);
    setIsNavigating(true);
    setCurrentNavStepIndex(0);
    setActiveTab('navigation');
    setActiveService(null);
    setIsSearchOpen(false);
    showToast(`Navigating to ${location.name} (${location.walkTimeMin} min walk)`);
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setCurrentNavStepIndex(0);
  };

  const nextNavStep = () => {
    setCurrentNavStepIndex((prev) => prev + 1);
  };

  const prevNavStep = () => {
    setCurrentNavStepIndex((prev) => Math.max(0, prev - 1));
  };

  const activeRoute: NavigationRoute | null = navDestination
    ? {
        origin: navOrigin,
        destination: navDestination,
        totalDistanceMeters: navDestination.distanceMeters,
        estimatedWalkTimeMin: navDestination.walkTimeMin,
        steps: [
          {
            id: 1,
            instruction: 'Exit Main Quad and head North toward Knowledge Walkway',
            distanceMeters: 40,
            direction: 'straight',
            floorNote: 'Outdoor Walkway',
          },
          {
            id: 2,
            instruction: `Turn right near ${navDestination.building} entrance`,
            distanceMeters: 60,
            direction: 'right',
            floorNote: 'Ground Level Entrance',
          },
          {
            id: 3,
            instruction: `Enter glass lobby and proceed to ${navDestination.floor}`,
            distanceMeters: 30,
            direction: navDestination.floor.includes('Ground') ? 'straight' : 'up',
            floorNote: navDestination.floor,
          },
          {
            id: 4,
            instruction: `You have arrived at ${navDestination.name}`,
            distanceMeters: 10,
            direction: 'arrive',
            floorNote: `${navDestination.building} • ${navDestination.floor}`,
          },
        ],
        pathPoints: [
          { x: navOrigin.x, y: navOrigin.y },
          { x: (navOrigin.x + navDestination.x) / 2, y: navOrigin.y },
          { x: (navOrigin.x + navDestination.x) / 2, y: navDestination.y },
          { x: navDestination.x, y: navDestination.y },
        ],
      }
    : null;

  // Notifications Logic
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read');
  };

  // Admission Appointment logic
  const addAppointment = (
    data: Omit<AdmissionAppointment, 'id' | 'ticketId' | 'createdAt' | 'status'>
  ): AdmissionAppointment => {
    const newApt: AdmissionAppointment = {
      ...data,
      id: `apt-${Date.now()}`,
      ticketId: `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    };
    setAppointments((prev) => [newApt, ...prev]);
    setActiveAppointmentPass(newApt);
    showToast(`Appointment confirmed! Ticket #${newApt.ticketId} issued`);
    confetti({ particleCount: 50, spread: 50 });
    return newApt;
  };

  const bookAppointment = (params: {
    fullName: string;
    department: string;
    date: string;
    timeSlot: string;
    purpose?: string;
  }) => {
    addAppointment({
      fullName: params.fullName,
      department: params.department,
      date: params.date,
      timeSlot: params.timeSlot,
      purpose: params.purpose || 'Campus Visit & Admission Counseling',
    });
  };

  // Bus Registration logic
  const registerForBus = (routeNumber: string, busNumber: string) => {
    const newPass = {
      routeNumber,
      busNumber,
      studentName: user.name,
      issueDate: 'Fall Term 2026',
      ticketId: `BUS-PASS-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setBusPasses((prev) => [newPass, ...prev]);
    setActiveBusTicket(newPass);
    showToast(`Bus pass activated for ${busNumber}!`);
    confetti({ particleCount: 60, spread: 60 });
  };

  const registerBusPass = (routeNumber: string, busNumber: string) => {
    registerForBus(routeNumber, busNumber);
  };

  // Library Book actions
  const renewBook = (bookId: string) => {
    setIssuedBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          return {
            ...b,
            dueDate: 'Nov 15, 2026',
            status: 'valid' as const,
          };
        }
        return b;
      })
    );
    showToast('Book renewed for +14 additional days!');
    confetti({ particleCount: 40, spread: 40 });
  };

  const payLibraryFine = (bookId: string) => {
    setIssuedBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          return {
            ...b,
            penaltyAmount: 0,
            status: 'valid' as const,
            dueDate: 'Nov 10, 2026',
          };
        }
        return b;
      })
    );
    showToast('Fine of $5.00 paid and cleared! Account in good standing.');
    confetti({ particleCount: 60, spread: 70 });
  };

  const reserveBook = (bookId: string) => {
    const found = LIBRARY_BOOKS_DATA.find((b) => b.id === bookId);
    if (found) {
      const issued: LibraryBook = {
        ...found,
        status: 'valid',
        dueDate: 'Nov 20, 2026',
        issueDate: 'Today',
      };
      setIssuedBooks((prev) => [issued, ...prev]);
      showToast(`"${found.title}" reserved! Pick up at Counter A.`);
    }
  };

  // Event Registration logic
  const toggleEventRegistration = (eventId: string) => {
    if (registeredEvents.includes(eventId)) {
      setRegisteredEvents((prev) => prev.filter((id) => id !== eventId));
      showToast('Event registration cancelled.');
    } else {
      setRegisteredEvents((prev) => [...prev, eventId]);
      showToast('You are registered! Pass saved to your wallet.');
      confetti({ particleCount: 70, spread: 60 });
    }
  };

  // Canteen Review logic
  const addCanteenReview = (canteenId: string, rating: number, comment: string) => {
    const newRev: CanteenReview = {
      id: `rev-${Date.now()}`,
      userName: user.name,
      userAvatar: user.avatar,
      rating,
      comment,
      date: 'Just now',
    };
    setCanteenReviews((prev) => ({
      ...prev,
      [canteenId]: [newRev, ...(prev[canteenId] || [])],
    }));
    showToast('Review published! Thank you for the campus feedback.');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isLoggedIn,
        isLoggingIn,
        loginWithGoogle,
        loginWithCredentials,
        loginAsGuest,
        logout,
        updateUserRole,
        updateUserProfile,
        activeTab,
        setActiveTab,
        activeService,
        setActiveService,
        openService,
        closeService,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        recentSearches,
        addRecentSearch,
        clearRecentSearches,
        selectedLocation,
        setSelectedLocation,
        navDestination,
        navOrigin,
        isNavigating,
        currentNavStepIndex,
        isVoiceGuidanceEnabled,
        setIsVoiceGuidanceEnabled,
        selectedFloor,
        setSelectedFloor,
        startNavigationTo,
        stopNavigation,
        nextNavStep,
        prevNavStep,
        activeRoute,
        notifications,
        unreadCount,
        markNotificationRead,
        markAllNotificationsRead,
        activeNotifModal,
        setActiveNotifModal,
        appointments,
        addAppointment,
        bookAppointment,
        activeAppointmentPass,
        setActiveAppointmentPass,
        busPasses,
        registerForBus,
        registerBusPass,
        activeBusTicket,
        setActiveBusTicket,
        issuedBooks,
        renewBook,
        payLibraryFine,
        reserveBook,
        registeredEvents,
        toggleEventRegistration,
        activeEventModal,
        setActiveEventModal,
        canteenReviews,
        addCanteenReview,
        previewMode,
        setPreviewMode,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
