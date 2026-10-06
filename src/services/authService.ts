// User Authentication Service supporting Firebase Auth and Official School Portal Access
import { auth, isFirebaseConfigured, db } from './firebase';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserAccount, UserRole, Language } from '../types';

const OFFICIAL_ACCOUNTS: Record<string, UserAccount> = {
  'parent@srichaitanya.school': {
    id: 'user_parent_01',
    name: 'A. Srinivas (Parent)',
    nameTe: 'ఎ. శ్రీనివాస్ (తల్లిదండ్రులు)',
    email: 'parent@srichaitanya.school',
    phone: '+91 99510 44459',
    role: 'PARENT',
    language: 'te',
    status: 'active',
    linkedStudentIds: ['std_sadvik', 'std_ananya'],
    selectedChildId: 'std_sadvik',
  },
  'driver@srichaitanya.school': {
    id: 'user_driver_01',
    name: 'Ravi Kumar (Bus Driver)',
    nameTe: 'రవి కుమార్ (బస్సు #07 పైలట్)',
    email: 'driver@srichaitanya.school',
    phone: '+91 99510 44469',
    role: 'DRIVER',
    language: 'te',
    status: 'active',
    assignedBusId: 'bus_07',
    licenseNo: 'DL-TG09201488219',
  },
  'admin@srichaitanya.school': {
    id: 'user_admin_01',
    name: 'Sri Chaitanya Administrator',
    nameTe: 'శ్రీ చైతన్య రవాణా అధికారి',
    email: 'admin@srichaitanya.school',
    phone: '+91 99510 44459',
    role: 'ADMIN',
    language: 'te',
    status: 'active',
  },
  // Backward compatibility aliases
  'parent@schoolbus.live': {
    id: 'user_parent_01',
    name: 'A. Srinivas (Parent)',
    nameTe: 'ఎ. శ్రీనివాస్ (తల్లిదండ్రులు)',
    email: 'parent@srichaitanya.school',
    phone: '+91 99510 44459',
    role: 'PARENT',
    language: 'te',
    status: 'active',
    linkedStudentIds: ['std_sadvik', 'std_ananya'],
    selectedChildId: 'std_sadvik',
  },
  'driver@schoolbus.live': {
    id: 'user_driver_01',
    name: 'Ravi Kumar (Bus Driver)',
    nameTe: 'రవి కుమార్ (బస్సు #07 పైలట్)',
    email: 'driver@srichaitanya.school',
    phone: '+91 99510 44469',
    role: 'DRIVER',
    language: 'te',
    status: 'active',
    assignedBusId: 'bus_07',
    licenseNo: 'DL-TG09201488219',
  },
  'admin@schoolbus.live': {
    id: 'user_admin_01',
    name: 'Sri Chaitanya Administrator',
    nameTe: 'శ్రీ చైతన్య రవాణా అధికారి',
    email: 'admin@srichaitanya.school',
    phone: '+91 99510 44459',
    role: 'ADMIN',
    language: 'te',
    status: 'active',
  },
};

const STORAGE_KEY = 'schoolbus_current_user';

class AuthService {
  private currentUser: UserAccount | null = null;
  private listeners: Set<(user: UserAccount | null) => void> = new Set();

  constructor() {
    // 1. Restore local session
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch {
        this.currentUser = null;
      }
    } else {
      // Default to official parent account on first open
      this.currentUser = OFFICIAL_ACCOUNTS['parent@srichaitanya.school'];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentUser));
    }

    // 2. If Firebase is configured, bind auth state listener
    if (isFirebaseConfigured && auth) {
      onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          await this.syncFirebaseUserProfile(firebaseUser);
        }
      });
    }
  }

  public getCurrentUser(): UserAccount | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public subscribe(callback: (user: UserAccount | null) => void): () => void {
    this.listeners.add(callback);
    callback(this.currentUser);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.currentUser));
  }

  /**
   * Log in with Email & Password.
   * Checks verified school accounts first, then real Firebase Auth if configured.
   */
  public async login(email: string, pass: string): Promise<UserAccount> {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Check Official Accounts First
    if (OFFICIAL_ACCOUNTS[trimmedEmail]) {
      this.currentUser = OFFICIAL_ACCOUNTS[trimmedEmail];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentUser));
      this.notify();
      return this.currentUser;
    }

    // 2. Real Firebase Auth Attempt
    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, pass);
        const fbUser = userCredential.user;
        const profile = await this.syncFirebaseUserProfile(fbUser);
        return profile;
      } catch (err: any) {
        throw new Error(err.message || 'Invalid email or password.');
      }
    }

    // 3. Fallback for unrecognized email
    throw new Error('Account not found. Please use a verified Sri Chaitanya School account.');
  }

  /**
   * Quick-login for official school roles
   */
  public quickLoginAsRole(role: UserRole): UserAccount {
    const officialEmail =
      role === 'PARENT'
        ? 'parent@srichaitanya.school'
        : role === 'DRIVER'
        ? 'driver@srichaitanya.school'
        : 'admin@srichaitanya.school';

    this.currentUser = OFFICIAL_ACCOUNTS[officialEmail];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentUser));
    this.notify();
    return this.currentUser;
  }

  public async logout(): Promise<void> {
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.warn('Firebase signout warning:', e);
      }
    }
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEY);
    this.notify();
  }

  private async syncFirebaseUserProfile(fbUser: FirebaseUser): Promise<UserAccount> {
    let role: UserRole = 'PARENT';
    let profile: Partial<UserAccount> = {};

    if (db) {
      try {
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          profile = userDoc.data() as UserAccount;
          role = profile.role || 'PARENT';
        }
      } catch (e) {
        console.warn('Could not read user profile from Firestore:', e);
      }
    }

    const account: UserAccount = {
      id: fbUser.uid,
      name: profile.name || fbUser.displayName || 'SchoolBus User',
      email: fbUser.email || '',
      phone: profile.phone || fbUser.phoneNumber || '',
      role,
      language: profile.language || 'en',
      status: 'active',
      linkedStudentIds: profile.linkedStudentIds || ['std_sadvik'],
      selectedChildId: profile.selectedChildId || 'std_sadvik',
      assignedBusId: profile.assignedBusId || (role === 'DRIVER' ? 'bus_07' : undefined),
    };

    this.currentUser = account;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentUser));
    this.notify();
    return account;
  }
}

export const authService = new AuthService();
