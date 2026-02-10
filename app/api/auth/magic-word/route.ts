
import { startTransition } from 'react';
import { NextRequest, NextResponse } from "next/server";
import { magicWords } from "@/lib/magicWords";
import { sendMagicWordEmail } from "@/lib/email";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { action, word } = await req.json();
    const cookieStore = await cookies();

    if (action === "send") {
      const userEmail = process.env.USER_EMAIL;

      if (!userEmail) {
        return NextResponse.json(
          { error: "USER_EMAIL not configured" },
          { status: 500 }
        );
      }

      // Pick a random magic word
      const magicWord = magicWords[Math.floor(Math.random() * magicWords.length)];

      // Send email
      const emailResult = await sendMagicWordEmail(userEmail, magicWord);

      if (!emailResult || !emailResult.success) {
        return NextResponse.json(
          { error: "Failed to send email" },
          { status: 500 }
        );
      }

      // Store magic word in httpOnly cookie (encrypted/signed in production ideally, but simple for now)
      // Expires in 10 minutes
      cookieStore.set("mw_challenge", magicWord, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 10,
        path: "/",
      });

      return NextResponse.json({ success: true });
    } else if (action === "verify") {
      const challenge = cookieStore.get("mw_challenge")?.value;

      if (!challenge) {
        return NextResponse.json(
          { error: "Magic word expired or not requested" },
          { status: 400 }
        );
      }

      if (word.toLowerCase().trim() === challenge.toLowerCase().trim()) {
        // Set auth token valid for 1 day
        cookieStore.set("auth_token", "true", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24,
          path: "/",
        });

        // Clear challenge
        cookieStore.delete("mw_challenge");

        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json({ error: "Incorrect magic word" }, { status: 401 });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
