// User Authentication Service supporting Firebase Auth and Dev Demo Access
import { auth, isFirebaseConfigured, db } from './firebase';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserAccount, UserRole, Language } from '../types';

const DEMO_ACCOUNTS: Record<string, UserAccount> = {
  'parent@schoolbus.live': {
    id: 'user_parent_01',
    name: 'Sadvik Sharma (Parent)',
    nameTe: 'సాద్విక్ శర్మ (తల్లిదండ్రులు)',
    email: 'parent@schoolbus.live',
    phone: '+91 99887 76655',
    role: 'PARENT',
    language: 'en',
    status: 'active',
    linkedStudentIds: ['std_sadvik', 'std_ananya'],
    selectedChildId: 'std_sadvik',
  },
  'driver@schoolbus.live': {
    id: 'user_driver_01',
    name: 'Ravi Kumar (Bus Driver)',
    nameTe: 'రవి కుమార్ (బస్సు డ్రైవర్)',
    email: 'driver@schoolbus.live',
    phone: '+91 98765 43210',
    role: 'DRIVER',
    language: 'te',
    status: 'active',
    assignedBusId: 'bus_07',
    licenseNo: 'DL-09201488219',
  },
  'admin@schoolbus.live': {
    id: 'user_admin_01',
    name: 'DPS Transport Administrator',
    nameTe: 'డిపిఎస్ రవాణా నిర్వాహకులు',
    email: 'admin@schoolbus.live',
    phone: '+91 40 2345 6789',
    role: 'ADMIN',
    language: 'en',
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
      // Default to demo parent account on first open for frictionless preview
      this.currentUser = DEMO_ACCOUNTS['parent@schoolbus.live'];
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
   * Tries real Firebase Auth first if configured, else checks pre-configured demo users.
   */
  public async login(email: string, pass: string): Promise<UserAccount> {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Check Demo Accounts First (for seamless development testing)
    if (DEMO_ACCOUNTS[trimmedEmail]) {
      this.currentUser = DEMO_ACCOUNTS[trimmedEmail];
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
    throw new Error('Account not found. Please use a verified school account or demo profile.');
  }

  /**
   * Quick-login for demo mode roles
   */
  public quickLoginAsRole(role: UserRole): UserAccount {
    const demoEmail =
      role === 'PARENT'
        ? 'parent@schoolbus.live'
        : role === 'DRIVER'
        ? 'driver@schoolbus.live'
        : 'admin@schoolbus.live';

    this.currentUser = DEMO_ACCOUNTS[demoEmail];
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
