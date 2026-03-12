# appFIT — Product Documentation

## Vision

A fitness tracker for the **Spanish-speaking market** (Mexico, Spain, Argentina, Colombia).
Freemium model — free core tracking, premium AI features + coaching behind a paywall.

Target user: Spanish-speaking person aged 18–40 who wants to track calories, macros, and body composition without a complex app.

---

## What the app does today (v1 — current)

| Feature | Status | Screen |
|---|---|---|
| Auth — Supabase email/password + Google OAuth | Working | `login.tsx`, `register.tsx` |
| Forgot password — email probe + Supabase reset link | Working | `forgot-password.tsx` |
| Onboarding — collect profile data | Working | `onboarding.tsx` |
| Home dashboard — calorie ring, macros, progress | Working | `index.tsx` |
| Meal logging — add/remove meals from food DB | Working | `macros.tsx` |
| Body log — weight, BF%, waist tracking + chart | Working | `body.tsx` |
| Weekly planner — assign training type by day | Working | `planner.tsx` |
| Profile — stats, goals, activity level | Working | `profile.tsx` |
| Paywall — monthly $6.99 / annual $39.99 | UI only (RevenueCat TODO) | `paywall.tsx` |

---

## Navigation Flow

```
App Launch
    |
    v
_layout.tsx  <-- Supabase session sync + auth guard on every navigation
    |
    +-- not logged in -----------> /welcome
    |                                  |
    |                       /login ----+---- /register
    |                          |               |
    |              completeOnboarding()    (new user)
    |              called → skips          goes through
    |              onboarding              /onboarding
    |                   |
    |             Forgot password? --> /forgot-password
    |                                  |
    +-- logged in, no onboarding ----> /onboarding (register flow only)
    |                                  |
    +-- logged in + onboarded <--------+
                |
                v
           /(tabs)
        +----------------------------------------------+
        | Home | Macros | Body | Planner | Pasos | Profile |
        +----------------------------------------------+
                                    |
                              Profile -> /paywall (modal)
```

### Onboarding Steps (register flow only)

| Step | Screen | Collects |
|------|--------|---------|
| 0 | Setup | Language (ES/EN) + unit system (metric/imperial) |
| 1 | Basic info | Gender, age, weight, height |
| 2 | Activity level | Sedentary → Very active |
| 3 | Goal | Cut / Bulk / Recomp + target weight |
| 4 | Weekly plan | Training type per day |
| 5 | All set | Shows calculated calories & protein → finish |

Onboarding saves to `profile` in the Zustand store and calls `completeOnboarding()` → redirects to `/(tabs)`.
Existing users who sign in via `/login` automatically call `completeOnboarding()` and skip this flow entirely.

---

## Tech Stack

| Layer | Tech | Notes |
|---|---|---|
| Framework | Expo SDK 54 | File-based routing via expo-router |
| Language | TypeScript | Strict mode |
| UI | React Native 0.81.5 | Dark theme only, New Architecture enabled |
| Navigation | expo-router 6 (Stack + Tabs) | No React Navigation directly |
| State | Zustand 5 + AsyncStorage | Persisted to device, schema v4 |
| Auth | Supabase Auth | Email/password + Google OAuth |
| Backend | Supabase (PostgreSQL) | Auth + future data sync |
| Charts/SVG | react-native-svg 15 | CalorieRing, WeightChart, MacroRing |
| Animations | react-native-reanimated 4.x | + react-native-worklets |

---

## Auth Flow

Supabase Auth handles all authentication. `_layout.tsx` listens to `onAuthStateChange` and syncs the session into Zustand.

- **Email/password** — `supabase.auth.signInWithPassword`
- **Google OAuth** — `supabase.auth.signInWithOAuth` with `skipBrowserRedirect: true`
  - iOS: `ASWebAuthenticationSession` handles redirect internally → `exchangeCodeForSession` called in app
  - Android: Chrome Custom Tabs fires a deep link → `_layout.tsx` handles it via `Linking.addEventListener`
- **Forgot password** — probes email existence via `signInWithPassword` (dummy password), then calls `resetPasswordForEmail` if registered
  - Note: requires **Email Enumeration Protection OFF** in Supabase Auth settings
- **Deep link scheme**: `appfit://` — configured in `app.json`

---

## State (Zustand Store)

Storage key: `appfit-storage` (AsyncStorage), schema version **4**.

```
AppState
  Auth
    isLoggedIn: boolean
    user: { name, email } | null
    hasCompletedOnboarding: boolean
    isPremium: boolean

  Profile
    weight, targetWeight, height, age
    gender: 'male' | 'female'
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active'
    goal: 'cut' | 'bulk' | 'recomp'
    tdee: number          <-- calculated on onboarding
    bodyFat: number       <-- estimated via Deurenberg formula
    targetBf: number
    proteinPerKg: number  <-- set by goal (cut: 2.4, bulk: 2.0, recomp: 2.2)

  Nutrition
    todayMeals: Meal[]    <-- cleared manually (midnight reset is TODO)

  Body
    bodyLog: BodyEntry[]  <-- weight, bf%, waist, date

  Training
    trainingType: string  <-- today's type
    weeklyPlan: WeekDay[] <-- 7-day plan
```

---

## Calculation Logic (utils/helpers.ts)

| Function | Formula | Purpose |
|---|---|---|
| `calcTDEE` | Mifflin-St Jeor BMR × activity multiplier | Daily calorie maintenance |
| `estimateBF` | Deurenberg BMI-based formula | Body fat % estimate |
| `calcCalorieTarget` | cut: TDEE-400 / bulk: TDEE+250 / recomp: TDEE | Goal-adjusted calories |
| `calcProteinPerKg` | cut: 2.4 / bulk: 2.0 / recomp: 2.2 g/kg | Protein target |
| `calcMacros` | Protein first, 25% fat, rest carbs | Full macro split |

---

## Food Database

`constants/data.ts` — `SAMPLE_MEALS` — Spanish/Latin foods:
- Tacos, empanadas, arepa, tamales, ceviche, etc.
- Targeting: Mexico, Spain, Argentina, Colombia

Each meal: `{ id, name, cal, p (protein g), c (carbs g), f (fat g) }`

---

## Monetization

- **Free tier**: all core tracking (meals, body, planner)
- **Premium ($6.99/mo or $39.99/yr)**: AI scanner, AI coaching (planned)
- `isPremium` flag in store gates premium features
- Paywall UI at `/paywall` — RevenueCat integration is in TODO.md

---

## Design Conventions

| Rule | Value |
|---|---|
| Safe area top | `paddingTop: 58` (no SafeAreaView) |
| Card margin | `marginHorizontal: 16` |
| Header padding | `paddingHorizontal: 22` |
| Card border radius | 22 |
| Button border radius | 16 |
| Title font weight | 800 |
| Label font weight | 700 |
| Tap handler | `TouchableOpacity` only (no Btn component — has reliability issues) |
| Theme | Dark only |
| Colors | Always via `colors.*` tokens from `constants/Colors.ts` |

---

## Key Color Tokens

```
bg          -- main background
card        -- card background
surface     -- elevated surface
border      -- borders
text        -- primary text
textMuted   -- secondary text
textDim     -- placeholder / disabled
accent      -- primary brand color (orange-ish)
accentSoft  -- accent with opacity
green       -- positive / gain
blue        -- body fat indicator
yellow      -- waist / secondary metric
```

---

## Known Issues / Technical Debt

| Issue | Priority |
|---|---|
| `todayMeals` never auto-clears at midnight | P0 |
| RevenueCat not integrated — `isPremium` set via `setPremium(true)` | P0 |
| Forgot password probe depends on Supabase Email Enumeration Protection being OFF | Infra |
| Supabase dev tier rate-limits reset emails to ~4/hr — use custom SMTP in prod | Infra |
| Android build requires manual gradle fixes after every `expo prebuild` | Infra |
| `react-native-worklets` JS/native version must stay in sync — requires full rebuild on upgrade | Infra |

---

## MCP Servers (`.mcp.json`)

| Server | Purpose |
|---|---|
| `supabase` | DB migrations, table inspection, SQL execution, edge functions via Claude |

---

## What is Zustand?

Zustand is a **state management library** for React. Think of it as a shared box that all screens can read from and write to at the same time.

### The problem it solves

In React, each component has its own local state (`useState`). If two screens need the same data — say, the dashboard and the meal logger both need `todayMeals` — you'd normally have to pass that data down through props across multiple components. This gets messy fast.

Zustand gives you a **global store** that lives outside any component. Any screen can grab exactly what it needs with one line:

```ts
const { todayMeals, addMeal } = useAppStore();
```

### How it works

```
useAppStore.ts  (the store)
      │
      │  defines:
      │    - state (data)
      │    - actions (functions that change data)
      │
      └──► any screen can call useAppStore()
                │
                ▼
           gets live data + functions
           screen re-renders automatically when data changes
```

### Why Zustand over other options?

| Option | Problem |
|---|---|
| `useState` per screen | Data doesn't survive navigation changes |
| React Context | Causes unnecessary re-renders, verbose to set up |
| Redux | Lots of boilerplate for a small app |
| **Zustand** | Simple, minimal code, fast, works great with React Native |

### Persistence (AsyncStorage)

By default Zustand state lives only in memory — it resets when the app closes. appFIT uses the `persist` middleware to automatically save the store to `AsyncStorage` (the device's local storage), so data survives app restarts:

```
User logs a meal
    │
    ▼
addMeal() updates todayMeals[] in memory
    │
    ▼
Zustand persist middleware saves to AsyncStorage automatically
    │
    ▼
User closes & reopens app → data is restored
```

### Schema versioning

Every time a new field is added to the store, the `version` number is bumped and a `migrate` function handles existing users who don't have that field yet — so their app doesn't crash after an update.

---

## App Architecture — Full Flowcharts

### 1. App Launch Flow

```
App opens
    │
    ▼
_layout.tsx boots
    │
    ├─ Hides splash screen
    ├─ Checks midnight reset (new day? → clear meals)
    ├─ Restores Supabase session
    └─ Reads Zustand store from AsyncStorage
            │
            ▼
      Is user logged in?
       ┌────┴────┐
      NO        YES
       │         │
       ▼         ▼
   /welcome   Has onboarding?
               ┌────┴────┐
              NO        YES
               │         │
               ▼         ▼
         /onboarding   /(tabs)  ← main app
```

---

### 2. State Flow (the brain)

```
         AsyncStorage (disk)
               │  persists to / loads from
               ▼
        useAppStore.ts  ← Zustand store
        (single source of truth)
               │
      ┌────────┼────────┐
      │        │        │
      ▼        ▼        ▼
  index.tsx  macros  profile
  (dashboard) (meals) (user data)
  body.tsx  planner.tsx

Every screen reads from and writes to the same store.
No screen owns data — they all share it.
```

---

### 3. Screen Map

```
Stack Navigator (_layout.tsx)
├── /welcome         ← landing page
├── /login           ← auth
├── /register        ← auth
├── /forgot-password ← auth
├── /onboarding      ← profile setup
├── /paywall         ← subscription modal
└── /(tabs)          ← Tab Navigator
        ├── index    → Dashboard (calories, macros, weight)
        ├── macros   → Log meals
        ├── body     → Weight & BF log
        ├── planner  → Weekly training plan
        ├── steps    → Daily step counter (pedometer ring, distance, kcal, goal selector)
        └── profile  → Settings, goals, Pro banner
```

---

### 4. Data Flow — Logging a Meal

```
User taps "Add meal" on macros.tsx
    │
    ▼
Picks food from SAMPLE_MEALS (constants/data.ts)
    │
    ▼
Calls addMeal(meal) → useAppStore
    │
    ▼
Store updates todayMeals[]
    │
    ▼
index.tsx re-renders automatically
(calorie ring + macro bars update live)
```

---

### 5. Premium Gate Flow

```
User tries a premium feature
    │
    ▼
isPremium? (from store)
  ┌───┴───┐
 YES      NO
  │        │
  ▼        ▼
Feature  /paywall modal
works    (Spanish UI, plans)
              │
         User subscribes
              │  (RevenueCat — TODO)
              ▼
         setPremium(true)
              │
              ▼
         Feature unlocked
```

---

### 6. The Big Picture

```
┌─────────────────────────────────────┐
│           React Native / Expo       │
│  ┌─────────────┐  ┌──────────────┐  │
│  │  Screens    │  │  Components  │  │
│  │ (app/*.tsx) │  │ (ui/*.tsx)   │  │
│  └──────┬──────┘  └──────┬───────┘  │
│         └────────┬────────┘         │
│                  ▼                  │
│           useAppStore.ts            │  ← Zustand
│                  │                  │
│         ┌────────┴────────┐         │
│         ▼                 ▼         │
│    AsyncStorage       Supabase      │
│    (local data)       (auth only)   │
└─────────────────────────────────────┘
         │                  │
         ▼                  ▼
   stays on device     cloud (email/password)
```

**Key idea:** The app is mostly offline-first. Supabase only handles login. Everything else — meals, weight, goals, plans — lives on the device in AsyncStorage via Zustand. That's why there's no "sync" or loading spinners — it's all instant local reads.
