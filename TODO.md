# appFIT — TODO & Roadmap

> Priorities: **P0** = launch blocker · **P1** = core differentiator · **P2** = growth · **P3** = nice to have

---

## P0 — Launch Blockers

- [ ] **RevenueCat integration** — replace mock `setPremium(true)` with real IAP (iOS + Android). Plans: $6.99/mo · $39.99/yr
- [x] **Midnight reset** — `todayMeals` auto-clears at midnight via AppState foreground check + `lastMealDate` in store
- [ ] **Supabase Email Enumeration Protection** — decide: keep OFF (forgot-password probe works) or implement server-side email check via Edge Function
- [ ] **Create foods table in Supabase** — run SQL migration manually via Supabase dashboard SQL Editor (migration file: `supabase/migrations/20260310000000_create_foods_table.sql`)
- [ ] **GitHub repo** — connect remote, push code (GitHub CLI not installed, no remote configured yet)

---

## P1 — Core Differentiators

- [x] **AI food search** — Supabase Edge Function → Claude Haiku → returns macros for any food query. Handles single + multiple foods. Caches results in `foods` table
- [ ] **AI food scanner** — camera → Claude Vision API → auto-fill macros (premium feature)
- [ ] **AI coaching tips** — replace hardcoded TIPS with Claude API personalized advice based on user profile (premium feature)
- [ ] **Intermittent fasting tracker** — last meal / next meal timer with push notifications

---

## P2 — Growth & Retention

- [ ] **Push notifications** — daily meal reminders, streak alerts (expo-notifications)
- [ ] **Water tracker** — intake log with daily goal and progress ring
- [ ] **Barcode scanner** — scan packaged foods → Open Food Facts API → auto-fill macros
- [ ] **Streak / habit tracking** — consecutive days logged, shown on Home dashboard
- [ ] **App Store listing** — Spanish ASO keywords: "contar calorias", "dieta", "bajar de peso", "ayuno intermitente"
- [ ] **Custom SMTP for Supabase** — remove dev-tier rate limit on auth emails (4/hr → unlimited)

---

## P3 — Nice to Have

- [ ] **Export data** — CSV/PDF body progress report
- [ ] **Apple Health / Google Fit sync** — read/write steps, weight, calories
- [ ] **Localization for regional variants** — Mexico vs Spain vs Argentina slang differences
- [ ] **GitHub MCP** — connect `.mcp.json` to manage backlog issues directly from Claude

---

## Done ✓

- [x] **AI food search** — Edge Function deployed, Claude Haiku integration working, handles multi-food queries
- [x] **Auth guard race condition fix** — `hydrated` state prevents premature routing before Supabase session resolves
- [x] **Sign-in skips onboarding** — `completeOnboarding()` called on login, only new registrations go through onboarding
- [x] **Horizontal dumbbell logo** — replaced vertical (phallic) logo with horizontal dumbbell SVG
- [x] **expo-auth-session removed** — replaced with `expo-linking` to fix `ExpoCrypto` native module crash
- [x] **Supabase Auth** — real email/password login + Google OAuth (replaced mock auth)
- [x] **Forgot password screen** — email existence check + Supabase reset link (`/forgot-password`)
- [x] **Onboarding flow** — 6-step profile setup post-registration (language, basic info, activity, goal, weekly plan, summary)
- [x] **Home dashboard** — calorie ring, macro breakdown, daily progress
- [x] **Meal logging** — add/remove meals, AI search, manual add
- [x] **Body log** — weight, BF%, waist + SVG line chart
- [x] **Weekly planner** — day selector, training type assignment
- [x] **Steps screen** — daily step counter using device pedometer (expo-sensors)
- [x] **Profile screen** — stats, goals, activity level, Pro banner
- [x] **Paywall UI** — Spanish copy, 7-day trial CTA, monthly/annual plans
- [x] **Dark theme** — full dark-only design system with color tokens
- [x] **Midnight reset** — `todayMeals` auto-clears at midnight
