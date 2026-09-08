// Production-grade Driver GPS Hardware Tracking Service
import { rtdb, isFirebaseConfigured } from './firebase';
import { ref, set } from 'firebase/database';
import { LiveLocationData, BusTripStatus } from '../types';
import { offlineQueue } from './offlineQueue';
import { calculateDistanceKm, estimateEtaMinutes } from './store';

export interface TrackingOptions {
  busId: string;
  driverId: string;
  tripId?: string;
  pickupLat?: number;
  pickupLng?: number;
  onUpdate?: (data: LiveLocationData) => void;
  onError?: (errMessage: string) => void;
  minIntervalMs?: number; // Throttle interval (default 3000ms)
}

export interface GpsStatus {
  isTracking: boolean;
  accuracyMeters: number | null;
  lastTimestamp: number | null;
  pointsLoggedCount: number;
  pendingOfflineCount: number;
  isOnline: boolean;
  error: string | null;
}

class GpsService {
  private watchId: number | null = null;
  private currentBusId: string | null = null;
  private currentDriverId: string | null = null;
  private currentTripId: string | null = null;
  private pickupLat: number | null = null;
  private pickupLng: number | null = null;

  private lastSentTime: number = 0;
  private lastLat: number | null = null;
  private lastLng: number | null = null;
  private pointsLogged: number = 0;
  private minIntervalMs: number = 3000; // 3-10 sec throttle

  private isTracking: boolean = false;
  private accuracy: number | null = null;
  private lastError: string | null = null;
  private updateCallbacks: Set<(data: LiveLocationData) => void> = new Set();
  private errorCallbacks: Set<(err: string) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.flushOfflineQueue();
      });
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'geolocation' in navigator;
  }

  public getTrackingStatus(): GpsStatus {
    return {
      isTracking: this.isTracking,
      accuracyMeters: this.accuracy,
      lastTimestamp: this.lastSentTime || null,
      pointsLoggedCount: this.pointsLogged,
      pendingOfflineCount: 0,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      error: this.lastError,
    };
  }

  public async startTracking(options: TrackingOptions): Promise<boolean> {
    if (!this.isSupported()) {
      const msg = 'GPS is not supported by your device or browser.';
      this.lastError = msg;
      options.onError?.(msg);
      return false;
    }

    this.stopTracking();

    this.currentBusId = options.busId;
    this.currentDriverId = options.driverId;
    this.currentTripId = options.tripId || `trip_${Date.now()}`;
    this.pickupLat = options.pickupLat || null;
    this.pickupLng = options.pickupLng || null;
    this.minIntervalMs = options.minIntervalMs || 3000;
    this.pointsLogged = 0;
    this.lastError = null;

    if (options.onUpdate) this.updateCallbacks.add(options.onUpdate);
    if (options.onError) this.errorCallbacks.add(options.onError);

    try {
      this.isTracking = true;

      this.watchId = navigator.geolocation.watchPosition(
        (pos) => this.handleGpsPosition(pos),
        (err) => this.handleGpsError(err),
        {
          enableHighAccuracy: true,
          maximumAge: 2000,
          timeout: 12000,
        }
      );

      return true;
    } catch (e: any) {
      this.isTracking = false;
      const errorMsg = `Unable to start GPS: ${e?.message || 'Unknown error'}`;
      this.lastError = errorMsg;
      this.errorCallbacks.forEach((cb) => cb(errorMsg));
      return false;
    }
  }

  public stopTracking() {
    if (this.watchId !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
    this.currentBusId = null;
    this.currentDriverId = null;
    this.currentTripId = null;
    this.updateCallbacks.clear();
    this.errorCallbacks.clear();
  }

  private handleGpsPosition(pos: GeolocationPosition) {
    const now = Date.now();
    const { latitude, longitude, speed, heading, accuracy } = pos.coords;
    this.accuracy = Math.round(accuracy);

    // Adaptive throttling:
    // Moving (> 15 km/h) -> 3-4 seconds
    // Slow (5-15 km/h) -> 5 seconds
    // Stationary (< 5 km/h) -> 10 seconds
    const speedKmh = speed && speed > 0 ? Math.round(speed * 3.6) : 0;
    let throttleMs = this.minIntervalMs;
    if (speedKmh > 15) {
      throttleMs = 3000;
    } else if (speedKmh > 5) {
      throttleMs = 5000;
    } else {
      throttleMs = 8000;
    }

    const elapsed = now - this.lastSentTime;
    const movedMeters =
      this.lastLat !== null && this.lastLng !== null
        ? calculateDistanceKm(this.lastLat, this.lastLng, latitude, longitude) * 1000
        : 999;

    // Send update if interval elapsed OR moved more than 20 meters
    if (elapsed < throttleMs && movedMeters < 20) {
      return;
    }

    this.lastSentTime = now;
    this.lastLat = latitude;
    this.lastLng = longitude;
    this.pointsLogged++;

    const busId = this.currentBusId || 'bus_07';
    const driverId = this.currentDriverId || 'drv_ravi';

    // Calculate distance and ETA to student pickup point
    let distanceKm = 1.8;
    let etaMinutes = 7;
    if (this.pickupLat !== null && this.pickupLng !== null) {
      distanceKm = calculateDistanceKm(latitude, longitude, this.pickupLat, this.pickupLng);
      etaMinutes = estimateEtaMinutes(distanceKm, speedKmh || 26);
    }

    const locationData: LiveLocationData = {
      busId,
      lat: latitude,
      lng: longitude,
      latitude,
      longitude,
      speed: speedKmh || 26,
      heading: heading && !isNaN(heading) ? Math.round(heading) : 45,
      accuracy: Math.round(accuracy),
      timestamp: now,
      tripStatus: 'MORNING_TRIP',
      driverId,
      tripId: this.currentTripId || undefined,
      locationName: 'Active Mobile GPS Location',
      locationNameTe: 'లైవ్ మొబైల్ జీపీఎస్ లొకేషన్',
      distanceKm,
      etaMinutes,
      isRealGps: true,
      status: 'MORNING_TRIP',
    };

    // 1. Broadcast to local subscribers
    this.updateCallbacks.forEach((cb) => cb(locationData));

    // 2. Transmit to Firebase Realtime Database
    this.transmitToFirebase(busId, locationData);
  }

  private async transmitToFirebase(busId: string, locationData: LiveLocationData) {
    // Check network state
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    if (!isOnline) {
      // Offline fallback: Buffer in IndexedDB
      await offlineQueue.enqueue(busId, locationData);
      return;
    }

    if (isFirebaseConfigured && rtdb) {
      try {
        const liveLocationRef = ref(rtdb, `liveLocations/${busId}`);
        await set(liveLocationRef, {
          latitude: locationData.lat,
          longitude: locationData.lng,
          speed: locationData.speed,
          heading: locationData.heading,
          accuracy: locationData.accuracy,
          timestamp: locationData.timestamp,
          driverId: locationData.driverId,
          tripId: locationData.tripId || null,
          status: locationData.tripStatus,
        });
      } catch (err) {
        console.warn('Firebase RTDB write error, caching offline:', err);
        await offlineQueue.enqueue(busId, locationData);
      }
    }
  }

  private handleGpsError(err: GeolocationPositionError) {
    let errorMsg = 'GPS location error occurred.';
    switch (err.code) {
      case err.PERMISSION_DENIED:
        errorMsg = 'GPS permission is required to start live tracking.';
        break;
      case err.POSITION_UNAVAILABLE:
        errorMsg = 'GPS position is currently unavailable. Check satellite signal.';
        break;
      case err.TIMEOUT:
        errorMsg = 'GPS location request timed out. Retrying...';
        break;
      default:
        errorMsg = `GPS Error: ${err.message}`;
    }
    this.lastError = errorMsg;
    this.errorCallbacks.forEach((cb) => cb(errorMsg));
  }

  public async flushOfflineQueue(): Promise<number> {
    if (!isFirebaseConfigured || !rtdb) return 0;
    return offlineQueue.drain(async (busId, location) => {
      try {
        const liveLocationRef = ref(rtdb, `liveLocations/${busId}`);
        await set(liveLocationRef, {
          latitude: location.lat,
          longitude: location.lng,
          speed: location.speed,
          heading: location.heading,
          accuracy: location.accuracy,
          timestamp: location.timestamp,
          driverId: location.driverId,
          tripId: location.tripId || null,
          status: location.tripStatus,
        });
        return true;
      } catch {
        return false;
      }
    });
  }
}

export const gpsService = new GpsService();
