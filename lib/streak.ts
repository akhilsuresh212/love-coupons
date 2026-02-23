import { prisma } from "./db";

// ──────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastRedeemedDate: string | null;
}

export interface StreakUpdateResult {
  streakData: StreakData;
  didIncrement: boolean;
  didBreak: boolean;
  milestone: number | null;
  isFirstRedemption: boolean;
}

// ──────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────

export const MILESTONES = [3, 7, 14, 30] as const;

export const STREAK_BREAK_MESSAGES = [
  "Our streak paused, but our love didn't 💕",
  "A little break — let's start a new streak today 🔥",
  "Missed a day, but more memories await ✨",
  "Every love story has intermissions 🎬💖",
  "Distance makes the heart grow fonder 💝",
  "The pause just means the next moment is even sweeter 🍬",
  "A break in routine, never in love 💗",
  "New day, new streak, same love 💘",
];

export const MILESTONE_MESSAGES: Record<number, string> = {
  3: "3 days of love — you're on fire! 🔥",
  7: "7 days of love unlocked 💖",
  14: "Two weeks of romance! 🌹",
  30: "A whole month of love! You're legendary 👑💕",
};

// ──────────────────────────────────────────────────────
// Pure date helpers
// ──────────────────────────────────────────────────────

/**
 * Get today's date as YYYY-MM-DD in local timezone.
 */
export function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Convert a Date object to a YYYY-MM-DD string in local timezone.
 */
export function dateToLocalString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string into a Date object at midnight local time.
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Calculate the difference in calendar days between two YYYY-MM-DD strings.
 * Returns dateA - dateB in days.
 */
export function daysDifference(dateA: string, dateB: string): number {
  const a = parseLocalDate(dateA);
  const b = parseLocalDate(dateB);
  const diffMs = a.getTime() - b.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Extract sorted unique date strings from an array of Date objects.
 */
export function getUniqueSortedDates(dates: Date[]): string[] {
  const uniqueSet = new Set(dates.map(dateToLocalString));
  return Array.from(uniqueSet).sort();
}

// ──────────────────────────────────────────────────────
// Pure streak computation (testable without DB)
// ──────────────────────────────────────────────────────

/**
 * Compute current streak and longest streak from a sorted array
 * of unique date strings (YYYY-MM-DD).
 *
 * Current streak: consecutive days ending at todayDate (or yesterday).
 * If the last redemption date is more than 1 day before today, current streak is 0.
 */
export function computeStreakFromDates(
  sortedUniqueDates: string[],
  todayDate: string,
): { currentStreak: number; longestStreak: number } {
  if (sortedUniqueDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // ── Longest streak: walk through all dates ──
  let longestStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < sortedUniqueDates.length; i++) {
    if (daysDifference(sortedUniqueDates[i], sortedUniqueDates[i - 1]) === 1) {
      currentRun++;
      longestStreak = Math.max(longestStreak, currentRun);
    } else {
      currentRun = 1;
    }
  }

  // ── Current streak: walk backwards from the end ──
  const lastDate = sortedUniqueDates[sortedUniqueDates.length - 1];
  const diffFromToday = daysDifference(todayDate, lastDate);

  // Streak is "active" if last redemption was today or yesterday
  if (diffFromToday > 1 || diffFromToday < 0) {
    return { currentStreak: 0, longestStreak };
  }

  let currentStreak = 1;
  for (let i = sortedUniqueDates.length - 2; i >= 0; i--) {
    if (daysDifference(sortedUniqueDates[i + 1], sortedUniqueDates[i]) === 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return { currentStreak, longestStreak };
}

// ──────────────────────────────────────────────────────
// DB-integrated functions
// ──────────────────────────────────────────────────────

/**
 * Fetch all redemption dates and compute streak data.
 */
export async function getStreakData(): Promise<StreakData> {
  const redemptions = await prisma.redemption.findMany({
    select: { redeemed_at: true },
    orderBy: { redeemed_at: "asc" },
  });

  const uniqueDates = getUniqueSortedDates(
    redemptions.map((r) => r.redeemed_at),
  );
  const todayDate = getTodayDate();
  const { currentStreak, longestStreak } = computeStreakFromDates(
    uniqueDates,
    todayDate,
  );
  const lastRedeemedDate =
    uniqueDates.length > 0 ? uniqueDates[uniqueDates.length - 1] : null;

  return { currentStreak, longestStreak, lastRedeemedDate };
}

/**
 * Compute streak update result after a coupon redemption.
 * Called after the redemption has been persisted.
 */
export async function processRedemptionStreak(): Promise<StreakUpdateResult> {
  const redemptions = await prisma.redemption.findMany({
    select: { redeemed_at: true },
    orderBy: { redeemed_at: "asc" },
  });

  const allDates = redemptions.map((r) => r.redeemed_at);
  const uniqueDates = getUniqueSortedDates(allDates);
  const todayDate = getTodayDate();

  const { currentStreak, longestStreak } = computeStreakFromDates(
    uniqueDates,
    todayDate,
  );

  // Determine what happened by checking today's redemption count
  const todayCount = allDates.filter(
    (d) => dateToLocalString(d) === todayDate,
  ).length;
  const isSameDay = todayCount > 1; // Already had a redemption today before this one

  const lastRedeemedDate =
    uniqueDates.length > 0 ? uniqueDates[uniqueDates.length - 1] : null;
  const streakData: StreakData = {
    currentStreak,
    longestStreak,
    lastRedeemedDate,
  };

  // Same day — no streak change
  if (isSameDay) {
    return {
      streakData,
      didIncrement: false,
      didBreak: false,
      milestone: null,
      isFirstRedemption: false,
    };
  }

  // First ever redemption
  if (uniqueDates.length === 1) {
    return {
      streakData,
      didIncrement: true,
      didBreak: false,
      milestone: null,
      isFirstRedemption: true,
    };
  }

  // Check if streak broke: look at the second-to-last date
  const prevDate = uniqueDates[uniqueDates.length - 2];
  const gap = daysDifference(todayDate, prevDate);
  const didBreak = gap > 1;

  const milestone = MILESTONES.includes(
    currentStreak as (typeof MILESTONES)[number],
  )
    ? currentStreak
    : null;

  return {
    streakData,
    didIncrement: true,
    didBreak,
    milestone,
    isFirstRedemption: false,
  };
}

// ──────────────────────────────────────────────────────
// Helper functions (used by UI / API)
// ──────────────────────────────────────────────────────

/**
 * Check if the streak is currently broken.
 */
export function isStreakBroken(lastRedeemedDate: string | null): boolean {
  if (!lastRedeemedDate) return false;
  const today = getTodayDate();
  if (today === lastRedeemedDate) return false;
  return daysDifference(today, lastRedeemedDate) > 1;
}

/**
 * Get a random streak break message.
 */
export function getRandomBreakMessage(): string {
  return STREAK_BREAK_MESSAGES[
    Math.floor(Math.random() * STREAK_BREAK_MESSAGES.length)
  ];
}

/**
 * Get the next upcoming milestone for a given streak count.
 */
export function getNextMilestone(currentStreak: number): number | null {
  for (const m of MILESTONES) {
    if (currentStreak < m) return m;
  }
  return null;
}

/**
 * Calculate progress percentage towards the next milestone.
 */
export function getMilestoneProgress(currentStreak: number): number {
  const nextMilestone = getNextMilestone(currentStreak);
  if (!nextMilestone) return 100;

  const milestoneIndex = MILESTONES.indexOf(
    nextMilestone as (typeof MILESTONES)[number],
  );
  const prevMilestone = milestoneIndex > 0 ? MILESTONES[milestoneIndex - 1] : 0;

  const range = nextMilestone - prevMilestone;
  const progress = currentStreak - prevMilestone;
  return Math.min(100, (progress / range) * 100);
}
