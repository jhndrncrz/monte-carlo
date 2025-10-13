import { create } from 'zustand';

export interface AggregateResults {
  games: number;
  switchWins: number;
  stayWins: number;
  switchPlays?: number;
  stayPlays?: number;
  history?: Array<{ n: number; switchRate: number; stayRate: number }>;
}

export interface ResultsStore extends AggregateResults {
  addResult: (win: boolean, switched: boolean) => void;
  reset: () => void;
}

export const useResultsStore = create<ResultsStore>((set) => ({
  games: 0,
  switchWins: 0,
  stayWins: 0,
  switchPlays: 0,
  stayPlays: 0,
  history: [],
  addResult: (win: boolean, switched: boolean) => set((s: ResultsStore) => {
    const newGames = s.games + 1;
    const newSwitchPlays = s.switchPlays! + (switched ? 1 : 0);
    const newStayPlays = s.stayPlays! + (!switched ? 1 : 0);
    const newSwitchWins = s.switchWins + (win && switched ? 1 : 0);
    const newStayWins = s.stayWins + (win && !switched ? 1 : 0);
    const switchRate = newSwitchPlays > 0 ? newSwitchWins / newSwitchPlays : 0;
    const stayRate = newStayPlays > 0 ? newStayWins / newStayPlays : 0;
    return {
      games: newGames,
      switchPlays: newSwitchPlays,
      stayPlays: newStayPlays,
      switchWins: newSwitchWins,
      stayWins: newStayWins,
      history: [...(s.history || []), { n: newGames, switchRate, stayRate }],
    };
  }),
  reset: () => set({ games: 0, switchWins: 0, stayWins: 0, switchPlays: 0, stayPlays: 0, history: [] }),
}));
