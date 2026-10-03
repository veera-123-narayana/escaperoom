import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError } from './firebase';
import { OperativeProfile, OperativeRole } from '../types/game';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';

/**
 * Retrieve or build operative profile from Firestore `users/{uid}`
 */
export async function getOperativeProfile(uid: string): Promise<OperativeProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as OperativeProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Create or update operative profile in `users/{uid}`
 */
export async function saveOperativeProfile(profile: OperativeProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), {
      ...profile,
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Register with Email and Password
 */
export async function registerWithEmail(
  name: string,
  email: string,
  pass: string,
  role: OperativeRole = 'memberA',
  callsign?: string
): Promise<OperativeProfile> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;

  const generatedCallsign = callsign?.trim() || `OMEGA-${Math.floor(100 + Math.random() * 900)}-${role === 'memberA' ? 'A' : 'B'}`;

  const profile: OperativeProfile = {
    uid: user.uid,
    name: name.trim(),
    email: user.email || email,
    teamId: null,
    role,
    callsign: generatedCallsign,
    createdAt: Date.now(),
    lastActive: Date.now(),
  };

  await saveOperativeProfile(profile);
  useAuthStore.getState().setOperative(profile);
  useGameStore.getState().setOperative(profile);
  return profile;
}

/**
 * Login with Email and Password
 */
export async function loginWithEmail(email: string, pass: string): Promise<OperativeProfile> {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;

  let profile = await getOperativeProfile(user.uid);
  if (!profile) {
    profile = {
      uid: user.uid,
      name: user.displayName || email.split('@')[0],
      email: user.email || email,
      teamId: null,
      role: 'memberA',
      callsign: `OPERATIVE-${user.uid.substring(0, 4).toUpperCase()}`,
      createdAt: Date.now(),
      lastActive: Date.now(),
    };
    await saveOperativeProfile(profile);
  }

  useAuthStore.getState().setOperative(profile);
  useGameStore.getState().setOperative(profile);
  return profile;
}

/**
 * Sign in with Google Popup (Provisioned by default)
 */
export async function loginWithGoogle(defaultRole: OperativeRole = 'memberA'): Promise<OperativeProfile> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  let profile = await getOperativeProfile(user.uid);
  if (!profile) {
    profile = {
      uid: user.uid,
      name: user.displayName || 'Operative',
      email: user.email || '',
      teamId: null,
      role: defaultRole,
      callsign: `OMEGA-${user.uid.substring(0, 4).toUpperCase()}`,
      createdAt: Date.now(),
      lastActive: Date.now(),
    };
    await saveOperativeProfile(profile);
  }

  useAuthStore.getState().setOperative(profile);
  useGameStore.getState().setOperative(profile);
  return profile;
}

/**
 * Sign Out
 */
export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
  useAuthStore.getState().clearAuth();
  useGameStore.getState().setOperative(null);
}

/**
 * Quick Operative Role Switch / Local Demo Mode (crucial for local testing in CMD)
 */
export function quickLoginDemoOperative(role: OperativeRole): OperativeProfile {
  const callsign = role === 'admin' ? 'OMEGA-OVERSEER' : role === 'memberA' ? 'OMEGA-017-A' : 'OMEGA-017-B';
  const name = role === 'admin' ? 'Commander Vance (Admin)' : role === 'memberA' ? 'Operative Vanguard (Member A)' : 'Operative Cipher (Member B)';

  const profile: OperativeProfile = {
    uid: `demo-${role}-${Date.now().toString().slice(-4)}`,
    name,
    email: `${role}@system-omega.internal`,
    teamId: 'OMEGA-017',
    role,
    callsign,
    createdAt: Date.now(),
    lastActive: Date.now(),
  };

  useAuthStore.getState().setOperative(profile);
  useGameStore.getState().setOperative(profile);
  return profile;
}

/**
 * Global Firebase Auth Listener
 */
export function initializeAuthListener(): () => void {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    const authStore = useAuthStore.getState();
    const gameStore = useGameStore.getState();

    authStore.setFirebaseUser(firebaseUser);

    if (firebaseUser) {
      try {
        const profile = await getOperativeProfile(firebaseUser.uid);
        if (profile) {
          authStore.setOperative(profile);
          gameStore.setOperative(profile);
        }
      } catch (err) {
        console.error('Error fetching profile on auth change:', err);
      }
    }
    authStore.setIsLoading(false);
  });

  return unsubscribe;
}
