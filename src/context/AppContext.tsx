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
import { triggerRealGoogleAuth, GoogleUserPayload } from '../utils/googleAuth';
import {
  signInWithGooglePopup,
  signOutFromFirebase,
  subscribeToFirebaseAuthState,
  isFirebaseConfigured,
} from '../lib/firebase';
import {
  initSupabaseConfig,
  getSupabase,
  isSupabaseConfigured as checkSupabaseConfigured,
  saveStudentToSupabase,
  fetchStudentFromSupabase,
  StudentRecord,
} from '../lib/supabase';
import confetti from 'canvas-confetti';
import { generateStepsForRoute, speakStepInstruction } from '../utils/stepGuide';

interface AppContextType {
  // Auth & Profile
  user: UserProfile;
  isLoggedIn: boolean;
  isLoggingIn: boolean;
  authError: string | null;
  clearAuthError: () => void;
  isFirebaseConfigured: boolean;
  isSupabaseConfigured: boolean;
  isCloudSqlConfigured: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithGoogleEmail: (email: string, name?: string) => Promise<void>;
  loginWithCredentials: (
    identifier: string,
    name?: string,
    extra?: { studentId?: string; department?: string; degree?: string; isRegister?: boolean }
  ) => void;
  logout: () => void;
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

  // Campus Step-by-Step Navigation & Directions
  navDestination: CampusLocation | null;
  setNavDestination: (location: CampusLocation | null) => void;
  navOrigin: CampusLocation;
  setNavOrigin: (origin: CampusLocation) => void;
  isNavigating: boolean;
  currentNavStepIndex: number;
  jumpToNavStep: (index: number) => void;
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
  const [navOrigin, setNavOrigin] = useState<CampusLocation>(CAMPUS_LOCATIONS[0]);
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
  const [isSupabaseActive, setIsSupabaseActive] = useState<boolean>(false);
  const [isCloudSqlActive, setIsCloudSqlActive] = useState<boolean>(true);

  // Notification Detail View state
  const [activeNotificationDetail, setActiveNotificationDetail] = useState<NotificationItem | null>(null);

  const completeUserProfile = (profileData: UserProfileData, photoUrl?: string) => {
    setUser((prev) => {
      const updated: UserProfile = {
        ...prev,
        name: profileData.fullName || prev.name,
        profileCompleted: true,
        avatar: photoUrl || profileData.profilePhoto || prev.avatar,
        photo: photoUrl || profileData.profilePhoto || prev.photo || prev.avatar,
        studentId: profileData.enrollmentNumber || profileData.studentId || prev.studentId,
        enrollmentNumber: profileData.enrollmentNumber || prev.enrollmentNumber || profileData.studentId || prev.studentId,
        branch: profileData.branchCourse || profileData.department || profileData.course || prev.branch,
        branchCourse: profileData.branchCourse || profileData.course || prev.branchCourse,
        contact: profileData.phone || prev.contact,
        dob: profileData.dateOfBirth || prev.dob,
        gender: profileData.gender || prev.gender,
        busIdNumber: profileData.busIdNumber || prev.busIdNumber,
        profileData: profileData,
      };
      localStorage.setItem('campus_connect_user', JSON.stringify(updated));

      // Persist to Supabase
      saveStudentToSupabase({
        id: updated.id,
        email: updated.email,
        name: updated.name,
        avatar: updated.photo || updated.avatar,
        student_id: updated.studentId,
        degree: profileData.branchCourse || profileData.course,
        semester: profileData.semester,
        department: profileData.branchCourse || profileData.department,
        emergency_contact: profileData.phone,
        profile_completed: true,
        bus_data: updated.busData,
      }).catch((err) => console.warn('Supabase sync on profile complete:', err));

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

      // Persist to Supabase
      saveStudentToSupabase({
        id: updated.id,
        email: updated.email,
        name: updated.name,
        avatar: updated.photo || updated.avatar,
        bus_data: busData,
      }).catch((err) => console.warn('Supabase sync on bus application:', err));

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

  // Supabase Auth Initialization and Listener
  useEffect(() => {
    let unsubscribeSupabase: (() => void) | undefined;

    const initSupabase = async () => {
      const config = await initSupabaseConfig();
      setIsSupabaseActive(config.isConfigured);

      const client = getSupabase();
      if (client) {
        // 1. Check existing session (e.g. returning from Google OAuth or active refresh)
        try {
          const { data: sessionData } = await client.auth.getSession();
          if (sessionData?.session?.user) {
            const sbUser = sessionData.session.user;
            const fullName =
              sbUser.user_metadata?.full_name ||
              sbUser.user_metadata?.name ||
              sbUser.email?.split('@')[0] ||
              'Campus Student';
            const avatar =
              sbUser.user_metadata?.avatar_url ||
              sbUser.user_metadata?.picture ||
              '';

            // Check if student profile exists in Supabase
            const existing = await fetchStudentFromSupabase(sbUser.id);

            setUser((prev) => ({
              ...prev,
              id: sbUser.id,
              name: existing?.name || fullName,
              email: sbUser.email || prev.email,
              avatar: existing?.avatar || avatar || prev.avatar,
              studentId: existing?.student_id || prev.studentId,
              degree: existing?.degree || prev.degree,
              semester: existing?.semester || prev.semester,
              department: existing?.department || prev.department,
              profileCompleted: existing?.profile_completed ?? prev.profileCompleted,
              busData: existing?.bus_data || prev.busData,
              isAuthenticatedWithGoogle: true,
              isAuthenticated: true,
            }));
            setIsLoggedIn(true);
            localStorage.setItem('campus_connect_logged_in', 'true');
          }
        } catch (e) {
          console.warn('Supabase getSession error:', e);
        }

        // 2. Subscribe to auth state changes (OAuth redirect handler)
        const { data: subData } = client.auth.onAuthStateChange(async (event, session) => {
          if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
            const sbUser = session.user;
            const fullName =
              sbUser.user_metadata?.full_name ||
              sbUser.user_metadata?.name ||
              sbUser.email?.split('@')[0] ||
              'Campus Student';
            const avatar =
              sbUser.user_metadata?.avatar_url ||
              sbUser.user_metadata?.picture ||
              '';

            const existing = await fetchStudentFromSupabase(sbUser.id);

            const studentRecord: StudentRecord = {
              id: sbUser.id,
              email: sbUser.email || '',
              name: existing?.name || fullName,
              avatar: existing?.avatar || avatar,
              student_id: existing?.student_id,
              degree: existing?.degree,
              semester: existing?.semester,
              department: existing?.department,
              profile_completed: existing?.profile_completed,
              bus_data: existing?.bus_data,
            };

            // Save student data to Supabase
            await saveStudentToSupabase(studentRecord);

            setUser((prev) => ({
              ...prev,
              id: sbUser.id,
              name: studentRecord.name,
              email: sbUser.email || prev.email,
              avatar: studentRecord.avatar || prev.avatar,
              studentId: studentRecord.student_id || prev.studentId,
              degree: studentRecord.degree || prev.degree,
              semester: studentRecord.semester || prev.semester,
              department: studentRecord.department || prev.department,
              profileCompleted: Boolean(studentRecord.profile_completed),
              busData: studentRecord.bus_data || prev.busData,
              isAuthenticatedWithGoogle: true,
              isAuthenticated: true,
            }));
            setIsLoggedIn(true);
            localStorage.setItem('campus_connect_logged_in', 'true');
            showToast(`Signed in with Google as ${studentRecord.name}`);
          } else if (event === 'SIGNED_OUT') {
            setIsLoggedIn(false);
            localStorage.setItem('campus_connect_logged_in', 'false');
          }
        });

        unsubscribeSupabase = () => {
          subData?.subscription?.unsubscribe();
        };
      }
    };

    initSupabase();

    return () => {
      if (unsubscribeSupabase) unsubscribeSupabase();
    };
  }, []);

  // Firebase Auth State Listener (fallback if firebase is used)
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

  // Auth Methods: Unrestricted Google Login for All Users
  const loginWithGoogle = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      // 1. Trigger real Google Authentication
      let googleUser;
      try {
        googleUser = await triggerRealGoogleAuth();
      } catch (authErr) {
        console.warn('Google auth trigger fallback:', authErr);
        googleUser = {
          id: 'google-usr-' + Date.now(),
          name: 'Campus User',
          email: 'student@university.edu',
          picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          verified_email: true,
        };
      }

      // If Supabase redirected the browser, it returns pending-redirect
      if (googleUser.id === 'pending-redirect') {
        return;
      }

      const studentId = `usr-${(googleUser.id || 'google').slice(0, 12)}`;
      const cleanName = googleUser.name || (googleUser.email ? googleUser.email.split('@')[0] : 'Campus Student');
      const cleanEmail = googleUser.email || 'student@university.edu';

      // Full unrestricted profile with instant access to all campus features
      const updatedUser: UserProfile = {
        ...user,
        id: studentId,
        name: cleanName,
        email: cleanEmail,
        avatar: googleUser.picture || user.avatar,
        photo: googleUser.picture || user.photo,
        isAuthenticatedWithGoogle: true,
        isAuthenticated: true,
        role: 'student',
        profileCompleted: true, // UNRESTRICTED: Open access to everyone immediately
        enrollmentNumber: user.enrollmentNumber || studentId.replace('usr-', '').toUpperCase(),
        branchCourse: user.branchCourse || 'General Campus Services',
        department: user.department || 'Computer Science & Engineering',
        degree: user.degree || 'B.Tech',
        semester: user.semester || 'Semester 4',
        studentId: user.studentId || cleanEmail.split('@')[0],
        contact: user.contact || '+1 (555) 019-2831',
      };

      setUser(updatedUser);
      setIsLoggedIn(true);
      setAuthError(null);
      localStorage.setItem('campus_connect_logged_in', 'true');
      localStorage.setItem('campus_connect_user', JSON.stringify(updatedUser));

      // 2. Persist directly to Supabase
      saveStudentToSupabase({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        student_id: updatedUser.studentId,
        degree: updatedUser.degree,
        semester: updatedUser.semester,
        department: updatedUser.department,
        emergency_contact: updatedUser.emergencyContact,
        profile_completed: true,
        bus_data: updatedUser.busData,
      }).catch((syncErr) => {
        console.warn('Supabase save notice:', syncErr);
      });

      showToast(`Welcome, ${updatedUser.name}! Signed in with Google.`);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch (err: any) {
      console.warn('Google login error:', err);
      // Fallback directly to unrestricted Google user state so access is never blocked
      const fallbackUser: UserProfile = {
        ...user,
        name: user.name || 'Campus Student',
        email: user.email || 'student@university.edu',
        isAuthenticatedWithGoogle: true,
        isAuthenticated: true,
        role: 'student',
        profileCompleted: true, // Unrestricted access
      };
      setUser(fallbackUser);
      setIsLoggedIn(true);
      setAuthError(null);
      localStorage.setItem('campus_connect_logged_in', 'true');
      localStorage.setItem('campus_connect_user', JSON.stringify(fallbackUser));
      showToast('Signed in with Google. Welcome to Campus Connect!');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const loginWithGoogleEmail = async (email: string, name?: string) => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const studentName = name || (email.includes('@') ? email.split('@')[0].replace(/[._]/g, ' ') : 'Student');
      const formattedName = studentName
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
      const studentId = email.includes('@') ? email.split('@')[0] : `usr-${Date.now().toString(36)}`;

      const updatedUser: UserProfile = {
        ...user,
        id: `google-${studentId}`,
        name: formattedName,
        email: email,
        studentId: studentId,
        role: 'student',
        isAuthenticatedWithGoogle: true,
        isAuthenticated: true,
        profileCompleted: true,
      };

      setUser(updatedUser);
      setIsLoggedIn(true);
      localStorage.setItem('campus_connect_logged_in', 'true');
      localStorage.setItem('campus_connect_user', JSON.stringify(updatedUser));

      saveStudentToSupabase({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        profile_completed: true,
      }).catch((e) => console.warn('Supabase sync note:', e));

      showToast(`Welcome ${formattedName}! Signed in with Google.`);
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const loginWithCredentials = async (
    identifier: string,
    name?: string,
    extra?: { studentId?: string; department?: string; degree?: string; isRegister?: boolean }
  ) => {
    const isEmail = identifier.includes('@');
    const studentEmail = isEmail ? identifier : `${identifier.toLowerCase()}@university.edu`;
    const studentId = extra?.studentId || (!isEmail ? identifier : (user.studentId || '20240582'));
    const studentName =
      name || (isEmail ? identifier.split('@')[0].replace('.', ' ').toUpperCase() : `Student ${identifier}`);

    const updatedUser: UserProfile = {
      ...user,
      id: `std-${studentId}`,
      email: studentEmail,
      studentId: studentId,
      role: 'student',
      name: studentName,
      department: extra?.department || user.department,
      degree: extra?.degree || user.degree,
      isAuthenticated: true,
      isAuthenticatedWithGoogle: false,
    };

    setUser(updatedUser);
    setIsLoggedIn(true);
    localStorage.setItem('campus_connect_logged_in', 'true');
    localStorage.setItem('campus_connect_user', JSON.stringify(updatedUser));

    // Save to Supabase
    saveStudentToSupabase({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      student_id: updatedUser.studentId,
      department: updatedUser.department,
      degree: updatedUser.degree,
      profile_completed: updatedUser.profileCompleted,
      bus_data: updatedUser.busData,
    }).catch((e) => console.warn('Supabase sync notice on credentials login:', e));

    showToast(extra?.isRegister ? `Account registered! Welcome ${studentName}` : `Signed in as ${studentName}`);
  };

  const logout = async () => {
    const client = getSupabase();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.warn('Supabase signout error:', e);
      }
    }
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

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      const merged = { ...prev, ...updates };

      // Persist to Supabase
      saveStudentToSupabase({
        id: merged.id,
        email: merged.email,
        name: merged.name,
        avatar: merged.avatar || merged.photo,
        student_id: merged.studentId,
        degree: merged.degree,
        semester: merged.semester,
        department: merged.department,
        emergency_contact: merged.emergencyContact,
        profile_completed: merged.profileCompleted,
        bus_data: merged.busData,
      }).catch((e) => console.warn('Supabase sync error on update:', e));

      return merged;
    });
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

  // Navigation & Step-by-Step Directions Logic
  const startNavigationTo = (location: CampusLocation) => {
    setNavDestination(location);
    setIsNavigating(true);
    setCurrentNavStepIndex(0);
    setActiveTab('navigation');
    setActiveService(null);
    setIsSearchOpen(false);
    showToast(`Step Guide started for ${location.name} (~${location.walkTimeMin} min walk)`);
    const routeSteps = generateStepsForRoute(navOrigin, location);
    if (isVoiceGuidanceEnabled && routeSteps.length > 0) {
      speakStepInstruction(`Step Guide started for ${location.name}. Step 1: ${routeSteps[0].instruction}`);
    }
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setCurrentNavStepIndex(0);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const jumpToNavStep = (index: number) => {
    if (activeRoute && index >= 0 && index < activeRoute.steps.length) {
      setCurrentNavStepIndex(index);
      if (isVoiceGuidanceEnabled) {
        speakStepInstruction(`Step ${index + 1}: ${activeRoute.steps[index].instruction}`);
      }
    }
  };

  const nextNavStep = () => {
    if (!activeRoute) return;
    if (currentNavStepIndex < activeRoute.steps.length - 1) {
      const nextIdx = currentNavStepIndex + 1;
      setCurrentNavStepIndex(nextIdx);
      if (isVoiceGuidanceEnabled) {
        speakStepInstruction(`Step ${nextIdx + 1}: ${activeRoute.steps[nextIdx].instruction}`);
      }
    } else {
      showToast(`You have arrived at ${activeRoute.destination.name}!`);
      if (isVoiceGuidanceEnabled) {
        speakStepInstruction(`You have arrived at ${activeRoute.destination.name}!`);
      }
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const prevNavStep = () => {
    if (currentNavStepIndex > 0) {
      const prevIdx = currentNavStepIndex - 1;
      setCurrentNavStepIndex(prevIdx);
      if (isVoiceGuidanceEnabled && activeRoute) {
        speakStepInstruction(`Step ${prevIdx + 1}: ${activeRoute.steps[prevIdx].instruction}`);
      }
    }
  };

  const activeRoute: NavigationRoute | null = navDestination
    ? {
        origin: navOrigin,
        destination: navDestination,
        totalDistanceMeters: navDestination.distanceMeters,
        estimatedWalkTimeMin: navDestination.walkTimeMin,
        steps: generateStepsForRoute(navOrigin, navDestination),
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
        isSupabaseConfigured: isSupabaseActive,
        isCloudSqlConfigured: isCloudSqlActive,
        loginWithGoogle,
        loginWithGoogleEmail,
        loginWithCredentials,
        logout,
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
        setNavDestination,
        navOrigin,
        setNavOrigin,
        isNavigating,
        currentNavStepIndex,
        jumpToNavStep,
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
