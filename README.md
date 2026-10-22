# Life Balance App

Dashboard vận hành cho cuộc sống: check-in 30 giây/ngày, nhìn rõ độ cân bằng giữa 8 mảng cuộc sống, nhận gợi ý điều chỉnh mỗi tuần.

Stack: Next.js 16 (App Router) · Tailwind v4 · Supabase (auth + Postgres) · Vercel.

## Setup lần đầu (~10 phút)

1. **Supabase**: tạo project tại [supabase.com](https://supabase.com) → mở SQL Editor → chạy toàn bộ `lib/db/schema.sql`.
2. **Auth**: trong Supabase → Authentication → Sign In / Up → bật Email (magic link có sẵn). Thêm URL app vào Authentication → URL Configuration → Redirect URLs: `http://localhost:3000/auth/confirm` và `https://<app>.vercel.app/auth/confirm`.
3. **Env**: copy `.env.example` thành `.env.local`, điền URL + anon key từ Supabase → Settings → API.
4. Chạy local: `npm install && npm run dev`.
5. **Deploy**: import repo vào [Vercel](https://vercel.com), khai 2 biến env như trên. Xong.

## Cấu trúc chính

- `app/login` — đăng nhập magic link; `app/auth/confirm` — xác thực link.
- `app/onboarding` — đặt trọng số 1-5 cho 8 life areas (chuẩn đo cân bằng).
- `app/checkin` — check-in hằng ngày: giờ/mảng (slider 0.5h) + mood.
- `lib/db/schema.sql` — schema + RLS + seed 8 areas (nguồn sự thật về DB).
- `proxy.ts` — refresh session + chặn route chưa đăng nhập.

## Nguyên tắc dữ liệu

Mọi bảng user-data bật RLS theo `auth.uid()`. Không dùng service key ở client. Backup schema trước mọi migration.
