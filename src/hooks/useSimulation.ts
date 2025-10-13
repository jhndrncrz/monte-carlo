import { useCallback, useMemo, useRef, useState } from 'react';

export interface SimulationResults {
  trials: number;
  switchWins: number;
  stayWins: number;
  mixedWins?: number;
  history: Array<{ n: number; switchRate: number; stayRate: number }>;
}

export function simulateOne(alwaysSwitch: boolean, numDoors: number, numCars: number, numReveals: number): boolean {
  // Randomize prize doors
  const prizeDoors = new Set<number>();
  while (prizeDoors.size < numCars) prizeDoors.add(Math.floor(Math.random() * numDoors));
  const pick = Math.floor(Math.random() * numDoors);
  // Host reveals losing doors
  const remaining = Array.from({ length: numDoors }, (_, d) => d).filter(d => d !== pick && !prizeDoors.has(d));
  const reveals = new Set<number>();
  for (let i = 0; i < Math.min(numReveals, remaining.length); i++) {
    const idx = Math.floor(Math.random() * remaining.length);
    reveals.add(remaining.splice(idx, 1)[0]);
  }
  let final = pick;
  if (alwaysSwitch) {
    const candidates = Array.from({ length: numDoors }, (_, d) => d).filter(d => d !== pick && !reveals.has(d));
    final = candidates[Math.floor(Math.random() * candidates.length)];
  }
  return prizeDoors.has(final);
}

export function simulateOneProb(probSwitch: number, numDoors: number, numCars: number, numReveals: number): boolean {
  const prizeDoors = new Set<number>();
  while (prizeDoors.size < numCars) prizeDoors.add(Math.floor(Math.random() * numDoors));
  const pick = Math.floor(Math.random() * numDoors);
  const remaining = Array.from({ length: numDoors }, (_, d) => d).filter(d => d !== pick && !prizeDoors.has(d));
  const reveals = new Set<number>();
  for (let i = 0; i < Math.min(numReveals, remaining.length); i++) {
    const idx = Math.floor(Math.random() * remaining.length);
    reveals.add(remaining.splice(idx, 1)[0]);
  }
  let final = pick;
  if (Math.random() < probSwitch) {
    const candidates = Array.from({ length: numDoors }, (_, d) => d).filter(d => d !== pick && !reveals.has(d));
    final = candidates[Math.floor(Math.random() * candidates.length)];
  }
  return prizeDoors.has(final);
}

export function useSimulation() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<SimulationResults | null>(null);
  const stopRef = useRef(false);
  // lazy import to avoid circulars; or pass config in run

  const run = useCallback(async (n: number, batchSize = 1000, cfg?: { numDoors: number; numCars: number; numReveals: number; switchProb?: number }) => {
    setRunning(true);
    stopRef.current = false;
    let switchWins = 0;
    let stayWins = 0;
    let mixedWins = 0;
    const history: SimulationResults['history'] = [];
    const total = Math.max(1, n);
    const numDoors = cfg?.numDoors ?? 3;
    const numCars = cfg?.numCars ?? 1;
    const numReveals = cfg?.numReveals ?? 1;
    const switchProb = Math.max(0, Math.min(1, cfg?.switchProb ?? 1));

    let done = 0;
    const step = Math.max(10, Math.min(batchSize, Math.floor(total / 100) || 10));
    while (done < total) {
      if (stopRef.current) break;
      const limit = Math.min(step, total - done);
      for (let i = 0; i < limit; i++) {
        if (simulateOne(true, numDoors, numCars, numReveals)) switchWins++;
        if (simulateOne(false, numDoors, numCars, numReveals)) stayWins++;
        if (simulateOneProb(switchProb, numDoors, numCars, numReveals)) mixedWins++;
      }
      done += limit;
      const switchRate = switchWins / done;
      const stayRate = stayWins / done;
      history.push({ n: done, switchRate, stayRate });
      setProgress(Math.round((done / total) * 100));
      // Allow UI to update
      await new Promise((r) => setTimeout(r, 0));
    }

    const final: SimulationResults = { trials: done, switchWins, stayWins, mixedWins, history };
    setResults(final);
    setRunning(false);
    return final;
  }, []);

  const stop = useCallback(() => {
    stopRef.current = true;
    setRunning(false);
  }, []);

  const rates = useMemo(() => {
    if (!results) return { switchRate: 0, stayRate: 0, mixedRate: 0 };
    const { switchWins, stayWins, mixedWins, trials } = results;
    return {
      switchRate: trials ? switchWins / trials : 0,
      stayRate: trials ? stayWins / trials : 0,
      mixedRate: trials && mixedWins != null ? mixedWins / trials : 0,
    };
  }, [results]);

  return { running, progress, results, run, stop, rates };
}
