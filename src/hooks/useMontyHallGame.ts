import { useCallback, useMemo, useState } from 'react';
import { useConfigStore } from '../store/configStore';

export type DoorState = 'closed' | 'revealed' | 'selected' | 'final';

export interface GameState {
  prizeDoors: Set<number>; // which doors have cars
  selectedDoor: number | null;
  initialDoor: number | null;
  revealedDoors: Set<number>; // host reveals
  step: 'choose' | 'switch' | 'result';
  lastWin?: boolean;
  decidedSwitch?: boolean;
}

export function useMontyHallGame() {
  const { numDoors, numCars, numReveals } = useConfigStore();
  const [state, setState] = useState<GameState>(() => {
    const prizeDoors = new Set<number>();
    while (prizeDoors.size < numCars) {
      prizeDoors.add(Math.floor(Math.random() * numDoors));
    }
    return { prizeDoors, selectedDoor: null, initialDoor: null, revealedDoors: new Set(), step: 'choose' };
  });

  const reset = useCallback(() => {
    const prizeDoors = new Set<number>();
    while (prizeDoors.size < numCars) {
      prizeDoors.add(Math.floor(Math.random() * numDoors));
    }
    setState({ prizeDoors, selectedDoor: null, initialDoor: null, revealedDoors: new Set(), step: 'choose', lastWin: undefined, decidedSwitch: undefined });
  }, [numDoors, numCars]);

  const chooseDoor = useCallback((door: number) => {
    if (state.step !== 'choose') return;
    // Host reveals K losing doors from the remaining doors, avoiding cars and the selected.
    const remaining = Array.from({ length: numDoors }, (_, d) => d).filter(d => d !== door && !state.prizeDoors.has(d));
    const revealed = new Set<number>();
    for (let i = 0; i < Math.min(numReveals, remaining.length); i++) {
      const pickIdx = Math.floor(Math.random() * remaining.length);
      const r = remaining.splice(pickIdx, 1)[0];
      revealed.add(r);
    }
    setState((prev: GameState) => ({ ...prev, selectedDoor: door, initialDoor: door, revealedDoors: revealed, step: 'switch' }));
  }, [state.step, state.prizeDoors, numDoors, numReveals]);

  const switchChoice = useCallback((shouldSwitch: boolean) => {
    if (state.step !== 'switch' || state.selectedDoor == null) return;
    let finalDoor = state.selectedDoor;
    if (shouldSwitch) {
      const candidates = Array.from({ length: numDoors }, (_, d) => d).filter(d => d !== state.selectedDoor && !state.revealedDoors.has(d));
      // Choose uniformly among remaining closed doors
      finalDoor = candidates[Math.floor(Math.random() * candidates.length)];
    }
    const win = state.prizeDoors.has(finalDoor);
    setState((prev: GameState) => ({ ...prev, selectedDoor: finalDoor, step: 'result', lastWin: win, decidedSwitch: shouldSwitch }));
    return { win, switched: shouldSwitch };
  }, [state.step, state.selectedDoor, state.revealedDoors, state.prizeDoors, numDoors]);

  const doorStatuses: DoorState[] = useMemo(() => {
    return Array.from({ length: numDoors }, (_, d) => {
      if (state.step === 'choose') return 'closed';
      if (state.revealedDoors.has(d) && state.step !== 'result') return 'revealed';
      if (state.selectedDoor === d && state.step !== 'result') return 'selected';
      if (state.step === 'result') return 'final';
      return 'closed';
    });
  }, [state, numDoors]);

  const getSnapshot = useCallback((): GameState => {
    return {
      prizeDoors: new Set(state.prizeDoors),
      selectedDoor: state.selectedDoor,
      initialDoor: state.initialDoor,
      revealedDoors: new Set(state.revealedDoors),
      step: state.step,
      lastWin: state.lastWin,
      decidedSwitch: state.decidedSwitch,
    };
  }, [state]);

  const loadSnapshot = useCallback((snapshot: GameState) => {
    // Load a deep-copied snapshot to avoid external mutations
    setState({
      prizeDoors: new Set(snapshot.prizeDoors),
      selectedDoor: snapshot.selectedDoor,
      initialDoor: snapshot.initialDoor,
      revealedDoors: new Set(snapshot.revealedDoors),
      step: snapshot.step,
      lastWin: snapshot.lastWin,
      decidedSwitch: snapshot.decidedSwitch,
    });
  }, []);

  return { state, doorStatuses, chooseDoor, switchChoice, reset, getSnapshot, loadSnapshot };
}
