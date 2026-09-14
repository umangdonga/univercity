import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserProfileData,
  BusPassData,
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
import {
  signInWithGooglePopup,
  signOutFromFirebase,
  subscribeToFirebaseAuthState,
  isFirebaseConfigured,
} from '../lib/firebase';
import confetti from 'canvas-confetti';

interface AppContextType {
  // Auth & Profile
  user: UserProfile;
  isLoggedIn: boolean;
  isLoggingIn: boolean;
  authError: string | null;
  clearAuthError: () => void;
  isFirebaseConfigured: boolean;
  loginWithGoogle: (preferredRole?: UserRole) => Promise<void>;
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

  // Guest restriction modal
  guestAccessDeniedModalOpen: boolean;
  setGuestAccessDeniedModalOpen: (open: boolean) => void;
  guestRestrictedActionName: string;
  triggerGuestRestriction: (actionName?: string) => void;

  // Profile completion & Bus pass submission
  completeUserProfile: (data: UserProfileData, photoUrl?: string) => void;
  submitBusPassApplication: (busData: BusPassData) => void;
  activeNotificationDetail: NotificationItem | null;
  setActiveNotificationDetail: (item: NotificationItem | null) => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-student',
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
  isAuthenticated: false,
  twoFactorEnabled: true,
  privacyShareAcademic: true,
  notificationsEnabled: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('campus_connect_logged_in') === 'true';
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('campus_connect_user');
    const loggedIn = localStorage.getItem('campus_connect_logged_in') === 'true';
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.isAuthenticated = loggedIn;
        return parsed;
      } catch (e) {
        // ignore JSON parse error
      }
    }
    return { ...DEFAULT_USER, isAuthenticated: loggedIn };
  });

  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = () => setAuthError(null);

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

  // UI Presentation Mode
  const [previewMode, setPreviewMode] = useState<'mobile-frame' | 'responsive-desktop'>('mobile-frame');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Guest restriction modal state
  const [guestAccessDeniedModalOpen, setGuestAccessDeniedModalOpen] = useState<boolean>(false);
  const [guestRestrictedActionName, setGuestRestrictedActionName] = useState<string>('this service');

  const triggerGuestRestriction = (actionName?: string) => {
    setGuestRestrictedActionName(actionName || 'this service');
    setGuestAccessDeniedModalOpen(true);
  };

  // Notification Detail View state
  const [activeNotificationDetail, setActiveNotificationDetail] = useState<NotificationItem | null>(null);

  const completeUserProfile = (profileData: UserProfileData, photoUrl?: string) => {
    setUser((prev) => {
      const updated: UserProfile = {
        ...prev,
        profileCompleted: true,
        avatar: photoUrl || prev.avatar,
        photo: photoUrl || prev.photo || prev.avatar,
        studentId: profileData.studentId || prev.studentId,
        branch: profileData.department || profileData.course || prev.branch,
        contact: profileData.phone || prev.contact,
        profileData: profileData,
      };
      localStorage.setItem('campus_connect_user', JSON.stringify(updated));
      return updated;
    });
    showToast('Profile completed successfully! Welcome to Campus Connect.');
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
  };

  const submitBusPassApplication = (busData: BusPassData) => {
    setUser((prev) => {
      const updated: UserProfile = {
        ...prev,
        busData: busData,
      };
      localStorage.setItem('campus_connect_user', JSON.stringify(updated));
      return updated;
    });

    const newTicket = {
      ticketId: busData.passNumber,
      studentName: busData.studentName,
      busNumber: busData.busNumber,
      routeNumber: busData.routeNumber,
      pickupPoint: busData.pickupLocation,
      dropPoint: busData.dropLocation,
      validity: busData.validity,
      status: busData.status,
    };

    setBusPasses((prev) => [
      {
        routeNumber: busData.routeNumber,
        busNumber: busData.busNumber,
        studentName: busData.studentName,
        issueDate: 'Fall Term 2026',
        ticketId: busData.passNumber,
      },
      ...prev,
    ]);

    setActiveBusTicket(newTicket);
    showToast('Bus pass application submitted & synced with Profile!');
    confetti({ particleCount: 70, spread: 60 });
  };

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

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = subscribeToFirebaseAuthState(async (firebaseUser) => {
      if (firebaseUser) {
        setUser((prev) => ({
          ...prev,
          id: firebaseUser.uid,
          name: firebaseUser.displayName || prev.name,
          email: firebaseUser.email || prev.email,
          avatar: firebaseUser.photoURL || prev.avatar,
          isAuthenticatedWithGoogle: true,
          isAuthenticated: true,
        }));
        setIsLoggedIn(true);
        localStorage.setItem('campus_connect_logged_in', 'true');
      }
    });
    return () => unsubscribe();
  }, []);

  // Auth Methods
  const loginWithGoogle = async (preferredRole?: UserRole) => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      let googleUser: { id: string; name: string; email: string; picture: string };

      if (isFirebaseConfigured) {
        // 1. Live Firebase Authentication with Google Provider
        const firebaseResult = await signInWithGooglePopup();
        googleUser = {
          id: firebaseResult.uid,
          name: firebaseResult.displayName || 'Google User',
          email: firebaseResult.email || 'user@gmail.com',
          picture:
            firebaseResult.photoURL ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        };
      } else {
        // 2. Google OAuth flow with popup & backend fallback
        const oAuthResult = await openGoogleOAuthPopup();
        googleUser = {
          id: oAuthResult.id,
          name: oAuthResult.name,
          email: oAuthResult.email,
          picture:
            oAuthResult.picture ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        };
      }

      const activeRole: UserRole = preferredRole || user.role || 'student';

      const updatedUser: UserProfile = {
        ...user,
        id: `usr-${(googleUser.id || 'google').slice(0, 10)}`,
        name: googleUser.name,
        email: googleUser.email,
        avatar: googleUser.picture,
        photo: googleUser.picture,
        isAuthenticatedWithGoogle: true,
        isAuthenticated: true,
        role: activeRole,
        profileCompleted: activeRole === 'guest' ? true : false,
      };

      setUser(updatedUser);
      setIsLoggedIn(true);
      localStorage.setItem('campus_connect_logged_in', 'true');
      localStorage.setItem('campus_connect_user', JSON.stringify(updatedUser));

      // Persist / sync to backend database (Requirement 7)
      try {
        await fetch('/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            photoURL: updatedUser.avatar,
            role: updatedUser.role,
          }),
        });
      } catch (syncErr) {
        console.warn('Backend user sync:', syncErr);
      }

      showToast(`Welcome back, ${googleUser.name}!`);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch (err: any) {
      console.warn('Google login error:', err);
      const msg = err.message || 'Google authentication was cancelled or encountered an issue.';
      setAuthError(msg);
      showToast(msg);
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
      isAuthenticatedWithGoogle: false,
    };
    setUser(updatedUser);
    setIsLoggedIn(true);
    localStorage.setItem('campus_connect_logged_in', 'true');
    localStorage.setItem('campus_connect_user', JSON.stringify(updatedUser));
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
      isAuthenticatedWithGoogle: false,
    };
    setUser(guestUser);
    setIsLoggedIn(true);
    localStorage.setItem('campus_connect_logged_in', 'true');
    localStorage.setItem('campus_connect_user', JSON.stringify(guestUser));
    showToast('Welcome Visitor! Exploring in Guest Mode');
  };

  const logout = async () => {
    try {
      await signOutFromFirebase();
    } catch (e) {
      console.warn('Firebase signout error:', e);
    }
    setIsLoggedIn(false);
    setUser((prev) => ({
      ...prev,
      isAuthenticated: false,
      isAuthenticatedWithGoogle: false,
    }));
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
        authError,
        clearAuthError,
        isFirebaseConfigured,
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
        guestAccessDeniedModalOpen,
        setGuestAccessDeniedModalOpen,
        guestRestrictedActionName,
        triggerGuestRestriction,
        completeUserProfile,
        submitBusPassApplication,
        activeNotificationDetail,
        setActiveNotificationDetail,
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
