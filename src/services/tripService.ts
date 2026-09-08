// Trip Management Service supporting Firestore & Emergency Dispatch
import { db, isFirebaseConfigured } from './firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
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

    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, 'trips'), newTrip);
        newTrip.id = docRef.id;
      } catch (e) {
        console.warn('Firestore trip creation warning:', e);
      }
    }

    return newTrip;
  },

  async endTrip(tripId: string, distanceKm: number): Promise<void> {
    if (isFirebaseConfigured && db && tripId) {
      try {
        await updateDoc(doc(db, 'trips', tripId), {
          endedAt: Date.now(),
          status: 'COMPLETED' as TripState,
          distanceTraveledKm: distanceKm,
        });
      } catch (e) {
        console.warn('Firestore trip completion update warning:', e);
      }
    }
  },

  async triggerEmergency(tripId: string, busId: string, description: string): Promise<void> {
    if (isFirebaseConfigured && db && tripId) {
      try {
        await updateDoc(doc(db, 'trips', tripId), {
          status: 'EMERGENCY' as TripState,
          lastEmergencyAt: Date.now(),
        });
        await addDoc(collection(db, 'emergencyEvents'), {
          tripId,
          busId,
          description,
          timestamp: Date.now(),
          resolved: false,
        });
      } catch (e) {
        console.warn('Firestore emergency event warning:', e);
      }
    }
  },
};
