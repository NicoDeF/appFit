# appFIT

A React Native / Expo fitness tracker for the **Spanish-speaking market**.

Track calories, macros, body composition, and weekly training plans — all in a clean dark UI.

---

## Features

- **Calorie & macro tracking** — log meals from a Spanish/Latin food database
- **Body log** — track weight and body fat over time with charts
- **Weekly planner** — assign training types to each day
- **AI macro estimator** — estimate macros from a food description (Supabase Edge Function + Claude)
- **Freemium paywall** — monthly ($6.99) and annual ($39.99) plans with 7-day free trial
- **Profile & goals** — TDEE calculation, protein targets, activity level

---

## Tech Stack

| Package | Purpose |
|---|---|
| `expo` ~52 | Framework + build tooling |
| `expo-router` | File-based navigation (Stack + Tabs) |
| `react-native` | Core mobile UI |
| `typescript` | Language |
| `zustand` | Global state management |
| `@react-native-async-storage/async-storage` | Persisting store to device |
| `react-native-svg` | SVG charts |
| `supabase` | Backend + Edge Functions |

---

## Project Structure

```
app/
  _layout.tsx          # Root Stack navigator + auth guard
  welcome.tsx          # Landing screen
  login.tsx            # Auth (mock)
  register.tsx         # Auth (mock)
  onboarding.tsx       # Post-login onboarding flow
  paywall.tsx          # Subscription paywall
  (tabs)/
    index.tsx          # Home — calorie ring, macros, progress
    macros.tsx         # Nutrition tracking — log meals, quick add
    body.tsx           # Body log — weight/BF entries
    planner.tsx        # Weekly plan
    profile.tsx        # Profile, goals, pro banner
constants/
  Colors.ts            # Dark theme color tokens
  data.ts              # SAMPLE_MEALS, TRAINING_TYPES, DEFAULT_PROFILE
components/ui/         # Reusable UI components
utils/
  helpers.ts           # calcMacros, calcTDEE, estimateBF, etc.
store/
  useAppStore.ts       # Zustand store
supabase/
  functions/
    estimate-macros/   # Edge Function — AI macro estimation
```

---

## Getting Started

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android) or press `i`/`a` to open in simulator.

---

## Target Markets

Mexico, Argentina, Colombia, Spain — food database and UI are in Spanish.

App Store keywords: `contar calorias`, `dieta`, `bajar de peso`, `ayuno intermitente`

---

## Roadmap

- [ ] RevenueCat integration (real IAP)
- [ ] Real auth backend (Supabase Auth)
- [ ] AI food scanner (camera → Claude Vision)
- [ ] Barcode scanner (Open Food Facts)
- [ ] Push notifications
- [ ] Water tracker
- [ ] Apple Health / Google Fit sync
