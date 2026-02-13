"use client";

import { useState } from "react";
import { Button } from "./ui/Button";

interface SecurityModalProps {
  isAuthenticated: boolean;
}

export function SecurityModal({ isAuthenticated }: SecurityModalProps) {
  const [magicWord, setMagicWord] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "verifying" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (isAuthenticated) return null;

  const handleSendEmail = async () => {
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/auth/magic-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send" }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus("sent");
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Failed to send owl.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Failed to connect to the magic realm.");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("verifying");
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/magic-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", word: magicWord }),
      });

      const data = await res.json();
      if (data.success) {
        // Reload to let the server validation pass
        window.location.reload();
      } else {
        setStatus("sent"); // Keep input visible
        setErrorMsg(data.error || "That is not the magic word.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6 text-center border-4 border-rose-100">
        <div className="text-6xl animate-pulse">🔒</div>

        <h2 className="text-3xl font-great-vibes text-rose-600">
          Secret Garden
        </h2>

        <p className="text-gray-600">
          This area is protected by ancient love spells. Only those with the
          magic word may enter.
        </p>

        {status === "idle" || status === "sending" || status === "error" ? (
          <div className="space-y-4">
            {status === "error" && (
              <p className="text-red-500 bg-red-50 p-2 rounded-lg text-sm">
                {errorMsg}
              </p>
            )}
            <Button
              onClick={handleSendEmail}
              className="w-full text-lg py-6"
              disabled={status === "sending"}
            >
              {status === "sending"
                ? "Summoning Owl..."
                : "Say the Magic Word 🪄"}
            </Button>
            <p className="text-xs text-gray-400">
              A secret scroll will be sent to your email
            </p>

            <p className="text-xs text-gray-400">
              Made with all the love in the world <br />
              Just for my beautiful wife
            </p>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="word"
                className="text-sm font-medium text-gray-700"
              >
                Whisper the word:
              </label>
              <input
                id="word"
                type="text"
                value={magicWord}
                onChange={(e) => setMagicWord(e.target.value)}
                className="w-full p-3 border-2 border-rose-200 rounded-xl text-center text-xl focus:border-rose-500 focus:outline-none transition-colors"
                placeholder="e.g. sunshine"
                autoFocus
              />
            </div>

            {errorMsg && (
              <p className="text-red-500 text-sm animate-shake">{errorMsg}</p>
            )}

            <Button
              type="submit"
              className="w-full text-lg"
              disabled={status === "verifying" || !magicWord.trim()}
            >
              {status === "verifying"
                ? "Consulting Spirits..."
                : "Open Sesame ✨"}
            </Button>

            <button
              type="button"
              onClick={handleSendEmail}
              className="text-xs text-gray-400 hover:text-rose-500 underline"
            >
              Lost the scroll? Send another.
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
