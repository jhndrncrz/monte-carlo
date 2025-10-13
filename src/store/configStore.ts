import { create } from 'zustand';

export interface GameConfig {
  numDoors: number;
  numCars: number;
  numReveals: number;
}

interface ConfigStore extends GameConfig {
  set: (partial: Partial<GameConfig>) => void;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export const useConfigStore = create<ConfigStore>((set, get) => ({
  numDoors: 3,
  numCars: 1,
  numReveals: 1,
  set: (partial) => set(() => {
    const prev = get();
    let numDoors = partial.numDoors ?? prev.numDoors;
    let numCars = partial.numCars ?? prev.numCars;
    let numReveals = partial.numReveals ?? prev.numReveals;

    numDoors = clamp(Math.round(numDoors), 3, 50);
    numCars = clamp(Math.round(numCars), 1, Math.max(1, numDoors - 1));
    // Ensure at least one unrevealed other door remains: numReveals <= numDoors - 2
    numReveals = clamp(Math.round(numReveals), 1, Math.max(1, numDoors - 2));
    // Ensure reveals do not exceed available goats (worst case initial pick is goat: goats = numDoors - numCars)
    const maxRevealsByGoats = Math.max(1, (numDoors - numCars) - 0); // host can't reveal cars
    numReveals = clamp(numReveals, 1, Math.min(numDoors - 2, maxRevealsByGoats));

    return { numDoors, numCars, numReveals };
  }),
}));
