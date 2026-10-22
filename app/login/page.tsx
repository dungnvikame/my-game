"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-bold">Life Balance</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Dashboard vận hành cho cuộc sống của bạn
        </p>
      </div>

      {status === "sent" ? (
        <p className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
          Đã gửi link đăng nhập tới <strong>{email}</strong>. Mở email trên thiết
          bị này và bấm vào link.
        </p>
      ) : (
        <form onSubmit={sendMagicLink} className="flex flex-col gap-3">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ban@email.com"
            className="rounded-lg border border-neutral-300 px-3 py-3 text-base outline-none focus:border-neutral-900"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-lg bg-neutral-900 px-4 py-3 font-medium text-white disabled:opacity-50"
          >
            {status === "sending" ? "Đang gửi…" : "Gửi link đăng nhập"}
          </button>
          {status === "error" && (
            <p className="text-sm text-red-600">{errorMsg}</p>
          )}
        </form>
      )}
    </main>
  );
}
