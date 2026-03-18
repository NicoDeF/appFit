# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# appFIT — Claude Project Context

## What this app is
A React Native / Expo fitness tracker targeting the **Spanish-speaking market**.
Monetization via freemium + subscription paywall (monthly $6.99 / annual $39.99).

## Commands
```bash
npx expo start          # Start dev server (scan QR with Expo Go)
npx expo start --web    # Run in browser
npx expo run:android    # Build & run on Android
npx expo run:ios        # Build & run on iOS
```
No lint or test scripts are configured. TypeScript checking only via `tsc --noEmit`.

## Tech stack — installed & in use
| Package | Purpose |
|---|---|
| `expo` ~54 | Framework + build tooling |
| `expo-router` ~6 | File-based navigation (Stack + Tabs) |
| `react-native` ~0.81 | Core mobile UI |
| `typescript` ~5.9 | Language |
| `zustand` ^5 | Global state management |
| `@react-native-async-storage/async-storage` | Persisting store to device |
| `@supabase/supabase-js` ^2 | Backend sync (profile, body log, weekly plan) |
| `react-native-svg` | SVG charts (CalorieRing, WeightChart, MacroRing) |
| `expo-splash-screen` | Splash screen control |
| `expo-status-bar` | Status bar styling |

## Must-do / backlog (prioritized)
### P0 — Needed before launch
- [x] **RevenueCat integration** — `utils/purchases.ts` wrapper; init on login with user ID; `checkEntitlement` syncs to store on launch; real purchase + restore flow in `paywall.tsx`; `react-native-purchases` plugin in `app.json` — **requires `npm install react-native-purchases` + native rebuild**
- [x] **Real auth backend** — Supabase Auth implemented: email/password + Google OAuth in `login.tsx` / `register.tsx`; session restored via `onAuthStateChange` in `_layout.tsx`; `forgot-password.tsx` screen exists
- [x] **Daily meal reset** — called via `persist.onFinishHydration()` on launch (after AsyncStorage loads) and on foreground resume via `AppState` listener in `_layout.tsx`

### P1 — Core differentiators
- [ ] **AI food scanner** — camera → Claude Vision API → auto-fill macros (premium feature)
- [ ] **AI coaching tips** — replace hardcoded TIPS with Claude API personalized advice based on user profile
- [x] **Intermittent fasting tracker** — live SVG ring timer, protocol picker (14/16/18/20/23h), history log; fasting phases timeline with live highlight; bold home card with live timer + ON/OFF badge + glow → `app/fasting.tsx`

### P2 — Growth & retention
- [x] **Push notifications** — daily meal reminder (toggleable in profile, time picker) + fasting-complete scheduled notification; Expo Go safe via `TurboModuleRegistry.get('ExpoPushTokenManager')` guard → `utils/notifications.ts`
- [ ] **Water tracker** — intake log with daily goal
- [ ] **App Store listing** — Spanish keywords: "contar calorias", "dieta", "bajar de peso", "ayuno intermitente"
- [ ] **Barcode scanner** — scan packaged foods (use Open Food Facts API)
- [x] **Streak / habit tracking** — `currentStreak`, `longestStreak`, `streakDate` in store; increments on first `addMeal` each day; resets if a day is skipped; banner on home screen

### P3 — Nice to have
- [ ] **Export data** — CSV/PDF body progress report
- [ ] **Apple Health / Google Fit sync**
- [ ] **Localization for regional variants** — Mexico vs Spain vs Argentina slang

## Project structure
```
app/
  _layout.tsx          # Root Stack navigator + auth guard
  welcome.tsx          # Landing/presentation screen
  login.tsx            # Auth - mock login
  register.tsx         # Auth - mock register
  onboarding.tsx       # Post-login onboarding flow
  paywall.tsx          # Subscription paywall (modal)
  (tabs)/
    _layout.tsx        # Tab bar layout (5 tabs)
    index.tsx          # Home/Dashboard — calorie ring, macros, progress
    macros.tsx         # Nutrition tracking — log meals, quick add
    body.tsx           # Body log — weight/BF entries
    planner.tsx        # Weekly plan — day selector, nutrition by day
    profile.tsx        # Profile — stats, goals, activity level, pro banner
constants/
  Colors.ts            # Single source of truth for dark theme colors
  data.ts              # Static data: TRAINING_TYPES, WEEKLY_PLAN, SAMPLE_MEALS, DEFAULT_PROFILE
components/ui/
  Btn.tsx / Btn.web.tsx  # Cross-platform button (Pressable on native, <button> on web)
  MacroRing.tsx          # SVG donut ring for macro display
  MiniBar.tsx            # Horizontal progress bar
  WeightChart.tsx        # SVG line chart for body log
  StatCard.tsx           # Stat card component
  AppLogo.tsx            # App logo
utils/
  helpers.ts           # calcMacros, calcTDEE, estimateBF, calcCalorieTarget, calcProteinPerKg, pct
                       # Also exports: ACTIVITY_LEVELS, GOALS, Gender, ActivityLevel types
  units.ts             # UnitSystem type ('metric' | 'imperial'), unit conversion helpers
  supabase.ts          # Supabase client instance
  userSync.ts          # syncProfile, syncWeeklyPlan, syncBodyEntry — fire-and-forget Supabase writes
  foodSearch.ts        # Food search/lookup utility
store/
  useAppStore.ts       # Zustand store — auth, profile, meals, body log, isPremium
```

## Auth flow
`_layout.tsx` guards routes:
- Not logged in → `/welcome`
- Logged in, no onboarding → `/onboarding`
- Logged in + onboarded → `/(tabs)`

Auth is **mock** (no real backend yet). `login(user)` just sets `isLoggedIn: true`.

## Key store state
- `isLoggedIn`, `user` — auth
- `isPremium` — paywall flag (set via `setPremium(true)`)
- `language` — `'es' | 'en'` (default `'es'`)
- `unitSystem` — `'metric' | 'imperial'` (default `'metric'`)
- `profile` — weight, targetWeight, height, age, gender, activityLevel, goal, tdee, bodyFat, targetBf, proteinPerKg
- `todayMeals` — array of Meal logged today (auto-cleared on new day via `resetMealsIfNewDay`)
- `lastMealDate` — ISO date string used for daily reset detection
- `bodyLog` — historical BodyEntry[] (date, weight, bf, waist)
- `weeklyPlan` — WeekDay[] where each day has `activities: DayActivity[]`
- `trainingType` — current day's training type string

Store persists to AsyncStorage under key `appfit-storage` (current schema version: **9**). When adding new fields, bump the version and add a migration case.

## Supabase sync
`updateProfile`, `addBodyEntry`, `updateWeeklyPlan`, `setLanguage`, `setUnitSystem` all fire-and-forget sync to Supabase via `utils/userSync.ts` when `user.id` is set. Failures are silently swallowed (`.catch(() => {})`).

## Color tokens (colors.ts)
Always use `colors.*` tokens, never hardcode hex values.
Key: `bg`, `card`, `surface`, `border`, `text`, `textMuted`, `textDim`, `accent`, `accentSoft`, `green`, `greenSoft`, `blue`, `yellow`

## Conventions
- All screens use `paddingTop: 58` for safe area (no SafeAreaView)
- Spacing: `marginHorizontal: 16` for cards, `paddingHorizontal: 22` for headers
- Border radius: 22 for cards, 16 for buttons, 14 for smaller elements
- Font weights: 800 for titles, 700 for labels, 600 for secondary, 500 for body
- Use `TouchableOpacity` for ALL taps. Do NOT use the `Btn` component — it has tap reliability issues
- No external navigation libraries beyond expo-router
- New modal/screen routes MUST be registered in the Stack in `app/_layout.tsx`

## Monetization
- Paywall at `app/paywall.tsx` — Spanish UI, 7-day free trial CTA
- `isPremium` flag gates premium features
- "Upgrade to Pro" banner in profile tab
- Plans: monthly $6.99 / annual $39.99
- RevenueCat integration is in the backlog (P0)

## Food database
`SAMPLE_MEALS` in `constants/data.ts` contains Spanish/Latin foods (tacos, empanadas, arepa, etc.)
targeting Mexico, Spain, Argentina, Colombia markets.

## Do NOT
- Add SafeAreaView (paddingTop: 58 handles it)
- Use light theme — dark only
- Create new files unless necessary
- Add English-only food names to the database
