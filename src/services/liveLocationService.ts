// Reusable Live Bus Location Subscription Service for Parents & Admin
import { rtdb, isFirebaseConfigured } from './firebase';
import { ref, onValue, off } from 'firebase/database';
import { LiveLocationData, BusTripStatus } from '../types';

export interface StaleStatus {
  isStale: boolean;
  messageEn: string;
  messageTe: string;
  secondsSinceUpdate: number;
}

export function evaluateLocationFreshness(timestamp: number): StaleStatus {
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - timestamp) / 1000));

  if (diffSec > 300) {
    return {
      isStale: true,
      messageEn: 'Bus location unavailable (>5 min)',
      messageTe: 'బస్సు లొకేషన్ అందుబాటులో లేదు (>5 నిమి)',
      secondsSinceUpdate: diffSec,
    };
  } else if (diffSec > 60) {
    return {
      isStale: true,
      messageEn: `GPS signal delayed (${diffSec}s ago)`,
      messageTe: `జీపీఎస్ సిగ్నల్ ఆలస్యమైంది (${diffSec} సెకండ్ల క్రితం)`,
      secondsSinceUpdate: diffSec,
    };
  } else if (diffSec > 30) {
    return {
      isStale: true,
      messageEn: `Connection delayed (${diffSec}s ago)`,
      messageTe: `కనెక్షన్ ఆలస్యమైంది (${diffSec} సెకండ్ల క్రితం)`,
      secondsSinceUpdate: diffSec,
    };
  }

  return {
    isStale: false,
    messageEn: 'Live',
    messageTe: 'లైవ్',
    secondsSinceUpdate: diffSec,
  };
}

export const liveLocationService = {
  /**
   * Subscribes to Firebase Realtime Database for a specific bus ID.
   * Returns an unsubscribe function.
   */
  subscribeToBusLocation(
    busId: string,
    onLocationUpdate: (data: LiveLocationData) => void,
    onError?: (err: Error) => void
  ): () => void {
    if (!isFirebaseConfigured || !rtdb) {
      // In local demo or unconfigured mode, caller relies on local store updates
      return () => {};
    }

    try {
      const busLocationRef = ref(rtdb, `liveLocations/${busId}`);

      const unsubscribe = onValue(
        busLocationRef,
        (snapshot) => {
          const val = snapshot.val();
          if (val && (val.latitude || val.lat)) {
            const lat = Number(val.latitude ?? val.lat);
            const lng = Number(val.longitude ?? val.lng);
            const timestamp = Number(val.timestamp || Date.now());
            const freshness = evaluateLocationFreshness(timestamp);

            const parsedData: LiveLocationData = {
              busId,
              lat,
              lng,
              latitude: lat,
              longitude: lng,
              speed: Number(val.speed || 0),
              heading: Number(val.heading || 0),
              accuracy: Number(val.accuracy || 5),
              timestamp,
              tripStatus: (val.status || val.tripStatus || 'MORNING_TRIP') as BusTripStatus,
              driverId: val.driverId || 'drv_ravi',
              tripId: val.tripId || undefined,
              locationName: val.locationName || 'Live GPS Telematics',
              locationNameTe: val.locationNameTe || 'లైవ్ జీపీఎస్ టెలిమెట్రిక్స్',
              distanceKm: Number(val.distanceKm || 1.8),
              etaMinutes: Number(val.etaMinutes || 7),
              isRealGps: true,
              isStale: freshness.isStale,
              staleMessage: freshness.messageEn,
            };

            onLocationUpdate(parsedData);
          }
        },
        (error) => {
          console.warn(`Error subscribing to /liveLocations/${busId}:`, error);
          onError?.(error);
        }
      );

      return () => {
        off(busLocationRef);
      };
    } catch (err: any) {
      console.warn('Live location subscription failed:', err);
      onError?.(err);
      return () => {};
    }
  },
};
