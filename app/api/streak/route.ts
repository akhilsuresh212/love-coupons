import { NextResponse } from "next/server";
import {
  getStreakData,
  isStreakBroken,
  getNextMilestone,
  getMilestoneProgress,
} from "@/lib/streak";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const streakData = await getStreakData();
    const broken = isStreakBroken(streakData.lastRedeemedDate);
    const nextMilestone = getNextMilestone(streakData.currentStreak);
    const progress = getMilestoneProgress(streakData.currentStreak);

    return NextResponse.json({
      ...streakData,
      isBroken: broken,
      nextMilestone,
      milestoneProgress: progress,
    });
  } catch (error) {
    console.error("Failed to fetch streak data:", error);
    return NextResponse.json(
      { error: "Failed to fetch streak data" },
      { status: 500 },
    );
  }
}
