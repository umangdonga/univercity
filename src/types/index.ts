export type UserRole = 'student';

export interface UserProfileData {
  studentId?: string;
  department?: string;
  course?: string;
  semester?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  bloodGroup?: string;
}

export interface BusPassData {
  applicationType: 'New Bus Pass' | 'Renewal' | 'Route Change';
  status: 'Pending' | 'Approved' | 'Rejected';
  studentName: string;
  studentId: string;
  course: string;
  semester: string;
  phone: string;
  address: string;
  pickupLocation: string;
  dropLocation: string;
  routeNumber: string;
  busNumber: string;
  emergencyContact: string;
  passNumber: string;
  validity: string;
  photo?: string;
  appliedDate: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  photo?: string;
  role: UserRole;
  studentId: string;
  branch: string;
  department?: string;
  degree?: string;
  semester?: string;
  contact: string;
  emergencyContact?: string;
  dob: string;
  occupation: string;
  isAuthenticatedWithGoogle: boolean;
  isAuthenticated?: boolean;
  profileCompleted?: boolean;
  profileData?: UserProfileData;
  busData?: BusPassData;
  googleId?: string;
  twoFactorEnabled?: boolean;
  privacyShareAcademic?: boolean;
  notificationsEnabled?: boolean;
}

export type LocationCategory =
  | 'Classroom'
  | 'Lab'
  | 'Admin'
  | 'Canteen'
  | 'Hostel'
  | 'Library'
  | 'Parking'
  | 'Sports'
  | 'Facility'
  | 'Meeting';

export interface CampusLocation {
  id: string;
  name: string;
  shortCode?: string;
  category: LocationCategory;
  building: string;
  floor: string;
  roomNumber?: string;
  x: number; // 0 - 100 percentage coordinates on 3D map
  y: number; // 0 - 100 percentage coordinates on 3D map
  lat?: number; // Real GPS latitude
  lng?: number; // Real GPS longitude
  distanceMeters: number;
  walkTimeMin: number;
  description: string;
  tags: string[];
  iconName: string;
  image?: string;
}

export interface NavStep {
  id: number;
  instruction: string;
  distanceMeters: number;
  direction: 'straight' | 'left' | 'right' | 'up' | 'down' | 'arrive';
  floorNote?: string;
}

export interface NavigationRoute {
  origin: CampusLocation;
  destination: CampusLocation;
  totalDistanceMeters: number;
  estimatedWalkTimeMin: number;
  steps: NavStep[];
  pathPoints: { x: number; y: number }[];
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'Popular' | 'Snacks' | 'Meals' | 'Beverages' | 'Fast Food' | string;
  price: number;
  isVeg: boolean;
  rating?: number;
  ordersCount?: number;
  description?: string;
  image?: string;
  available?: boolean;
  prepTimeMinutes?: number;
  isPopular?: boolean;
  calories?: number;
}

export interface CanteenReview {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Canteen {
  id: string;
  name: string;
  tagline: string;
  rating: number;
  reviewsCount: number;
  openStatus: string;
  timings: string;
  location: string;
  image: string;
  menu: MenuItem[];
  reviews: CanteenReview[];
}

export interface HostelRoomType {
  id: string;
  name: string;
  sharingType: string;
  isAC: boolean;
  capacitySharing: number;
  feePerTerm: number;
  duration: string;
  available: boolean;
  features: string[];
  image: string;
  description: string;
}

export interface Hostel {
  id: string;
  name: string;
  block: string;
  gender: 'Boys Hostel' | 'Girls Hostel';
  location: string;
  description: string;
  roomTypes: HostelRoomType[];
  amenities: string[];
  rules: string[];
  wardenContact: {
    name: string;
    phone: string;
    email: string;
  };
}

export interface BusRouteStop {
  name: string;
  time: string;
  isCurrent?: boolean;
}

export interface BusRoute {
  id: string;
  routeNumber: string;
  title: string;
  busNumber: string;
  driverName: string;
  driverPhone?: string;
  nextTiming: string;
  totalSeats: number;
  availableSeats: number;
  registeredCount: number;
  schedule: string;
  fare: string;
  stops: BusRouteStop[];
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  status: 'valid' | 'overdue' | 'due-soon' | 'available';
  dueDate?: string;
  issueDate?: string;
  penaltyAmount?: number;
  category: string;
  isbn: string;
  shelf: string;
  coverColor?: string;
}

export interface Course {
  id: string;
  name: string;
  shortCode: string;
  level: 'Undergraduate' | 'Postgraduate' | 'Diploma';
  duration: string;
  semesterFees: number;
  totalSemesters: number;
  description: string;
  eligibility: string;
  highlights: string[];
  branch: string;
}

export interface CourseBranch {
  id: string;
  name: string;
  code: string;
  iconName: string;
  courses: Course[];
}

export interface AdmissionAppointment {
  id: string;
  ticketId: string;
  fullName: string;
  department: string;
  contactNumber?: string;
  date: string;
  timeSlot: string;
  purpose?: string;
  status: 'confirmed' | 'pending' | 'completed';
  createdAt: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  badgeText: string;
  isRegistered?: boolean;
  image?: string;
}

export interface NotificationItem {
  id: string;
  category: 'academic' | 'campus' | 'social';
  title: string;
  subtitle?: string;
  message: string;
  timestamp: string;
  read: boolean;
  badgeColor?: string;
}

export interface ParkingSlot {
  id: string;
  code: string;
  isOccupied: boolean;
  type: 'general' | 'faculty' | 'ev';
}

export interface ParkingArea {
  id: string;
  name: string;
  location: string;
  totalSpaces: number;
  availableSpaces: number;
  occupiedSpaces: number;
  slots: ParkingSlot[];
}

export type MainTab = 'home' | 'navigation' | 'services' | 'profile' | 'notifications';
export type ServiceType =
  | 'all'
  | 'canteen'
  | 'hostel'
  | 'bus'
  | 'library'
  | 'courses'
  | 'admission'
  | 'parking'
  | 'support'
  | 'labs'
  | null;

export type MapMode = 'google-map' | 'campus-3d' | 'indoor-blueprint';

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  suggestions?: string[];
  actionType?: 'navigate' | 'openService' | 'viewBus' | 'viewCanteen';
  actionPayload?: any;
}
