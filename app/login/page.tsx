"use client";

import { useState } from "react";
import { Eye, EyeOff, Flower2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const inputClass =
    "h-12 w-full rounded-xl border border-border bg-surface px-4 text-base transition-colors duration-150 placeholder:text-faint focus:border-primary focus:outline-none";

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-8 px-4 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Flower2 size={30} strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Life Balance</h1>
          <p className="mt-1 text-sm text-muted">
            Dashboard vận hành cho cuộc sống của bạn
          </p>
        </div>
      </div>

      {status === "needs-confirm" ? (
        <p className="rounded-2xl bg-warn-soft p-4 text-sm leading-relaxed text-warn-ink">
          Tài khoản đã tạo nhưng Supabase đang yêu cầu xác nhận email. Vào
          dashboard Supabase → Authentication → Sign In / Up → tắt
          &ldquo;Confirm email&rdquo;, rồi đăng nhập lại.
        </p>
      ) : (
        <form
          onSubmit={submit}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ban@email.com"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="password">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center text-faint hover:text-muted"
              >
                {showPassword ? <EyeOff size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={status === "submitting"}
            className="mt-1 h-12 cursor-pointer rounded-xl bg-primary font-semibold text-primary-fg shadow-sm transition-[background-color,transform] duration-150 hover:bg-primary-strong active:scale-[0.98] disabled:opacity-50"
          >
            {status === "submitting"
              ? "Đang xử lý…"
              : mode === "login"
                ? "Đăng nhập"
                : "Tạo tài khoản"}
          </button>

          {status === "error" && (
            <p role="alert" className="text-sm text-danger">
              {errorMsg}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setStatus("idle");
            }}
            className="cursor-pointer py-1 text-sm text-muted underline-offset-4 hover:text-primary hover:underline"
          >
            {mode === "login" ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
          </button>
        </form>
      )}
    </main>
  );
}
