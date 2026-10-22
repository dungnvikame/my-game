"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "needs-confirm">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    const supabase = createClient();
    const { data, error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
      return;
    }
    // signUp khi Supabase còn bật "Confirm email" sẽ không trả session ngay.
    if (!data.session) {
      setStatus("needs-confirm");
      return;
    }
    // Reload toàn trang để proxy đọc được cookie session mới.
    window.location.href = "/";
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-bold">Life Balance</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Dashboard vận hành cho cuộc sống của bạn
        </p>
      </div>

      {status === "needs-confirm" ? (
        <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          Tài khoản đã tạo nhưng Supabase đang yêu cầu xác nhận email. Vào
          dashboard Supabase → Authentication → Sign In / Up → tắt
          &ldquo;Confirm email&rdquo;, rồi đăng nhập lại.
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
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
          <label className="text-sm font-medium" htmlFor="password">
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tối thiểu 6 ký tự"
            className="rounded-lg border border-neutral-300 px-3 py-3 text-base outline-none focus:border-neutral-900"
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="rounded-lg bg-neutral-900 px-4 py-3 font-medium text-white disabled:opacity-50"
          >
            {status === "submitting"
              ? "Đang xử lý…"
              : mode === "login"
                ? "Đăng nhập"
                : "Tạo tài khoản"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setStatus("idle");
            }}
            className="text-sm text-neutral-500 underline underline-offset-2"
          >
            {mode === "login"
              ? "Chưa có tài khoản? Đăng ký"
              : "Đã có tài khoản? Đăng nhập"}
          </button>
          {status === "error" && (
            <p className="text-sm text-red-600">{errorMsg}</p>
          )}
        </form>
      )}
    </main>
  );
}
