import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from './firebase';
import { TeamState, TeamMember } from '../types/team';
import { OperativeProfile, OperativeRole, ActivityEvent } from '../types/game';
import { createInitialLevelProgress } from '../store/gameStore';
import { saveOperativeProfile } from './authService';

/**
 * Generate a unique tactical team ID (e.g., OMEGA-042)
 */
export function generateTeamId(): string {
  const num = Math.floor(10 + Math.random() * 980);
  return `OMEGA-${num.toString().padStart(3, '0')}`;
}

/**
 * Generate a memorable 6-8 char join code (e.g. OMG-7492)
 */
export function generateJoinCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `OMG-${randomPart}`;
}

/**
 * Create a new two-member team in Firestore
 */
export async function createTeam(
  teamName: string,
  operative: OperativeProfile
): Promise<TeamState> {
  const teamId = generateTeamId();
  const joinCode = generateJoinCode();
  const path = `teams/${teamId}`;

  const memberA: TeamMember = {
    uid: operative.uid,
    name: operative.name,
    email: operative.email,
    callsign: operative.callsign || `${teamId}-A`,
    role: 'memberA',
    isOnline: true,
    currentLevelNumber: 1,
    lastHeartbeat: Date.now(),
  };

  const initialProgress = createInitialLevelProgress();

  const newTeam: TeamState = {
    id: teamId,
    teamName: teamName.trim() || `TEAM ${teamId}`,
    joinCode,
    status: 'waiting',
    totalScore: 0,
    currentLevel: 1,
    startTime: null,
    finishedAt: null,
    memberCount: 1,
    members: {
      memberA,
    },
    levelProgress: initialProgress,
    hintsCostTotal: 0,
    penaltiesTotal: 0,
    bonusXpTotal: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  try {
    // 1. Write team document
    await setDoc(doc(db, 'teams', teamId), newTeam);

    // 2. Write subcollection member record
    await setDoc(doc(db, 'teams', teamId, 'members', 'memberA'), memberA);

    // 3. Write initial activity record
    const initActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      timestamp: Date.now(),
      operativeCallsign: memberA.callsign,
      operativeRole: 'memberA',
      type: 'CONNECT',
      message: `TEAM ${teamId} CREATED BY ${memberA.callsign}. AWAITING OPERATIVE B.`,
    };
    await setDoc(doc(db, 'teams', teamId, 'activity', initActivity.id), initActivity);

    // 4. Update operative's profile with team assignment
    const updatedOperative: OperativeProfile = {
      ...operative,
      teamId,
      role: 'memberA',
      callsign: memberA.callsign,
      lastActive: Date.now(),
    };
    await saveOperativeProfile(updatedOperative);

    return newTeam;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Locate team by 6-character Join Code
 */
export async function findTeamByJoinCode(joinCode: string): Promise<TeamState | null> {
  const cleanCode = joinCode.trim().toUpperCase();
  const path = 'teams';

  try {
    const q = query(collection(db, 'teams'), where('joinCode', '==', cleanCode));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Also try direct team ID match
      const docSnap = await getDoc(doc(db, 'teams', cleanCode));
      if (docSnap.exists()) {
        return docSnap.data() as TeamState;
      }
      return null;
    }

    const firstDoc = snapshot.docs[0];
    return firstDoc.data() as TeamState;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Join an existing team using Join Code
 */
export async function joinTeamByCode(
  joinCode: string,
  operative: OperativeProfile
): Promise<TeamState> {
  const team = await findTeamByJoinCode(joinCode);
  if (!team) {
    throw new Error(`NO ACTIVE TEAM FOUND FOR JOIN CODE: ${joinCode.toUpperCase()}`);
  }

  const path = `teams/${team.id}`;

  // Check if operative is already in team
  if (team.members.memberA?.uid === operative.uid) {
    return team;
  }
  if (team.members.memberB?.uid === operative.uid) {
    return team;
  }

  // Determine slot: memberB or memberA if empty
  let targetRole: OperativeRole = 'memberB';
  if (!team.members.memberA) {
    targetRole = 'memberA';
  } else if (team.members.memberB) {
    throw new Error(`TEAM ${team.id} IS AT MAXIMUM CAPACITY (2 OPERATIVES).`);
  }

  const newMember: TeamMember = {
    uid: operative.uid,
    name: operative.name,
    email: operative.email,
    callsign: operative.callsign || `${team.id}-${targetRole === 'memberA' ? 'A' : 'B'}`,
    role: targetRole,
    isOnline: true,
    currentLevelNumber: team.currentLevel || 1,
    lastHeartbeat: Date.now(),
  };

  const updatedMembers = {
    ...team.members,
    [targetRole]: newMember,
  };

  const updatedTeam: TeamState = {
    ...team,
    memberCount: Object.keys(updatedMembers).length,
    status: Object.keys(updatedMembers).length === 2 ? 'active' : team.status,
    members: updatedMembers,
    updatedAt: Date.now(),
  };

  try {
    // 1. Update team document
    await setDoc(doc(db, 'teams', team.id), updatedTeam, { merge: true });

    // 2. Write subcollection member
    await setDoc(doc(db, 'teams', team.id, 'members', targetRole), newMember);

    // 3. Log join activity
    const joinActivity: ActivityEvent = {
      id: `act-${Date.now()}`,
      timestamp: Date.now(),
      operativeCallsign: newMember.callsign,
      operativeRole: targetRole,
      type: 'CONNECT',
      message: `${newMember.callsign} (${targetRole.toUpperCase()}) JOINED TEAM LOBBY. TEAM FULLY ASSEMBLED.`,
    };
    await setDoc(doc(db, 'teams', team.id, 'activity', joinActivity.id), joinActivity);

    // 4. Update user's profile
    const updatedOperative: OperativeProfile = {
      ...operative,
      teamId: team.id,
      role: targetRole,
      callsign: newMember.callsign,
      lastActive: Date.now(),
    };
    await saveOperativeProfile(updatedOperative);

    return updatedTeam;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Real-time subscription to team document
 */
export function subscribeToTeam(
  teamId: string,
  onUpdate: (team: TeamState) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `teams/${teamId}`;
  return onSnapshot(
    doc(db, 'teams', teamId),
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as TeamState);
      }
    },
    (error) => {
      if (onError) {
        onError(error);
      }
      console.warn(`Firestore onSnapshot notice [${path}]:`, error.message);
    }
  );
}

/**
 * Real-time subscription to team activity stream
 */
export function subscribeToTeamActivity(
  teamId: string,
  onUpdate: (events: ActivityEvent[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `teams/${teamId}/activity`;
  return onSnapshot(
    collection(db, 'teams', teamId, 'activity'),
    (snap) => {
      const events: ActivityEvent[] = [];
      snap.forEach((docSnap) => {
        events.push(docSnap.data() as ActivityEvent);
      });
      // Sort client-side by timestamp descending
      events.sort((a, b) => b.timestamp - a.timestamp);
      onUpdate(events);
    },
    (error) => {
      if (onError) onError(error);
      console.warn(`Firestore activity subscription notice [${path}]:`, error.message);
    }
  );
}

/**
 * Send real-time activity log to team activity subcollection
 */
export async function logTeamActivity(
  teamId: string,
  event: Omit<ActivityEvent, 'id' | 'timestamp'>
): Promise<void> {
  const path = `teams/${teamId}/activity`;
  const eventId = `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const activityDoc: ActivityEvent = {
    ...event,
    id: eventId,
    timestamp: Date.now(),
  };

  try {
    await setDoc(doc(db, 'teams', teamId, 'activity', eventId), activityDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Leave team lobby
 */
export async function leaveTeam(teamId: string, operative: OperativeProfile): Promise<void> {
  const path = `teams/${teamId}`;
  try {
    const snap = await getDoc(doc(db, 'teams', teamId));
    if (snap.exists()) {
      const team = snap.data() as TeamState;
      const updatedMembers = { ...team.members };

      if (team.members.memberA?.uid === operative.uid) {
        delete updatedMembers.memberA;
      } else if (team.members.memberB?.uid === operative.uid) {
        delete updatedMembers.memberB;
      }

      await updateDoc(doc(db, 'teams', teamId), {
        members: updatedMembers,
        memberCount: Object.keys(updatedMembers).length,
        status: 'waiting',
        updatedAt: Date.now(),
      });
    }

    await saveOperativeProfile({
      ...operative,
      teamId: null,
      lastActive: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
