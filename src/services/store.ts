import {
  AuditLog,
  Bus,
  BusTripStatus,
  Driver,
  GPSMode,
  Language,
  LiveLocationData,
  NotificationItem,
  PickupPoint,
  RouteStop,
  SchoolInfo,
  Student,
  StudentStatus,
  UserAccount,
  UserRole,
} from '../types';
import {
  BUS_07_WAYPOINTS,
  INITIAL_BUSES,
  INITIAL_DRIVERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PICKUP_POINTS,
  INITIAL_ROUTE_STOPS,
  INITIAL_SCHOOL_INFO,
  INITIAL_STUDENTS,
} from '../data/mockData';
import { gpsService } from './gpsService';
import { liveLocationService } from './liveLocationService';
import { tripService } from './tripService';
import { auditService } from './auditService';
import { authService } from './authService';
import { isFirebaseConfigured } from './firebase';

// Haversine formula to compute accurate distance in kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

// Distance display helper (shows meters if < 1km, km otherwise)
export function formatDistance(distanceKm: number): string {
  if (isNaN(distanceKm) || distanceKm <= 0) return '0 m';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

// ETA calculation with minimum speed clamp to prevent Infinity/negative
export function estimateEtaMinutes(distanceKm: number, speedKmh: number = 25): number {
  if (isNaN(distanceKm) || distanceKm <= 0) return 1;
  const effectiveSpeed = Math.max(speedKmh, 15);
  const timeHours = distanceKm / effectiveSpeed;
  return Math.max(1, Math.round(timeHours * 60));
}

class AppStore {
  public language: Language = 'en';
  public role: UserRole = 'PARENT';
  public currentUser: UserAccount | null = null;
  public gpsMode: GPSMode = 'LIVE'; // LIVE or DEMO

  public activeStudentId: string = 'std_sadvik';
  public activeBusId: string = 'bus_07';
  public activeTripId: string | null = null;

  public schoolInfo: SchoolInfo = { ...INITIAL_SCHOOL_INFO };
  public students: Student[] = [...INITIAL_STUDENTS];
  public buses: Bus[] = [...INITIAL_BUSES];
  public drivers: Driver[] = [...INITIAL_DRIVERS];
  public pickupPoints: PickupPoint[] = [...INITIAL_PICKUP_POINTS];
  public notifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];
  public routeStops: RouteStop[] = [...INITIAL_ROUTE_STOPS];

  public liveLocation: LiveLocationData = {
    busId: 'bus_07',
    lat: BUS_07_WAYPOINTS[1].lat,
    lng: BUS_07_WAYPOINTS[1].lng,
    speed: 26,
    heading: 45,
    accuracy: 3.5,
    timestamp: Date.now(),
    tripStatus: 'MORNING_TRIP',
    driverId: 'drv_ravi',
    locationName: BUS_07_WAYPOINTS[1].locationName,
    locationNameTe: BUS_07_WAYPOINTS[1].locationNameTe,
    distanceKm: BUS_07_WAYPOINTS[1].distanceKm,
    etaMinutes: BUS_07_WAYPOINTS[1].etaMinutes,
    isRealGps: false,
  };

  public isSimulating: boolean = false;
  private simStep: number = 1;
  private simInterval: any = null;

  public isHardwareGpsActive: boolean = false;
  public gpsError: string | null = null;
  public autoCenterEnabled: boolean = true;
  private hasTriggeredGeofence: boolean = false;

  public tripElapsedSeconds: number = 1380;
  private tripTimer: any = null;

  private listeners: Set<() => void> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private unsubscribeLiveLocation: (() => void) | null = null;

  constructor() {
    // Restore persisted custom data from localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedSchool = localStorage.getItem('schoolbus_school_info');
        if (savedSchool) this.schoolInfo = JSON.parse(savedSchool);

        const savedStudents = localStorage.getItem('schoolbus_students');
        if (savedStudents) this.students = JSON.parse(savedStudents);

        const savedBuses = localStorage.getItem('schoolbus_buses');
        if (savedBuses) this.buses = JSON.parse(savedBuses);

        const savedDrivers = localStorage.getItem('schoolbus_drivers');
        if (savedDrivers) this.drivers = JSON.parse(savedDrivers);

        const savedPickups = localStorage.getItem('schoolbus_pickup_points');
        if (savedPickups) this.pickupPoints = JSON.parse(savedPickups);

        const savedStops = localStorage.getItem('schoolbus_route_stops');
        if (savedStops) this.routeStops = JSON.parse(savedStops);
      } catch (e) {
        console.warn('Error reading persisted data from localStorage:', e);
      }
    }

    // Restore language preference
    const savedLang = localStorage.getItem('schoolbus_lang') as Language;
    if (savedLang === 'en' || savedLang === 'te') {
      this.language = savedLang;
    }

    // Restore GPS Mode preference
    const savedGpsMode = localStorage.getItem('schoolbus_gps_mode') as GPSMode;
    if (savedGpsMode === 'LIVE' || savedGpsMode === 'DEMO') {
      this.gpsMode = savedGpsMode;
    }

    // Bind Auth Service
    this.currentUser = authService.getCurrentUser();
    if (this.currentUser) {
      this.role = this.currentUser.role;
    }
    authService.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.role = user.role;
        if (user.selectedChildId) {
          this.activeStudentId = user.selectedChildId;
        }
      }
      this.notify();
    });

    // Cross-tab synchronization via BroadcastChannel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('schoolbus_live_events');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'SYNC_STATE') {
          this.applyExternalState(event.data.payload);
        }
      };
    }

    // Start elapsed counter for active trip
    this.startTripTimer();

    // Attach Realtime Live Location Subscriber if Parent / Admin
    this.initLiveLocationSubscription();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
    this.broadcastState();
  }

  private broadcastState() {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'SYNC_STATE',
        payload: {
          liveLocation: this.liveLocation,
          buses: this.buses,
          notifications: this.notifications,
          students: this.students,
          tripElapsedSeconds: this.tripElapsedSeconds,
          gpsMode: this.gpsMode,
        },
      });
    }
  }

  private applyExternalState(payload: any) {
    if (!payload) return;
    if (payload.liveLocation) this.liveLocation = payload.liveLocation;
    if (payload.buses) this.buses = payload.buses;
    if (payload.notifications) this.notifications = payload.notifications;
    if (payload.students) this.students = payload.students;
    if (payload.tripElapsedSeconds !== undefined) this.tripElapsedSeconds = payload.tripElapsedSeconds;
    if (payload.gpsMode) this.gpsMode = payload.gpsMode;
    this.listeners.forEach((fn) => fn());
  }

  // Live Location Subscription for Parents
  private initLiveLocationSubscription() {
    if (this.unsubscribeLiveLocation) {
      this.unsubscribeLiveLocation();
      this.unsubscribeLiveLocation = null;
    }

    if (this.activeBusId) {
      this.unsubscribeLiveLocation = liveLocationService.subscribeToBusLocation(
        this.activeBusId,
        (data) => {
          // Calculate distance and ETA from student pickup point
          const pickup = this.getPickupPoint();
          let dist = data.distanceKm;
          if (pickup && data.lat && data.lng) {
            dist = calculateDistanceKm(data.lat, data.lng, pickup.lat, pickup.lng);
          }
          const eta = estimateEtaMinutes(dist, data.speed || 25);

          this.liveLocation = {
            ...data,
            distanceKm: dist,
            etaMinutes: eta,
          };

          this.checkGeofenceAlert(dist);
          this.notify();
        }
      );
    }
  }

  // Mode toggling (LIVE vs DEMO)
  public setGpsMode(mode: GPSMode) {
    this.gpsMode = mode;
    localStorage.setItem('schoolbus_gps_mode', mode);
    if (mode === 'DEMO') {
      this.stopHardwareGps();
    } else {
      if (this.isSimulating) {
        this.toggleSimulation(); // stop simulation
      }
    }
    this.notify();
  }

  // Language management
  public setLanguage(lang: Language) {
    this.language = lang;
    localStorage.setItem('schoolbus_lang', lang);
    this.notify();
  }

  // Role management
  public setRole(role: UserRole) {
    this.role = role;
    authService.quickLoginAsRole(role);
    localStorage.setItem('schoolbus_role', role);
    this.notify();
  }

  public setSelectedStudent(studentId: string) {
    this.activeStudentId = studentId;
    const std = this.students.find((s) => s.id === studentId);
    if (std) {
      this.activeBusId = std.busId;
      this.initLiveLocationSubscription();
    }
    this.notify();
  }

  public updateStudentStatus(studentId: string, status: StudentStatus) {
    const now = Date.now();
    this.students = this.students.map((s) =>
      s.id === studentId
        ? {
            ...s,
            status,
            boardedAt: status === 'Boarded' ? now : s.boardedAt,
            droppedAt: status === 'Dropped Safely' ? now : s.droppedAt,
          }
        : s
    );

    const std = this.students.find((s) => s.id === studentId);
    if (status === 'Boarded') {
      this.addNotification({
        type: 'bus_approaching',
        titleEn: 'Student Boarded Bus Safely',
        titleTe: 'విద్యార్థి సురక్షితంగా బస్సు ఎక్కారు',
        messageEn: `${std?.name || 'Student'} boarded Bus-07 at pickup stop.`,
        messageTe: `${std?.nameTe || 'విద్యార్థి'} బస్సు-07 ఎక్కారు.`,
        studentId,
      });
    } else if (status === 'Dropped Safely') {
      this.addNotification({
        type: 'trip_completed',
        titleEn: 'Student Dropped Safely',
        titleTe: 'విద్యార్థి సురక్షితంగా చేరారు',
        messageEn: `${std?.name || 'Student'} arrived safely at destination.`,
        messageTe: `${std?.nameTe || 'విద్యార్థి'} సురక్షితంగా గమ్యస్థానానికి చేరారు.`,
        studentId,
      });
    }

    this.notify();
  }

  // Active getters
  public getStudent(): Student | undefined {
    return this.students.find((s) => s.id === this.activeStudentId) || this.students[0];
  }

  public getBus(): Bus | undefined {
    return this.buses.find((b) => b.id === this.activeBusId) || this.buses[0];
  }

  public getDriver(): Driver | undefined {
    const bus = this.getBus();
    if (!bus) return this.drivers[0];
    return this.drivers.find((d) => d.id === bus.driverId) || this.drivers[0];
  }

  public getPickupPoint(): PickupPoint | undefined {
    const std = this.getStudent();
    if (!std) return this.pickupPoints[0];
    return this.pickupPoints.find((p) => p.id === std.pickupPointId) || this.pickupPoints[0];
  }

  // Geofence check
  private checkGeofenceAlert(distanceKm: number) {
    const pickup = this.getPickupPoint();
    const radiusMeters = pickup?.geofenceRadiusMeters || 500;
    const radiusKm = radiusMeters / 1000;

    if (distanceKm <= radiusKm && !this.hasTriggeredGeofence) {
      this.hasTriggeredGeofence = true;
      this.addNotification({
        type: 'bus_approaching',
        titleEn: `🔔 GEOFENCE ALERT: Bus within ${radiusMeters}m!`,
        titleTe: `🔔 జీయోఫెన్స్ హెచ్చరిక: బస్సు ${radiusMeters}మీ పరిధిలో ఉంది!`,
        messageEn: `Bus-07 is approaching your pickup stop (${pickup?.name || 'Main Road'}). Please be ready.`,
        messageTe: `బస్సు-07 మీ పికప్ స్టాప్ (${pickup?.nameTe || 'మెయిన్ రోడ్'}) కు సమీపిస్తోంది. దయచేసి సిద్ధంగా ఉండండి.`,
        highPriority: true,
        busId: this.activeBusId,
      });
    } else if (distanceKm > radiusKm + 0.3) {
      // Reset trigger when bus moves away
      this.hasTriggeredGeofence = false;
    }
  }

  // Trip operations
  public async startTrip(tripType: 'morning' | 'return') {
    const status: BusTripStatus = tripType === 'morning' ? 'MORNING_TRIP' : 'RETURN_TRIP';
    this.hasTriggeredGeofence = false;

    // Create trip record
    const trip = await tripService.createTrip(this.activeBusId, 'drv_ravi', tripType);
    this.activeTripId = trip.id;

    this.buses = this.buses.map((b) =>
      b.id === this.activeBusId ? { ...b, status, speedKmh: 26 } : b
    );

    this.liveLocation = {
      ...this.liveLocation,
      tripStatus: status,
      tripId: trip.id,
      timestamp: Date.now(),
    };

    this.tripElapsedSeconds = 0;
    this.startTripTimer();

    // If LIVE mode, activate real hardware GPS
    if (this.gpsMode === 'LIVE') {
      this.startHardwareGps();
    } else {
      // Demo mode
      this.startSimulation();
    }

    this.addNotification({
      type: 'bus_started',
      titleEn: tripType === 'morning' ? 'Morning Trip Started' : 'Return Trip Started',
      titleTe: tripType === 'morning' ? 'ఉదయం ప్రయాణం ప్రారంభమైంది' : 'తిరుగు ప్రయాణం ప్రారంభమైంది',
      messageEn: `Bus-07 driver has started the ${tripType} trip. Live GPS location is broadcasting.`,
      messageTe: `బస్సు-07 డ్రైవర్ ట్రిప్ ప్రారంభించారు. లైవ్ లొకేషన్ ప్రసారం ప్రారంభమైంది.`,
      busId: this.activeBusId,
    });

    auditService.logAction('TRIP_STARTED', { busId: this.activeBusId, tripType, tripId: trip.id });
    this.notify();
  }

  public async stopTrip() {
    this.buses = this.buses.map((b) =>
      b.id === this.activeBusId ? { ...b, status: 'COMPLETED', speedKmh: 0 } : b
    );

    this.liveLocation = {
      ...this.liveLocation,
      tripStatus: 'COMPLETED',
      speed: 0,
      timestamp: Date.now(),
    };

    if (this.tripTimer) {
      clearInterval(this.tripTimer);
      this.tripTimer = null;
    }

    if (this.activeTripId) {
      await tripService.endTrip(this.activeTripId, 6.2);
    }

    this.stopHardwareGps();
    this.isSimulating = false;
    if (this.simInterval) clearInterval(this.simInterval);

    this.addNotification({
      type: 'trip_completed',
      titleEn: 'Trip Successfully Completed',
      titleTe: 'ప్రయాణం విజయవంతంగా పూర్తయింది',
      messageEn: 'Bus-07 has arrived safely at destination. GPS broadcast ended.',
      messageTe: 'బస్సు-07 సురక్షితంగా గమ్యస్థానానికి చేరింది. జీపీఎస్ బ్రాడ్‌కాస్ట్ నిలిపివేయబడింది.',
      busId: this.activeBusId,
    });

    auditService.logAction('TRIP_STOPPED', { busId: this.activeBusId, tripId: this.activeTripId });
    this.notify();
  }

  // Emergency SOS Trigger
  public async triggerEmergency(reason: string = 'Driver pressed Emergency SOS Button') {
    const bus = this.getBus();
    if (!bus) return;

    this.buses = this.buses.map((b) =>
      b.id === this.activeBusId ? { ...b, status: 'EMERGENCY' } : b
    );

    this.liveLocation = {
      ...this.liveLocation,
      tripStatus: 'EMERGENCY',
      status: 'EMERGENCY',
      timestamp: Date.now(),
    };

    if (this.activeTripId) {
      await tripService.triggerEmergency(this.activeTripId, this.activeBusId, reason);
    }

    this.addNotification({
      type: 'emergency_alert',
      titleEn: '🚨 EMERGENCY SOS ALERT: Bus-07',
      titleTe: '🚨 అత్యవసర SOS హెచ్చరిక: బస్సు-07',
      messageEn: `Emergency triggered on Bus-07 (${bus.plateNumber}). School transport desk notified. Emergency response dispatched.`,
      messageTe: `బస్సు-07 పై అత్యవసర హెచ్చరిక జారీ చేయబడింది. పాఠశాల రవాణా డెస్క్ మరియు భద్రతా బృందానికి సమాచారం అందించబడింది.`,
      highPriority: true,
      busId: this.activeBusId,
    });

    auditService.logAction('EMERGENCY_TRIGGERED', {
      busId: this.activeBusId,
      reason,
      lat: this.liveLocation.lat,
      lng: this.liveLocation.lng,
    });

    this.notify();
  }

  private startTripTimer() {
    if (this.tripTimer) clearInterval(this.tripTimer);
    this.tripTimer = setInterval(() => {
      const bus = this.getBus();
      if (
        bus &&
        (bus.status === 'MORNING_TRIP' ||
          bus.status === 'RETURN_TRIP' ||
          bus.status === 'EMERGENCY')
      ) {
        this.tripElapsedSeconds++;
        this.notify();
      }
    }, 1000);
  }

  // Simulation mode
  public startSimulation() {
    this.stopHardwareGps();
    this.isSimulating = true;
    if (this.simInterval) clearInterval(this.simInterval);

    this.simInterval = setInterval(() => {
      this.simStep = (this.simStep + 1) % BUS_07_WAYPOINTS.length;
      const currentWp = BUS_07_WAYPOINTS[this.simStep];
      const pickup = this.getPickupPoint();

      let dist = currentWp.distanceKm;
      if (pickup) {
        dist = calculateDistanceKm(currentWp.lat, currentWp.lng, pickup.lat, pickup.lng);
      }
      const eta = estimateEtaMinutes(dist, currentWp.speed);

      this.liveLocation = {
        ...this.liveLocation,
        lat: currentWp.lat,
        lng: currentWp.lng,
        speed: currentWp.speed,
        heading: currentWp.heading,
        locationName: currentWp.locationName,
        locationNameTe: currentWp.locationNameTe,
        distanceKm: dist,
        etaMinutes: eta,
        timestamp: Date.now(),
        isRealGps: false,
      };

      this.checkGeofenceAlert(dist);
      this.notify();
    }, 3500);
  }

  public toggleSimulation() {
    if (this.isSimulating) {
      this.isSimulating = false;
      if (this.simInterval) clearInterval(this.simInterval);
      this.notify();
    } else {
      this.startSimulation();
      this.notify();
    }
  }

  // Real Hardware GPS tracking using Device Navigator Geolocation
  public startHardwareGps() {
    this.isSimulating = false;
    if (this.simInterval) clearInterval(this.simInterval);
    this.isHardwareGpsActive = true;
    this.gpsError = null;

    const pickup = this.getPickupPoint();

    gpsService.startTracking({
      busId: this.activeBusId,
      driverId: 'drv_ravi',
      tripId: this.activeTripId || undefined,
      pickupLat: pickup?.lat,
      pickupLng: pickup?.lng,
      onUpdate: (location) => {
        this.liveLocation = location;
        this.checkGeofenceAlert(location.distanceKm);
        this.notify();
      },
      onError: (errMsg) => {
        this.gpsError = errMsg;
        this.isHardwareGpsActive = false;
        this.notify();
      },
    });

    this.notify();
  }

  public stopHardwareGps() {
    gpsService.stopTracking();
    this.isHardwareGpsActive = false;
    this.notify();
  }

  // Notifications
  public addNotification(item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) {
    const newItem: NotificationItem = {
      ...item,
      id: `notif_${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    this.notifications = [newItem, ...this.notifications];
    this.notify();
  }

  public markAllNotificationsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.notify();
  }

  public saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('schoolbus_school_info', JSON.stringify(this.schoolInfo));
      localStorage.setItem('schoolbus_students', JSON.stringify(this.students));
      localStorage.setItem('schoolbus_buses', JSON.stringify(this.buses));
      localStorage.setItem('schoolbus_drivers', JSON.stringify(this.drivers));
      localStorage.setItem('schoolbus_pickup_points', JSON.stringify(this.pickupPoints));
      localStorage.setItem('schoolbus_route_stops', JSON.stringify(this.routeStops));
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  }

  // School Info Operations
  public updateSchoolInfo(updates: Partial<SchoolInfo>) {
    this.schoolInfo = { ...this.schoolInfo, ...updates };
    if (updates.name || updates.nameTe) {
      this.students = this.students.map((s) => ({
        ...s,
        schoolName: updates.name || s.schoolName,
        schoolNameTe: updates.nameTe || s.schoolNameTe,
      }));
    }
    this.saveToStorage();
    auditService.logAction('STUDENT_UPDATED', { updates });
    this.notify();
  }

  // Driver Operations
  public updateDriver(driverId: string, updates: Partial<Driver>) {
    this.drivers = this.drivers.map((d) => (d.id === driverId ? { ...d, ...updates } : d));
    const driver = this.drivers.find((d) => d.id === driverId);
    if (driver) {
      this.buses = this.buses.map((b) =>
        b.driverId === driverId
          ? {
              ...b,
              driverName: driver.name,
              driverNameTe: driver.nameTe,
              driverPhone: driver.phone,
            }
          : b
      );
    }
    this.saveToStorage();
    auditService.logAction('DRIVER_ASSIGNED', { driverId, updates });
    this.notify();
  }

  public addDriver(driverData: Omit<Driver, 'id'>) {
    const newDriver: Driver = {
      ...driverData,
      id: `drv_${Date.now()}`,
    };
    this.drivers.push(newDriver);
    this.saveToStorage();
    auditService.logAction('DRIVER_ASSIGNED', { driverId: newDriver.id, name: newDriver.name });
    this.notify();
    return newDriver;
  }

  // Bus Operations
  public updateBus(busId: string, updates: Partial<Bus>) {
    this.buses = this.buses.map((b) => (b.id === busId ? { ...b, ...updates } : b));
    if (this.activeBusId === busId) {
      if (updates.busNumber) {
        this.liveLocation = { ...this.liveLocation, busId: updates.busNumber };
      }
    }
    this.saveToStorage();
    auditService.logAction('BUS_ASSIGNED', { busId, updates });
    this.notify();
  }

  public addBus(busData: Omit<Bus, 'id'>) {
    const newBus: Bus = {
      ...busData,
      id: `bus_${Date.now()}`,
    };
    this.buses.push(newBus);
    this.saveToStorage();
    auditService.logAction('BUS_ASSIGNED', { busId: newBus.id, busNumber: newBus.busNumber });
    this.notify();
    return newBus;
  }

  // Pickup Point Operations
  public updatePickupPoint(pointId: string, updates: Partial<PickupPoint>) {
    this.pickupPoints = this.pickupPoints.map((p) => (p.id === pointId ? { ...p, ...updates } : p));
    this.saveToStorage();
    this.notify();
  }

  // Admin Operations
  public addStudent(studentData: Omit<Student, 'id'>) {
    const newStudent: Student = {
      ...studentData,
      id: `std_${Date.now()}`,
    };
    this.students.push(newStudent);
    this.saveToStorage();
    auditService.logAction('STUDENT_CREATED', { studentId: newStudent.id, name: newStudent.name });
    this.notify();
  }

  public updateStudent(id: string, updates: Partial<Student>) {
    this.students = this.students.map((s) => (s.id === id ? { ...s, ...updates } : s));
    this.saveToStorage();
    auditService.logAction('STUDENT_UPDATED', { studentId: id, updates });
    this.notify();
  }

  public deleteStudent(id: string) {
    this.students = this.students.filter((s) => s.id !== id);
    this.saveToStorage();
    auditService.logAction('STUDENT_DELETED', { studentId: id });
    this.notify();
  }

  public updateGeofenceRadius(radiusMeters: number) {
    this.pickupPoints = this.pickupPoints.map((p) => ({
      ...p,
      geofenceRadiusMeters: radiusMeters,
    }));
    this.saveToStorage();
    auditService.logAction('GEOFENCE_UPDATED', { radiusMeters });
    this.notify();
  }

  public resetAllToDefault() {
    this.schoolInfo = { ...INITIAL_SCHOOL_INFO };
    this.students = [...INITIAL_STUDENTS];
    this.buses = [...INITIAL_BUSES];
    this.drivers = [...INITIAL_DRIVERS];
    this.pickupPoints = [...INITIAL_PICKUP_POINTS];
    this.routeStops = [...INITIAL_ROUTE_STOPS];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('schoolbus_school_info');
      localStorage.removeItem('schoolbus_students');
      localStorage.removeItem('schoolbus_buses');
      localStorage.removeItem('schoolbus_drivers');
      localStorage.removeItem('schoolbus_pickup_points');
      localStorage.removeItem('schoolbus_route_stops');
    }
    this.notify();
  }

  public sendBroadcast(target: string, enMsg: string, teMsg: string) {
    this.addNotification({
      type: 'school_announcement',
      titleEn: 'School Broadcast',
      titleTe: 'పాఠశాల ప్రకటన',
      messageEn: enMsg,
      messageTe: teMsg,
      highPriority: true,
    });
    auditService.logAction('BROADCAST_SENT', { target, enMsg });
    this.notify();
  }
}

export const store = new AppStore();
