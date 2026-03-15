# appFIT

Fitness tracker para el **mercado hispanohablante** construido con React Native + Expo.
Orientado a México, Argentina, Colombia y España — UI y base de datos de alimentos 100% en español.

---

## ¿Qué hace la app?

appFIT ayuda al usuario a alcanzar sus objetivos físicos a través de cuatro pilares:

1. **Nutrición** — registra comidas, calcula calorías y macros del día en tiempo real
2. **Cuerpo** — lleva un historial de peso y grasa corporal con gráficos de evolución
3. **Planificación** — asigna tipos de entrenamiento a cada día de la semana
4. **Perfil** — calcula TDEE, objetivo calórico, proteína por kg y porcentaje de grasa estimado

El modelo de negocio es **freemium**: funciones básicas gratis + suscripción Pro con funciones avanzadas (escáner de alimentos con IA, coaching personalizado).

---

## Tech Stack

| Paquete                                     | Uso                                                    |
| ------------------------------------------- | ------------------------------------------------------ |
| `expo` ~52                                  | Framework + build tooling                              |
| `expo-router`                               | Navegación file-based (Stack + Tabs)                   |
| `react-native`                              | UI mobile nativa                                       |
| `typescript`                                | Lenguaje                                               |
| `zustand`                                   | Estado global                                          |
| `@react-native-async-storage/async-storage` | Persistencia local del store                           |
| `react-native-svg`                          | Gráficos SVG (calorie ring, macro rings, weight chart) |
| `supabase`                                  | Backend, Auth y Edge Functions                         |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                    Expo Router                      │
│  Stack: welcome → login → onboarding → (tabs)       │
│         paywall (modal)                             │
└────────────────────┬────────────────────────────────┘
                     │
          ┌──────────▼──────────┐
          │   Zustand Store     │
          │  useAppStore.ts     │
          │                     │
          │  auth / profile     │
          │  todayMeals         │
          │  bodyLog            │
          │  weeklyPlan         │
          │  isPremium          │
          └──────────┬──────────┘
                     │
       ┌─────────────┼─────────────┐
       │             │             │
  ┌────▼────┐  ┌─────▼────┐  ┌────▼────────┐
  │ helpers │  │ Supabase │  │  constants  │
  │ calcTDEE│  │  Auth    │  │  Colors.ts  │
  │calcMacros  │  Sync    │  │  data.ts    │
  │estimateBF  │  Edge Fn │  │  i18n.ts    │
  └─────────┘  └──────────┘  └─────────────┘
```

### Flujo de autenticación

```
App abre
  │
  ├── No logueado          →  /welcome
  │
  ├── Logueado, sin onboarding  →  /onboarding
  │
  └── Logueado + onboarding     →  /(tabs)
```

La guarda vive en `app/_layout.tsx`. Auth actualmente es mock; Supabase Auth está en el roadmap.

---

## Estructura del proyecto

```
app/
  _layout.tsx          # Root Stack + auth guard
  welcome.tsx          # Landing — "MÁS FUERTE. CADA DÍA."
  login.tsx            # Login
  register.tsx         # Registro
  onboarding.tsx       # Configuración inicial (peso, altura, objetivo, actividad)
  paywall.tsx          # Paywall modal — mensual $6.99 / anual $39.99
  (tabs)/
    _layout.tsx        # Tab bar (6 tabs)
    index.tsx          # Home — calorie ring, macros, progreso, gráfico de peso
    macros.tsx         # Nutrición — buscar alimentos, log del día, añadir manual
    body.tsx           # Cuerpo — log de peso/BF, gráfico, composición corporal
    planner.tsx        # Plan — selector de día, tipo de entrenamiento por día
    profile.tsx        # Mis Datos — estadísticas, metas, nivel de actividad, banner Pro

constants/
  Colors.ts            # Tokens de color del tema oscuro (única fuente de verdad)
  data.ts              # SAMPLE_MEALS, TRAINING_TYPES, WEEKLY_PLAN, DEFAULT_PROFILE
  i18n.ts              # Textos en español (internacionalización)

components/ui/
  MacroRing.tsx        # Donut SVG para proteína / carbos / grasa
  WeightChart.tsx      # Gráfico de línea SVG para evolución de peso
  MiniBar.tsx          # Barra de progreso horizontal
  StatCard.tsx         # Tarjeta de estadística
  AppLogo.tsx          # Logo de la app

utils/
  helpers.ts           # calcTDEE, calcMacros, estimateBF, calcCalorieTarget, calcProteinPerKg, pct
  units.ts             # Conversión métrico ↔ imperial
  userSync.ts          # Sincronización de datos con Supabase

store/
  useAppStore.ts       # Zustand store con persistencia AsyncStorage

supabase/
  migrations/          # Migraciones SQL
  functions/
    estimate-macros/   # Edge Function — descripción en español → macros via Claude
```

---

## Estado global (Zustand)

```ts
// Autenticación
isLoggedIn: boolean
user: User | null
hasCompletedOnboarding: boolean
isPremium: boolean

// Perfil
profile: {
  weight, height, age, gender
  activityLevel, goal
  tdee, bodyFat, targetBf, targetWeight
  proteinPerKg
}

// Nutrición
todayMeals: Meal[]       // se resetea automáticamente a medianoche
lastMealDate: string

// Cuerpo
bodyLog: BodyEntry[]     // { date, weight, bf, waist }

// Planificación
weeklyPlan: WeeklyEntry[]  // { day, activities: [{ type, label }] }

// Preferencias
language: 'es'
unitSystem: 'metric' | 'imperial'
```

---

## Cálculos principales

| Función             | Fórmula                                                   | Resultado                         |
| ------------------- | --------------------------------------------------------- | --------------------------------- |
| `calcTDEE`          | Mifflin-St Jeor × factor actividad                        | Calorías de mantenimiento         |
| `calcMacros`        | Distribución por objetivo (pérdida/mantenimiento/volumen) | Proteína, carbos, grasa en gramos |
| `estimateBF`        | Deurenberg BMI-based                                      | % grasa corporal estimado         |
| `calcCalorieTarget` | TDEE ± déficit/superávit                                  | Objetivo calórico diario          |
| `calcProteinPerKg`  | 1.6–2.2g/kg según objetivo                                | Proteína objetivo                 |

---

## Pantallas

| Pantalla   | Ruta              | Descripción                                         |
| ---------- | ----------------- | --------------------------------------------------- |
| Welcome    | `/welcome`        | Landing con CTA "Comenzar" e "Iniciar sesión"       |
| Login      | `/login`          | Formulario de acceso                                |
| Registro   | `/register`       | Crear cuenta                                        |
| Onboarding | `/onboarding`     | Datos personales + objetivo + plan semanal          |
| Home       | `/(tabs)/index`   | Resumen del día: calorías, macros, cuerpo, progreso |
| Nutrición  | `/(tabs)/macros`  | Log de comidas, buscador, añadir manualmente        |
| Cuerpo     | `/(tabs)/body`    | Historial de peso/BF, gráfico SVG, composición      |
| Plan       | `/(tabs)/planner` | Calendario semanal de entrenamientos                |
| Mis Datos  | `/(tabs)/profile` | Perfil completo, metas, banner Pro                  |
| Paywall    | `/paywall`        | Planes de suscripción con trial de 7 días           |

---

## Convenciones de UI

- Tema **oscuro único** — nunca light theme
- `paddingTop: 58` para safe area (sin SafeAreaView)
- Colores siempre desde `colors.*` — nunca hex hardcodeado
- `TouchableOpacity` para todos los taps
- Border radius: 22 tarjetas · 16 botones · 14 elementos secundarios
- Font weight: 800 títulos · 700 labels · 600 secundario · 500 cuerpo

---

## Monetización

| Plan    | Precio       | Trial         |
| ------- | ------------ | ------------- |
| Mensual | $6.99 / mes  | 7 días gratis |
| Anual   | $39.99 / año | 7 días gratis |

El flag `isPremium` en el store controla el acceso a funciones Pro.
La integración real con RevenueCat (IAP) está en el roadmap.

---

## Roadmap

### P0 — Antes del lanzamiento

- [ ] **RevenueCat** — pagos reales iOS + Android (reemplaza mock `setPremium`)
- [ ] **Supabase Auth** — login/registro real
- [ ] **Reset de comidas a medianoche** — `todayMeals` debe limpiarse automáticamente

### P1 — Diferenciadores core

- [ ] **Escáner de alimentos con IA** — cámara → Claude Vision → macros automáticos (Pro)
- [ ] **Coaching personalizado con IA** — tips generados por Claude según perfil del usuario (Pro)
- [ ] **Tracker de ayuno intermitente** — timer última/próxima comida con notificaciones

### P2 — Crecimiento y retención

- [ ] **Notificaciones push** — recordatorios de comidas, alertas de racha
- [ ] **Tracker de agua** — registro de ingesta con objetivo diario
- [ ] **Escáner de código de barras** — Open Food Facts API
- [ ] **Racha de hábitos** — días consecutivos registrados
- [ ] **App Store listing** — keywords: "contar calorias", "dieta", "bajar de peso", "ayuno intermitente"

### P3 — Nice to have

- [ ] **Exportar datos** — reporte CSV/PDF de progreso corporal
- [ ] **Apple Health / Google Fit** sync
- [ ] **Variantes regionales** — slang México vs España vs Argentina

---
