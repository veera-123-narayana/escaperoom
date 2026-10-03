import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import { OperativeProfile, OperativeRole } from '../types/game';

interface AuthStoreState {
  firebaseUser: FirebaseUser | null;
  operative: OperativeProfile | null;
  isLoading: boolean;
  error: string | null;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setOperative: (profile: OperativeProfile | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  firebaseUser: null,
  operative: null,
  isLoading: true,
  error: null,

  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
  setOperative: (operative) => set({ operative }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearAuth: () => set({ firebaseUser: null, operative: null, error: null, isLoading: false }),
}));
