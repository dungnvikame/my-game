---
title: "Life Balance App — MVP"
description: "Web app cá nhân: check-in 30s/ngày, dashboard bánh xe cân bằng, rule-based insight gợi ý điều chỉnh hằng tuần"
status: in-progress
priority: P1
effort: 6w
tags: [feature, frontend, backend, database]
blockedBy: []
blocks: []
created: 2026-10-22
---

# Life Balance App — MVP

## Overview

MVP theo Approach A (manual-first + rule-based insight) đã chốt tại brainstorm report. Người dùng duy nhất giai đoạn này là chính chủ (dogfooding). Ba sprint 2 tuần, mỗi sprint là một phase có gate riêng; gate cuối: tự dùng liên tục 2 tuần không bỏ weekly review.

Quyết định đã khóa:
- 8 life areas cố định (Sức khỏe, Gia đình, Mối quan hệ, Công việc, Tài chính, Học tập, Giải trí, Ý nghĩa & Phát triển bản thân), chỉnh được trọng số 1-5, không thêm/xóa mảng.
- Daily check-in: slider giờ/mảng bước 0.5h (tap-only) + mood 1-5, hoàn thành < 30 giây.
- Stack: Next.js (App Router) + Tailwind + Supabase (auth + Postgres), deploy Vercel. Web responsive, không native app.

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | Check-in hằng ngày < 30 giây trên mobile browser | P1 |
| 2 | Dashboard phản ánh đúng dữ liệu thật sau 1 tuần dùng | P1 |
| 3 | ≥ 1 gợi ý rule-based đúng/đáng làm mỗi tuần | P1 |

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Nền tảng: Auth, Life Areas, Daily Check-in](./phase-01-start.md) | Done |
| 2 | [Dashboard & Weekly Review](./phase-02-dashboard-weekly-review.md) | Done |
| 3 | [Insight Engine & Polish](./phase-03-insight-engine-polish.md) | In Progress (gate 2 tuần dùng thật) |

## Success Criteria

- [ ] Check-in hoàn thành < 30s trên mobile browser (đo thực tế)
- [ ] Sau 1 tuần, bánh xe cân bằng + trend khớp dữ liệu đã nhập
- [ ] Mỗi tuần hệ thống sinh ≥ 1 gợi ý được chủ nhân đánh giá "đúng, đáng làm"
- [ ] Gate Phase 1→mở rộng: tự dùng liên tục 2 tuần không bỏ weekly review

## Dependencies

- Tài khoản Supabase (free tier) + Vercel (hobby) — tạo ở Phase 1.
- Brainstorm contract: `/home/user/plans/reports/brainstorm-261022-0756-life-balance-app.md`
- Research & concept: doc "Life Balance App — Nghiên cứu & Kế hoạch phát triển sản phẩm" (Claude Docs)

## Non-goals

Native app, multi-user/social, integrations (calendar/chi tiêu/screen time), gamification đầy đủ, LLM insight (Phase sau MVP).

<!-- slug: life-balance-mvp -->
