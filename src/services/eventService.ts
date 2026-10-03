import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from './firebase';
import { EventConfig, EventStatus } from '../types/event';

export const GLOBAL_EVENT_ID = 'omega-protocol-2026';

/**
 * Real-time subscription to global event state
 */
export function subscribeToEvent(
  eventId: string = GLOBAL_EVENT_ID,
  onUpdate: (event: Partial<EventConfig>) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `events/${eventId}`;
  return onSnapshot(
    doc(db, 'events', eventId),
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as EventConfig);
      }
    },
    (error) => {
      if (onError) onError(error);
      console.warn(`Firestore event subscription notice [${path}]:`, error.message);
    }
  );
}

/**
 * Update event configuration in Firestore (Admin only)
 */
export async function updateEventConfigInFirestore(
  eventId: string = GLOBAL_EVENT_ID,
  updates: Partial<EventConfig>
): Promise<void> {
  const path = `events/${eventId}`;
  try {
    await setDoc(doc(db, 'events', eventId), updates, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
