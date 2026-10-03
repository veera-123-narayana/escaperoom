import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { subscribeToTeam } from '../services/teamService';
import { auth } from '../services/firebase';

export function useTeam(teamId?: string | null) {
  const { setTeam } = useGameStore();

  useEffect(() => {
    if (!teamId) return;

    // In local simulated demo mode before login, skip remote subscription
    if (teamId === 'OMEGA-017' && !auth.currentUser) {
      return;
    }

    const unsubscribe = subscribeToTeam(
      teamId,
      (updatedTeam) => {
        setTeam(updatedTeam);
      },
      (error) => {
        console.warn('Real-time team subscription notice:', error.message);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [teamId, setTeam]);
}
