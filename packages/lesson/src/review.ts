/**
 * Spaced repetition (SM-2, lightly adapted) for adaptive practice.
 * Pure functions — `now` (epoch ms) is passed in so they stay testable.
 */

export interface ReviewState {
  ease: number; // ease factor (>= 1.3)
  intervalDays: number;
  dueAt: number; // epoch ms
  reps: number; // consecutive correct
  lapses: number;
}

const DAY = 86_400_000;

export function initialReview(now: number): ReviewState {
  return { ease: 2.5, intervalDays: 0, dueAt: now, reps: 0, lapses: 0 };
}

/**
 * Update an item's schedule after a graded answer. A wrong answer resets the
 * interval so the item resurfaces immediately (due now); a right answer pushes
 * the next review out per SM-2.
 */
export function scheduleReview(prev: ReviewState | undefined, correct: boolean, now: number): ReviewState {
  const s = prev ?? initialReview(now);
  const q = correct ? 5 : 2; // simplified quality
  let { ease, intervalDays, reps, lapses } = s;

  if (q < 3) {
    reps = 0;
    intervalDays = 0;
    lapses += 1;
    ease = Math.max(1.3, ease - 0.2);
  } else {
    reps += 1;
    intervalDays = reps === 1 ? 1 : reps === 2 ? 6 : Math.round(intervalDays * ease);
    ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  }
  return { ease, intervalDays, reps, lapses, dueAt: now + intervalDays * DAY };
}

export function isDue(s: ReviewState, now: number): boolean {
  return s.dueAt <= now;
}

export interface RetentionStats {
  scheduled: number; // items tracked by spaced repetition
  dueNow: number; // due at/before now
  dueSoon: number; // due within 24h (not already due)
  dueWeek: number; // due within 7d (not already due)
  matured: number; // interval >= 21 days — well-retained
  avgIntervalDays: number; // mean current interval across scheduled items
}

/** Aggregate retention/forecast across a set of spaced-repetition states. */
export function retentionStats(states: ReviewState[], now: number): RetentionStats {
  const scheduled = states.length;
  let dueNow = 0,
    dueSoon = 0,
    dueWeek = 0,
    matured = 0,
    intervalSum = 0;
  for (const s of states) {
    intervalSum += s.intervalDays;
    if (s.intervalDays >= 21) matured++;
    const inDays = (s.dueAt - now) / DAY;
    if (inDays <= 0) dueNow++;
    else if (inDays <= 1) dueSoon++;
    else if (inDays <= 7) dueWeek++;
  }
  return {
    scheduled,
    dueNow,
    dueSoon,
    dueWeek,
    matured,
    avgIntervalDays: scheduled ? Math.round((intervalSum / scheduled) * 10) / 10 : 0,
  };
}
