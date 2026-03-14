# appFIT — Mobile Automation with MCP

## Overview

appFIT is a React Native / Expo fitness tracker for the **Spanish-speaking market**, fully automatable via [mobile-mcp](https://github.com/mobile-next/mobile-mcp) — a Model Context Protocol server that enables AI agents to interact with the app on Android emulators, iOS simulators, and real devices through a unified interface.

This document covers both the app itself and how to drive it programmatically using Claude + mobile-mcp.

---

## What mobile-mcp enables on appFIT

AI agents can automate full user journeys inside appFIT without writing a single test script:

- **Navigate** through Welcome → Login → Onboarding → Home → any tab
- **Log meals** — search "arroz", "tacos", "empanada" and add them with one tap
- **Register body entries** — weight and body fat via the Cuerpo tab
- **Inspect UI state** — read calorie rings, macro bars, weekly planner values
- **Take screenshots** — capture any screen for QA, documentation, or Figma upload
- **Validate flows** — verify that the paywall blocks premium features correctly

---

## Core App Capabilities

- **Calorie & macro tracking** — log meals from a Spanish/Latin food database (tacos, arepa, empanada, etc.)
- **Body log** — track weight and body fat over time with SVG charts
- **Weekly planner** — assign training types (Fútbol, Gym, Yoga, Rest…) per day
- **AI macro estimator** — describe a food in plain Spanish → Claude returns estimated macros
- **Freemium paywall** — monthly ($6.99) and annual ($39.99) plans with 7-day free trial
- **Profile & goals** — TDEE calculation, protein targets, activity level, body fat estimation

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
| `react-native-svg` | Calorie ring, macro rings, weight chart |
| `supabase` | Backend + Edge Functions |
| `@mobilenext/mobile-mcp` | AI-driven mobile automation |

---

## Project Structure

```
app/
  _layout.tsx          # Root Stack navigator + auth guard
  welcome.tsx          # Landing screen — "MÁS FUERTE. CADA DÍA."
  login.tsx            # Auth
  register.tsx         # Auth
  onboarding.tsx       # Post-login onboarding flow (weight, height, goals)
  paywall.tsx          # Subscription paywall (modal)
  (tabs)/
    index.tsx          # Home — calorie ring, macros, body progress
    macros.tsx         # Nutrición — log meals, search food, quick add
    body.tsx           # Cuerpo — weight/BF log, charts, composition
    planner.tsx        # Plan — weekly training calendar
    profile.tsx        # Mis Datos — stats, goals, Pro banner
constants/
  Colors.ts            # Single source of truth for dark theme tokens
  data.ts              # SAMPLE_MEALS (Spanish foods), TRAINING_TYPES, DEFAULT_PROFILE
components/ui/
  MacroRing.tsx        # SVG donut for protein/carbs/fat
  WeightChart.tsx      # SVG line chart for body log
  MiniBar.tsx          # Horizontal progress bar
  StatCard.tsx         # Stat card component
utils/
  helpers.ts           # calcTDEE, calcMacros, estimateBF, calcCalorieTarget
store/
  useAppStore.ts       # Zustand store — auth, profile, meals, bodyLog, isPremium
supabase/
  functions/
    estimate-macros/   # Edge Function — AI macro estimation via Claude
```

---

## Getting Started

### Run the app

```bash
npm install
npx expo start
```

Press `a` to open on Android emulator, `i` for iOS simulator, or scan the QR with Expo Go.

### Enable mobile-mcp automation

Add to your Claude Code / Claude Desktop MCP config:

```json
{
  "mcpServers": {
    "mobile-mcp": {
      "command": "npx",
      "args": ["-y", "@mobilenext/mobile-mcp@latest"]
    }
  }
}
```

---

## Automation Examples

Once mobile-mcp is connected and the emulator is running, Claude can execute natural language instructions against the live app.

### List available devices
```
mobile_list_available_devices
→ emulator-5554 | Medium Phone API 36 | Android 16 | online
```

### Take a screenshot
```
mobile_take_screenshot(device: "emulator-5554")
→ Returns PNG of current screen (Welcome, Home, Nutrición, etc.)
```

### Navigate to Nutrición and log a meal
```
1. mobile_list_elements_on_screen     → find "Nutrición" tab at (270, 2305)
2. mobile_click_on_screen_at_coordinates(270, 2305)
3. mobile_swipe_on_screen(direction: "up")
4. mobile_click_on_screen_at_coordinates(353, 1183)  → focus search field
5. mobile_type_keys(text: "arroz")
   → Result: "arroz blanco cocido · 130 kcal · Estimado por IA"
```

### Inspect calorie ring state
```
mobile_list_elements_on_screen
→ "2990"  (kcal restantes)
→ "0"     (consumido)
→ "2990"  (objetivo)
```

### Press hardware back button
```
mobile_press_button(button: "BACK")
```

---

## Screen Map

| Screen | Route | Key elements |
|---|---|---|
| Welcome | `/welcome` | "MÁS FUERTE. CADA DÍA.", Comenzar, Iniciar sesión |
| Login | `/login` | Email + password fields |
| Onboarding | `/onboarding` | Weight, height, age, gender, goal, activity |
| Home | `/(tabs)/index` | Calorie ring, macros, body stats, progress bars, weight chart |
| Nutrición | `/(tabs)/macros` | Food search, meal list, macro rings, quick add |
| Cuerpo | `/(tabs)/body` | Weight/BF log, SVG chart, composition breakdown |
| Plan | `/(tabs)/planner` | Day selector, training type per day |
| Mis Datos | `/(tabs)/profile` | Profile stats, goals, Pro banner |
| Paywall | `/paywall` | Monthly $6.99 / Annual $39.99, 7-day trial |

---

## Auth Flow

```
Not logged in     →  /welcome
Logged in         →  /onboarding  (if not completed)
Logged in + done  →  /(tabs)
```

Auth is currently mock — `login(user)` sets `isLoggedIn: true` with no backend call.
Supabase Auth integration is in the roadmap.

---

## Target Markets

Mexico · Argentina · Colombia · Spain

Food database and UI are fully in Spanish.
App Store keywords: `contar calorias`, `dieta`, `bajar de peso`, `ayuno intermitente`

---

## Roadmap

- [ ] **RevenueCat** — real IAP (iOS + Android)
- [ ] **Supabase Auth** — replace mock login
- [ ] **AI food scanner** — camera → Claude Vision → auto-fill macros
- [ ] **Barcode scanner** — Open Food Facts API
- [ ] **Push notifications** — meal reminders, streak alerts
- [ ] **Water tracker** — daily intake log
- [ ] **Apple Health / Google Fit sync**
- [ ] **Streak tracking** — consecutive days logged

---

## Prerequisites for Automation

- Android Studio + emulator **or** Xcode + simulator
- Node.js v22+
- Claude Code or Claude Desktop with MCP enabled
- `npx expo start` running

---

*Built for the Spanish-speaking fitness market. Powered by Expo + Claude.*
