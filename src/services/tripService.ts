// Trip Management Service supporting Firebase Realtime Database & Emergency Dispatch
import { rtdb, isFirebaseConfigured } from './firebase';
import { ref, set, update } from 'firebase/database';
import { Trip, TripState } from '../types';

export const tripService = {
  async createTrip(busId: string, driverId: string, type: 'morning' | 'return'): Promise<Trip> {
    const newTrip: Trip = {
      id: `trip_${Date.now()}`,
      busId,
      driverId,
      type,
      startedAt: Date.now(),
      status: 'LIVE',
      distanceTraveledKm: 0,
      passengerCount: 0,
      boardedStudentIds: [],
    };

    if (isFirebaseConfigured && rtdb) {
      try {
        await set(ref(rtdb, `trips/${newTrip.id}`), newTrip);
      } catch (e) {
        console.warn('Firebase RTDB trip creation warning:', e);
      }
    }

    return newTrip;
  },

  async endTrip(tripId: string, distanceKm: number): Promise<void> {
    if (isFirebaseConfigured && rtdb && tripId) {
      try {
        await update(ref(rtdb, `trips/${tripId}`), {
          endedAt: Date.now(),
          status: 'COMPLETED' as TripState,
          distanceTraveledKm: distanceKm,
        });
      } catch (e) {
        console.warn('Firebase RTDB trip completion update warning:', e);
      }
    }
  },

  async triggerEmergency(tripId: string, busId: string, description: string): Promise<void> {
    if (isFirebaseConfigured && rtdb && tripId) {
      try {
        await update(ref(rtdb, `trips/${tripId}`), {
          status: 'EMERGENCY' as TripState,
          lastEmergencyAt: Date.now(),
        });
        const eventId = `event_${Date.now()}`;
        await set(ref(rtdb, `emergencyEvents/${eventId}`), {
          id: eventId,
          tripId,
          busId,
          description,
          timestamp: Date.now(),
          resolved: false,
        });
      } catch (e) {
        console.warn('Firebase RTDB emergency event warning:', e);
      }
    }
  },
};
