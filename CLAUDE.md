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
npx expo run:android    # Build & run on Android (requires Android Studio)
eas build --platform android --profile preview  # Cloud build APK via EAS
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
| `expo-sensors` | Pedometer (step counter) — requires native build |
| `expo-image-picker` | Camera/gallery picker — requires native build |
| `expo-image-manipulator` | Image resize before AI scan — requires native build |

## Must-do / backlog (prioritized)
### P0 — Needed before launch
- [x] **RevenueCat integration** — `utils/purchases.ts` wrapper exists but is **stubbed** (no real RC calls). Paywall grants premium directly when RC not configured. To enable: `npm install react-native-purchases`, add plugin back to `app.json`, rebuild native. API keys go in `eas.json` env or EAS secrets.
- [x] **Real auth backend** — Supabase Auth implemented: email/password + Google OAuth in `login.tsx` / `register.tsx`; session restored via `onAuthStateChange` in `_layout.tsx`; `forgot-password.tsx` screen exists
- [x] **Daily meal reset** — called via `persist.onFinishHydration()` on launch and on foreground resume via `AppState` listener in `_layout.tsx`

### P1 — Core differentiators
- [x] **AI food scanner** — `utils/foodScanner.ts` → Claude Haiku Vision API → auto-fill macros. Button "📸 Escanear" in Macros header. Premium-gated. Requires native build for camera (`expo-image-picker`). API key via `EXPO_PUBLIC_ANTHROPIC_API_KEY` (stored as EAS secret).
- [ ] **AI coaching tips** — replace hardcoded TIPS with Claude API personalized advice based on user profile
- [x] **Intermittent fasting tracker** — live SVG ring timer, protocol picker (14/16/18/20/23h), history log; fasting phases timeline with live highlight; bold home card with live timer + ON/OFF badge + glow → `app/fasting.tsx`

### P2 — Growth & retention
- [x] **Push notifications** — daily meal reminder (toggleable in profile, time picker) + fasting-complete scheduled notification; Expo Go safe via `TurboModuleRegistry.get('ExpoPushTokenManager')` guard → `utils/notifications.ts`
- [x] **Pedometer / step counter** — `app/(tabs)/steps.tsx`; uses `expo-sensors` Pedometer; lazy-loaded so Expo Go doesn't crash; requires native build + `ACTIVITY_RECOGNITION` permission (already in `app.json`)
- [ ] **Water tracker** — intake log with daily goal
- [ ] **App Store listing** — Spanish keywords: "contar calorias", "dieta", "bajar de peso", "ayuno intermitente"
- [ ] **Barcode scanner** — scan packaged foods (use Open Food Facts API)
- [x] **Streak / habit tracking** — `currentStreak`, `longestStreak`, `streakDate` in store; increments on first `addMeal` each day; resets if a day is skipped; banner on home screen

### P3 — Nice to have
- [ ] **Export data** — CSV/PDF body progress report
- [ ] **Apple Health / Google Fit sync**
- [ ] **Localization for regional variants** — Mexico vs Spain vs Argentina slang

## EAS Build
- Project linked to EAS: `@nicodf87/appFIT` (projectId in `app.json`)
- Profile `preview` → generates installable APK, distributed internally
- Env vars in `eas.json` preview profile: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_ANTHROPIC_API_KEY` stored as EAS secret (not in any file)
- Build command: `eas build --platform android --profile preview`

## Project structure
```
app/
  _layout.tsx          # Root Stack navigator + auth guard
  welcome.tsx          # Landing/presentation screen
  login.tsx            # Auth — Supabase email/password + Google OAuth
  register.tsx         # Auth — Supabase register
  forgot-password.tsx  # Auth — password reset
  onboarding.tsx       # Post-login onboarding flow
  paywall.tsx          # Subscription paywall (modal) — grants premium directly when RC not configured
  fasting.tsx          # Intermittent fasting tracker — SVG ring, protocol picker, history
  (tabs)/
    _layout.tsx        # Tab bar layout (5 tabs)
    index.tsx          # Home/Dashboard — calorie ring, macros, fasting card, progress
    macros.tsx         # Nutrition tracking — log meals, AI scanner, quick add
    body.tsx           # Body log — weight/BF entries
    planner.tsx        # Weekly plan — day selector, nutrition by day
    profile.tsx        # Profile — stats, goals, activity level, pro banner
    steps.tsx          # Pedometer — step ring, distance, kcal, goal selector
constants/
  Colors.ts            # Single source of truth for dark theme colors
  data.ts              # Static data: TRAINING_TYPES, WEEKLY_PLAN, SAMPLE_MEALS, DEFAULT_PROFILE
  i18n.ts              # All UI strings in ES + EN via useT() hook
components/ui/
  Btn.tsx / Btn.web.tsx  # Cross-platform button (DO NOT USE — tap reliability issues)
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
  foodSearch.ts        # Food search/lookup utility (DB + AI fallback)
  foodScanner.ts       # AI food scanner — pickAndResizeImage + scanFoodImage (Claude Vision)
  purchases.ts         # RevenueCat wrapper — STUBBED, real calls commented out
  notifications.ts     # Push notification helpers — Expo Go safe
scripts/
  generate-icons.mjs   # Generates all app icons from SVG using sharp
store/
  useAppStore.ts       # Zustand store — auth, profile, meals, body log, isPremium, fasting, streaks
```

## Auth flow
`_layout.tsx` guards routes:
- Not logged in → `/welcome`
- Logged in, no onboarding → `/onboarding`
- Logged in + onboarded → `/(tabs)`

Auth uses **Supabase** (email/password + Google OAuth). Session restored on app launch via `onAuthStateChange`.

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
- `fastingActive`, `fastingStartTime`, `fastingGoalHours` — fasting tracker state
- `currentStreak`, `longestStreak`, `streakDate` — habit streak tracking

Store persists to AsyncStorage under key `appfit-storage` (current schema version: **9**). When adding new fields, bump the version and add a migration case.

## Supabase sync
`updateProfile`, `addBodyEntry`, `updateWeeklyPlan`, `setLanguage`, `setUnitSystem` all fire-and-forget sync to Supabase via `utils/userSync.ts` when `user.id` is set. Failures are silently swallowed (`.catch(() => {})`).

## Color tokens (colors.ts)
Always use `colors.*` tokens, never hardcode hex values.
Key: `bg`, `card`, `surface`, `border`, `text`, `textMuted`, `textDim`, `accent`, `accentSoft`, `green`, `greenSoft`, `blue`, `yellow`, `purple`

## Conventions
- All screens use `paddingTop: 58` for safe area (no SafeAreaView)
- Spacing: `marginHorizontal: 16` for cards, `paddingHorizontal: 22` for headers
- Border radius: 22 for cards, 16 for buttons, 14 for smaller elements
- Font weights: 800 for titles, 700 for labels, 600 for secondary, 500 for body
- Use `TouchableOpacity` for ALL taps. Do NOT use the `Btn` component — it has tap reliability issues
- No external navigation libraries beyond expo-router
- New modal/screen routes MUST be registered in the Stack in `app/_layout.tsx`

## Native-only features (require EAS build, not Expo Go)
- **Camera / gallery** — `expo-image-picker` (used in AI food scanner)
- **Pedometer** — `expo-sensors` (both lazy-loaded to avoid Expo Go crash)
- **Push notifications** — `expo-notifications` (guarded with TurboModuleRegistry check)
- **RevenueCat** — `react-native-purchases` (stubbed, plugin removed from app.json)

## Monetization
- Paywall at `app/paywall.tsx` — Spanish UI, 7-day free trial CTA
- `isPremium` flag gates premium features (AI scanner, future features)
- "Upgrade to Pro" banner in profile tab
- Plans: monthly $6.99 / annual $39.99
- RevenueCat **stubbed** — paywall grants premium directly until RC is integrated

## Food database
`SAMPLE_MEALS` in `constants/data.ts` contains Spanish/Latin foods (tacos, empanadas, arepa, etc.)
targeting Mexico, Spain, Argentina, Colombia markets.

## Do NOT
- Add SafeAreaView (paddingTop: 58 handles it)
- Use light theme — dark only
- Create new files unless necessary
- Add English-only food names to the database
- Put API keys or secrets in `eas.json` or any committed file — use EAS secrets
