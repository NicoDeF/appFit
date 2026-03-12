# appFIT — Claude Project Context

## What this app is
A React Native / Expo fitness tracker targeting the **Spanish-speaking market**.
Monetization via freemium + subscription paywall (monthly $6.99 / annual $39.99).

## Tech stack — installed & in use
| Package | Purpose |
|---|---|
| `expo` ~52 | Framework + build tooling |
| `expo-router` | File-based navigation (Stack + Tabs) |
| `react-native` | Core mobile UI |
| `typescript` | Language |
| `zustand` | Global state management |
| `@react-native-async-storage/async-storage` | Persisting store to device |
| `react-native-svg` | SVG charts (CalorieRing, WeightChart, MacroRing) |
| `expo-splash-screen` | Splash screen control |
| `expo-status-bar` | Status bar styling |

## Must-do / backlog (prioritized)
### P0 — Needed before launch
- [ ] **RevenueCat integration** — replace mock `setPremium(true)` with real IAP (iOS + Android)
- [ ] **Real auth backend** — replace mock login/register with Supabase or Firebase Auth
- [ ] **Daily meal reset** — `todayMeals` should clear at midnight automatically

### P1 — Core differentiators
- [ ] **AI food scanner** — camera → Claude Vision API → auto-fill macros (premium feature)
- [ ] **AI coaching tips** — replace hardcoded TIPS with Claude API personalized advice based on user profile
- [ ] **Intermittent fasting tracker** — last meal / next meal timer with notifications

### P2 — Growth & retention
- [ ] **Push notifications** — daily meal reminders, streak alerts
- [ ] **Water tracker** — intake log with daily goal
- [ ] **App Store listing** — Spanish keywords: "contar calorias", "dieta", "bajar de peso", "ayuno intermitente"
- [ ] **Barcode scanner** — scan packaged foods (use Open Food Facts API)
- [ ] **Streak / habit tracking** — consecutive days logged

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
store/
  useAppStore.ts       # Zustand store — auth, profile, meals, body log, isPremium
```

## Auth flow
`_layout.tsx` guards routes:
- Not logged in → `/welcome`
- Logged in, no onboarding → `/onboarding`
- Logged in + onboarded → `/(tabs)`

Auth is **mock** (no backend). `login(user)` just sets `isLoggedIn: true`.

## Key store state
- `isLoggedIn`, `user` — auth
- `isPremium` — paywall flag (set via `setPremium(true)`)
- `profile` — weight, height, age, gender, activityLevel, goal, tdee, bodyFat, targetBf, proteinPerKg
- `todayMeals` — array of Meal logged today
- `bodyLog` — historical weight/BF entries
- `weeklyPlan` — 7-day training type plan

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
