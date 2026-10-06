// User Authentication Service supporting Firebase Auth and Official School Portal Access
import { auth, isFirebaseConfigured, db } from './firebase';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserAccount, UserRole, Language, UserRegisteredProfile } from '../types';

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
const REGISTERED_PROFILE_KEY = 'schoolbus_registered_profile';
const REGISTERED_USERS_KEY = 'schoolbus_registered_users_map';

class AuthService {
  private currentUser: UserAccount | null = null;
  private listeners: Set<(user: UserAccount | null) => void> = new Set();

  constructor() {
    // 1. Restore local session or registered profile
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      const regProfile = this.getRegisteredProfile();

      if (saved) {
        try {
          this.currentUser = JSON.parse(saved);
        } catch {
          this.currentUser = null;
        }
      } else if (regProfile) {
        const isDriver = regProfile.role === 'DRIVER';
        const cleanMobile = regProfile.mobile.replace(/\D/g, '').slice(-10);
        this.currentUser = {
          id: `user_${cleanMobile}`,
          name: regProfile.name,
          nameTe: regProfile.nameTe || regProfile.name,
          email: `${cleanMobile}@srichaitanya.school`,
          phone: regProfile.mobile,
          role: isDriver ? 'DRIVER' : 'PARENT',
          language: 'te',
          status: 'active',
          dob: regProfile.dob,
          idNumber: regProfile.idNumber,
          areaVillage: regProfile.areaVillage,
          registeredOnDevice: true,
          assignedBusId: 'bus_07',
          licenseNo: isDriver ? regProfile.idNumber || 'DL-TG09201488219' : undefined,
          lastLoginAt: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentUser));
        if (isDriver) {
          localStorage.setItem('schoolbus_staff_auth', 'true');
        }
      } else {
        // First-time user: not yet registered
        this.currentUser = null;
      }
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

  public isDeviceRegistered(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(REGISTERED_PROFILE_KEY);
  }

  public getRegisteredProfile(): UserRegisteredProfile | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(REGISTERED_PROFILE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public registerProfile(profile: UserRegisteredProfile): UserAccount {
    if (typeof window !== 'undefined') {
      localStorage.setItem(REGISTERED_PROFILE_KEY, JSON.stringify(profile));
    }

    const cleanDigits = profile.mobile.replace(/\D/g, '').slice(-10);
    const role: UserRole = profile.role === 'DRIVER' ? 'DRIVER' : 'PARENT';
    const email = `${cleanDigits}@srichaitanya.school`;

    const account: UserAccount = {
      id: `user_${cleanDigits}`,
      name: profile.name,
      nameTe: profile.nameTe || profile.name,
      email,
      phone: profile.mobile,
      role,
      language: 'te',
      status: 'active',
      dob: profile.dob,
      idNumber: profile.idNumber,
      areaVillage: profile.areaVillage,
      registeredOnDevice: true,
      linkedStudentIds: role === 'PARENT' ? ['std_sadvik'] : undefined,
      selectedChildId: role === 'PARENT' ? 'std_sadvik' : undefined,
      assignedBusId: 'bus_07',
      licenseNo: role === 'DRIVER' ? profile.idNumber || 'DL-TG09201488219' : undefined,
      lastLoginAt: Date.now(),
    };

    this.currentUser = account;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
      if (role === 'DRIVER') {
        localStorage.setItem('schoolbus_staff_auth', 'true');
      }

      try {
        const existingMap = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '{}');
        existingMap[cleanDigits] = account;
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(existingMap));
      } catch (e) {
        console.warn('Error saving to registered users map:', e);
      }
    }

    this.notify();
    return account;
  }

  /**
   * Quick-login with Mobile Number without password.
   * Matches against device registered profile, saved users map, or official accounts.
   */
  public loginWithMobile(mobile: string): { user: UserAccount; isDriver: boolean } {
    const cleanDigits = mobile.replace(/\D/g, '').slice(-10);
    if (cleanDigits.length < 10) {
      throw new Error('దయచేసి 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి (Please enter a valid 10-digit mobile number).');
    }

    // 1. Check if device profile matches
    const devProfile = this.getRegisteredProfile();
    if (devProfile) {
      const devClean = devProfile.mobile.replace(/\D/g, '').slice(-10);
      if (devClean === cleanDigits) {
        const isDriver = devProfile.role === 'DRIVER';
        const account: UserAccount = {
          id: `user_${cleanDigits}`,
          name: devProfile.name,
          nameTe: devProfile.nameTe || devProfile.name,
          email: `${cleanDigits}@srichaitanya.school`,
          phone: devProfile.mobile,
          role: isDriver ? 'DRIVER' : 'PARENT',
          language: 'te',
          status: 'active',
          dob: devProfile.dob,
          idNumber: devProfile.idNumber,
          areaVillage: devProfile.areaVillage,
          registeredOnDevice: true,
          assignedBusId: 'bus_07',
          licenseNo: isDriver ? devProfile.idNumber || 'DL-TG09201488219' : undefined,
          lastLoginAt: Date.now(),
        };
        this.currentUser = account;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
        if (isDriver) {
          localStorage.setItem('schoolbus_staff_auth', 'true');
        }
        this.notify();
        return { user: account, isDriver };
      }
    }

    // 2. Check registered users map
    if (typeof window !== 'undefined') {
      try {
        const existingMap = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '{}');
        if (existingMap[cleanDigits]) {
          const account = existingMap[cleanDigits] as UserAccount;
          const isDriver = account.role === 'DRIVER';
          this.currentUser = account;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
          if (isDriver) {
            localStorage.setItem('schoolbus_staff_auth', 'true');
          }
          this.notify();
          return { user: account, isDriver };
        }
      } catch (e) {
        console.warn('Error reading registered users map:', e);
      }
    }

    // 3. Fallback check for known school phones
    if (cleanDigits === '9951044469' || cleanDigits === '9876543210') {
      const account = this.quickLoginAsRole('DRIVER');
      localStorage.setItem('schoolbus_staff_auth', 'true');
      return { user: account, isDriver: true };
    }
    if (cleanDigits === '9951044459' || cleanDigits === '9988776655') {
      const account = this.quickLoginAsRole('PARENT');
      return { user: account, isDriver: false };
    }

    // 4. Auto-register as verified user if new
    const autoAccount = this.registerProfile({
      role: 'STUDENT',
      name: `User ${cleanDigits.slice(-4)}`,
      mobile: cleanDigits,
      registeredAt: Date.now(),
    });
    return { user: autoAccount, isDriver: false };
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
