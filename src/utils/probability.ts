// Compute theoretical probability of winning under two strategies in the generalized Monty Hall:
// N doors, M cars, host reveals K distinct goats (never a car, never your pick), after your initial pick.
// Strategy A: Always stay with initial pick.
// Strategy B: Always switch uniformly to one of the remaining closed doors.
// Assumptions: host can always reveal K goats (configuration constrained by UI), and chooses uniformly at random among valid reveal sets.

export function theoreticalStayWinProbability(N: number, M: number): number {
  // Staying means winning only if initial pick was a car.
  return M / N;
}

export function theoreticalSwitchWinProbability(N: number, M: number, K: number): number {
  // After picking one door, host reveals K goats among the other N-1 doors.
  // Remaining closed doors (excluding your pick) = N - 1 - K.
  // If initial pick was a goat (prob = (N - M) / N), the cars are all in the remaining closed doors.
  // You choose uniformly among (N - 1 - K) doors to switch. The probability you land on a car is M / (N - 1 - K) in the goat-initial case?
  // Careful: If you initially picked a goat, there are M cars among the remaining N-1 doors; host reveals K goats; remaining closed excluding pick: N-1-K; cars among them: M (since you picked a goat, you didn't remove a car).
  // If you initially picked a car (prob = M / N), after reveals, among remaining N-1-K doors, there are M-1 cars; switching picks a random among them and likely downgrades.
  const remaining = N - 1 - K;
  if (remaining <= 0) return 0;
  const pInitialCar = M / N;
  const pInitialGoat = 1 - pInitialCar;
  const pWinGivenCarPick = Math.max(0, (M - 1) / remaining);
  const pWinGivenGoatPick = Math.max(0, M / remaining);
  return pInitialCar * pWinGivenCarPick + pInitialGoat * pWinGivenGoatPick;
}
