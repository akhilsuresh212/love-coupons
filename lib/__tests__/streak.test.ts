/**
 * Unit tests for the streak logic module.
 *
 * Run with: npx tsx lib/__tests__/streak.test.ts
 */

import {
  computeStreakFromDates,
  daysDifference,
  getTodayDate,
  getNextMilestone,
  getMilestoneProgress,
  isStreakBroken,
  getUniqueSortedDates,
} from "../streak";

// ─── Helpers ───

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.error(`  ❌ ${message}`);
    failed++;
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  const match = JSON.stringify(actual) === JSON.stringify(expected);
  if (match) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.error(`  ❌ ${message}`);
    console.error(`     Expected: ${JSON.stringify(expected)}`);
    console.error(`     Actual:   ${JSON.stringify(actual)}`);
    failed++;
  }
}

function describe(name: string, fn: () => void) {
  console.log(`\n🧪 ${name}`);
  fn();
}

// ─── Tests ───

describe("daysDifference", () => {
  assertEqual(
    daysDifference("2026-02-23", "2026-02-22"),
    1,
    "consecutive days = 1",
  );
  assertEqual(daysDifference("2026-02-23", "2026-02-23"), 0, "same day = 0");
  assertEqual(
    daysDifference("2026-02-25", "2026-02-22"),
    3,
    "3 days apart = 3",
  );
  assertEqual(
    daysDifference("2026-03-01", "2026-02-28"),
    1,
    "month boundary = 1",
  );
  assertEqual(
    daysDifference("2026-01-01", "2025-12-31"),
    1,
    "year boundary = 1",
  );
});

describe("getUniqueSortedDates", () => {
  const dates = [
    new Date(2026, 1, 22, 10, 0),
    new Date(2026, 1, 22, 14, 0), // same day
    new Date(2026, 1, 23, 8, 0),
    new Date(2026, 1, 21, 20, 0),
  ];
  const result = getUniqueSortedDates(dates);
  assertEqual(
    result,
    ["2026-02-21", "2026-02-22", "2026-02-23"],
    "dedupes and sorts dates",
  );
});

describe("No redemptions", () => {
  const result = computeStreakFromDates([], "2026-02-23");
  assertEqual(result.currentStreak, 0, "currentStreak = 0");
  assertEqual(result.longestStreak, 0, "longestStreak = 0");
});

describe("First redemption (single day)", () => {
  const result = computeStreakFromDates(["2026-02-23"], "2026-02-23");
  assertEqual(result.currentStreak, 1, "currentStreak = 1");
  assertEqual(result.longestStreak, 1, "longestStreak = 1");
});

describe("Same-day multiple redemptions (deduped to one date)", () => {
  // After dedup, these are just one date
  const result = computeStreakFromDates(["2026-02-23"], "2026-02-23");
  assertEqual(
    result.currentStreak,
    1,
    "currentStreak = 1 (same day counts once)",
  );
});

describe("Consecutive day redemptions: 3 days", () => {
  const dates = ["2026-02-21", "2026-02-22", "2026-02-23"];
  const result = computeStreakFromDates(dates, "2026-02-23");
  assertEqual(result.currentStreak, 3, "currentStreak = 3");
  assertEqual(result.longestStreak, 3, "longestStreak = 3");
});

describe("Skipped day — streak breaks", () => {
  const dates = ["2026-02-19", "2026-02-20", "2026-02-21", "2026-02-23"]; // skipped 22
  const result = computeStreakFromDates(dates, "2026-02-23");
  assertEqual(result.currentStreak, 1, "currentStreak = 1 (broken)");
  assertEqual(result.longestStreak, 3, "longestStreak = 3 (from earlier run)");
});

describe("Streak from yesterday still counts", () => {
  const dates = ["2026-02-21", "2026-02-22"];
  const result = computeStreakFromDates(dates, "2026-02-23"); // today is 23, last date is 22
  assertEqual(
    result.currentStreak,
    2,
    "currentStreak = 2 (yesterday still active)",
  );
});

describe("Streak broken — last redemption 2+ days ago", () => {
  const dates = ["2026-02-19", "2026-02-20"];
  const result = computeStreakFromDates(dates, "2026-02-23"); // 3 days gap
  assertEqual(result.currentStreak, 0, "currentStreak = 0 (broken)");
  assertEqual(result.longestStreak, 2, "longestStreak = 2");
});

describe("Multiple streaks — longest computed correctly", () => {
  const dates = [
    "2026-02-01",
    "2026-02-02",
    "2026-02-03",
    "2026-02-04",
    "2026-02-05", // 5-day run
    // gap
    "2026-02-10",
    "2026-02-11", // 2-day run
    // gap
    "2026-02-20",
    "2026-02-21",
    "2026-02-22",
    "2026-02-23", // 4-day run (current)
  ];
  const result = computeStreakFromDates(dates, "2026-02-23");
  assertEqual(result.currentStreak, 4, "currentStreak = 4");
  assertEqual(result.longestStreak, 5, "longestStreak = 5 (from Feb 1-5)");
});

describe("Milestone at 3 days", () => {
  const dates = ["2026-02-21", "2026-02-22", "2026-02-23"];
  const result = computeStreakFromDates(dates, "2026-02-23");
  assertEqual(result.currentStreak, 3, "currentStreak = 3 → milestone!");
});

describe("Milestone at 7 days", () => {
  const dates = [
    "2026-02-17",
    "2026-02-18",
    "2026-02-19",
    "2026-02-20",
    "2026-02-21",
    "2026-02-22",
    "2026-02-23",
  ];
  const result = computeStreakFromDates(dates, "2026-02-23");
  assertEqual(result.currentStreak, 7, "currentStreak = 7 → milestone!");
});

describe("Longest streak updates when current exceeds it", () => {
  const dates = [
    "2026-02-01",
    "2026-02-02",
    "2026-02-03", // old 3-day run
    // gap
    "2026-02-18",
    "2026-02-19",
    "2026-02-20",
    "2026-02-21",
    "2026-02-22",
    "2026-02-23", // current 6-day run
  ];
  const result = computeStreakFromDates(dates, "2026-02-23");
  assertEqual(result.currentStreak, 6, "currentStreak = 6");
  assertEqual(result.longestStreak, 6, "longestStreak = 6 (updated)");
});

describe("Month boundary streak (Jan 31 → Feb 1)", () => {
  const dates = ["2026-01-30", "2026-01-31", "2026-02-01"];
  const result = computeStreakFromDates(dates, "2026-02-01");
  assertEqual(result.currentStreak, 3, "Jan 30-31-Feb 1 = 3-day streak");
});

describe("Year boundary streak (Dec 31 → Jan 1)", () => {
  const dates = ["2025-12-30", "2025-12-31", "2026-01-01"];
  const result = computeStreakFromDates(dates, "2026-01-01");
  assertEqual(result.currentStreak, 3, "Dec 30-31-Jan 1 = 3-day streak");
});

describe("Time travel (today before last date)", () => {
  const dates = ["2026-02-24", "2026-02-25"];
  const result = computeStreakFromDates(dates, "2026-02-22"); // today is before the dates
  assertEqual(result.currentStreak, 0, "negative diff = currentStreak 0");
  assertEqual(result.longestStreak, 2, "longestStreak preserved");
});

describe("getNextMilestone", () => {
  assertEqual(getNextMilestone(0), 3, "0 → next milestone 3");
  assertEqual(getNextMilestone(2), 3, "2 → next milestone 3");
  assertEqual(getNextMilestone(3), 7, "3 → next milestone 7");
  assertEqual(getNextMilestone(7), 14, "7 → next milestone 14");
  assertEqual(getNextMilestone(14), 30, "14 → next milestone 30");
  assertEqual(getNextMilestone(30), null, "30 → no next milestone");
  assertEqual(getNextMilestone(50), null, "50 → no next milestone");
});

describe("getMilestoneProgress", () => {
  assertEqual(getMilestoneProgress(0), 0, "0 days = 0%");
  assertEqual(
    getMilestoneProgress(3),
    0,
    "3 days (at milestone) = 0% towards 7",
  );
  assert(
    getMilestoneProgress(5) > 0 && getMilestoneProgress(5) < 100,
    "5 days = between 0 and 100%",
  );
  assertEqual(getMilestoneProgress(30), 100, "30 = 100% (past all milestones)");
  assertEqual(getMilestoneProgress(50), 100, "50 = 100%");
});

describe("isStreakBroken helper", () => {
  assert(!isStreakBroken(null), "null → not broken");
  assert(!isStreakBroken(getTodayDate()), "today → not broken");
  assert(isStreakBroken("2020-01-01"), "old date → broken");
});

describe("Single date in the past (> 1 day ago)", () => {
  const result = computeStreakFromDates(["2026-02-10"], "2026-02-23");
  assertEqual(result.currentStreak, 0, "currentStreak = 0 (old date)");
  assertEqual(result.longestStreak, 1, "longestStreak = 1");
});

// ─── Summary ───

console.log(`\n${"─".repeat(40)}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`${"─".repeat(40)}\n`);

if (failed > 0) {
  process.exit(1);
}
