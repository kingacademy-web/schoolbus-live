export type UserRole = 'PARENT' | 'DRIVER' | 'ADMIN';

export type Language = 'en' | 'te';

export type GPSMode = 'LIVE' | 'DEMO';

export type TripState =
  | 'IDLE'
  | 'STARTING'
  | 'LIVE'
  | 'PAUSED'
  | 'OFFLINE'
  | 'GPS_ERROR'
  | 'STOPPED'
  | 'COMPLETED'
  | 'EMERGENCY';

export type BusTripStatus =
  | 'OFFLINE'
  | 'READY'
  | 'MORNING_TRIP'
  | 'RETURN_TRIP'
  | 'STOPPED'
  | 'GPS_UNAVAILABLE'
  | 'INTERNET_UNAVAILABLE'
  | 'COMPLETED'
  | 'EMERGENCY';

export type StudentStatus = 'Awaiting Bus' | 'At Stop' | 'Boarded' | 'Dropped Safely' | 'Absent';

export type PickupStatus = 'Upcoming' | 'Approaching' | 'Arrived' | 'Departed' | 'Completed';

export interface UserAccount {
  id: string;
  name: string;
  nameTe?: string;
  email: string;
  phone: string;
  role: UserRole;
  language: Language;
  status: 'active' | 'suspended' | 'pending';
  createdAt?: number;
  lastLoginAt?: number;
  // Parent specific
  linkedStudentIds?: string[];
  selectedChildId?: string;
  // Driver specific
  assignedBusId?: string;
  licenseNo?: string;
}

export interface Student {
  id: string;
  name: string;
  nameTe: string;
  class: string;
  section: string;
  rollNo: string;
  schoolName: string;
  schoolNameTe: string;
  busId: string;
  routeId?: string;
  pickupPointId: string;
  parentId: string;
  parentPhone: string;
  parentEmail?: string;
  photoUrl: string;
  status: StudentStatus;
  transitPass: string;
  boardedAt?: number;
  droppedAt?: number;
}

export interface PickupPoint {
  id: string;
  name: string;
  nameTe: string;
  landmark: string;
  landmarkTe: string;
  lat: number;
  lng: number;
  morningTime: string;
  afternoonTime: string;
  geofenceRadiusMeters: number;
  stopNumber: number;
  routeId?: string;
  status?: PickupStatus;
}

export interface Driver {
  id: string;
  name: string;
  nameTe: string;
  phone: string;
  email?: string;
  licenseNo: string;
  experienceYears: number;
  rating: number;
  assignedBusId: string;
  avatarUrl: string;
  status: 'online' | 'on_trip' | 'offline';
  verified?: boolean;
}

export interface Bus {
  id: string;
  busNumber: string; // e.g. "BUS-07"
  plateNumber: string; // e.g. "TS 09 UA 4521"
  registrationNumber?: string;
  driverId: string;
  driverName: string;
  driverNameTe: string;
  driverPhone: string;
  routeId: string;
  routeName: string;
  routeNameTe: string;
  capacity: number;
  studentsCount: number;
  status: BusTripStatus;
  speedKmh: number;
  trafficLevel: 'Low' | 'Moderate' | 'Heavy';
  currentLocationName: string;
  currentLocationNameTe: string;
  nextStopName: string;
  nextStopNameTe: string;
  nextStopNumber: number;
  tripName: string;
  tripNameTe: string;
  gpsStatus?: 'ONLINE' | 'OFFLINE' | 'POOR_SIGNAL' | 'UNAVAILABLE';
  lastSeenTimestamp?: number;
}

export interface LiveLocationData {
  busId: string;
  // Lat/Lng aliases to support Firebase Realtime DB schema (latitude/longitude) and Leaflet (lat/lng)
  lat: number;
  lng: number;
  latitude?: number;
  longitude?: number;
  speed: number; // km/h
  heading: number; // degrees
  accuracy: number; // meters
  timestamp: number;
  tripStatus: BusTripStatus;
  driverId: string;
  tripId?: string;
  locationName: string;
  locationNameTe: string;
  distanceKm: number;
  etaMinutes: number;
  isRealGps: boolean;
  status?: BusTripStatus;
  isStale?: boolean;
  staleMessage?: string;
}

export interface NotificationItem {
  id: string;
  type:
    | 'bus_started'
    | 'bus_approaching'
    | 'bus_delayed'
    | 'bus_stopped'
    | 'driver_offline'
    | 'gps_unavailable'
    | 'trip_completed'
    | 'emergency_alert'
    | 'school_announcement';
  titleEn: string;
  titleTe: string;
  messageEn: string;
  messageTe: string;
  timestamp: string;
  createdAt?: number;
  read: boolean;
  busId?: string;
  studentId?: string;
  highPriority?: boolean;
}

export interface RouteStop {
  id: string;
  stopName: string;
  stopNameTe: string;
  time: string;
  passed: boolean;
  isCurrent?: boolean;
  isTargetStop?: boolean;
  studentsCount?: number;
  lat?: number;
  lng?: number;
}

export interface Route {
  id: string;
  name: string;
  nameTe: string;
  assignedBusId: string;
  stops: RouteStop[];
  totalDistanceKm: number;
  estimatedDurationMin: number;
}

export interface Trip {
  id: string;
  busId: string;
  driverId: string;
  type: 'morning' | 'return';
  startedAt: number;
  endedAt?: number;
  status: TripState;
  distanceTraveledKm: number;
  passengerCount: number;
  boardedStudentIds: string[];
  emergencyEvents?: {
    timestamp: number;
    description: string;
    resolved: boolean;
  }[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action:
    | 'STUDENT_CREATED'
    | 'STUDENT_UPDATED'
    | 'STUDENT_DELETED'
    | 'BUS_ASSIGNED'
    | 'DRIVER_ASSIGNED'
    | 'ROUTE_CHANGED'
    | 'GEOFENCE_UPDATED'
    | 'BROADCAST_SENT'
    | 'TRIP_STARTED'
    | 'TRIP_STOPPED'
    | 'EMERGENCY_TRIGGERED';
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface SchoolInfo {
  name: string;
  nameTe: string;
  address: string;
  addressTe: string;
  phone: string;
  email: string;
  emergencyContact: string;
  transportHeadName: string;
  logoUrl?: string;
}

