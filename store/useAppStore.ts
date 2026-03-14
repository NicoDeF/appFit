import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_PROFILE, WEEKLY_PLAN } from '@/constants/data';
import { Gender, ActivityLevel } from '@/utils/helpers';
import { UnitSystem } from '@/utils/units';
import { syncProfile, syncWeeklyPlan, syncBodyEntry } from '@/utils/userSync';

export type Goal = 'cut' | 'bulk' | 'recomp';
export type Language = 'es' | 'en';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Profile {
  weight: number;
  targetWeight: number;
  height: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: Goal;
  tdee: number;
  bodyFat: number;
  targetBf: number;
  proteinPerKg: number;
}

export interface Meal {
  id: number;
  name: string;
  cal: number;
  p: number;
  c: number;
  f: number;
  addedAt?: number;
}

export interface BodyEntry {
  date: string;
  weight: number;
  bf: number;
  waist: number;
}

export interface DayActivity {
  type: string;
  label?: string; // solo para type === 'custom'
}

export interface WeekDay {
  day: string;
  activities: DayActivity[];
}

interface AppState {
  // Auth
  isLoggedIn: boolean;
  user: User | null;
  // App state
  hasCompletedOnboarding: boolean;
  isPremium: boolean;
  profile: Profile;
  trainingType: string;
  todayMeals: Meal[];
  lastMealDate: string;
  bodyLog: BodyEntry[];
  weeklyPlan: WeekDay[];
  language: Language;
  unitSystem: UnitSystem;

  // Auth actions
  login: (user: User) => void;
  logout: () => void;
  // App actions
  completeOnboarding: () => void;
  setPremium: (value: boolean) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  setTrainingType: (type: string) => void;
  addMeal: (meal: Meal) => void;
  removeMeal: (index: number) => void;
  clearTodayMeals: () => void;
  resetMealsIfNewDay: () => void;
  addBodyEntry: (entry: BodyEntry) => void;
  setBodyLog: (entries: BodyEntry[]) => void;
  updateWeeklyPlan: (plan: WeekDay[]) => void;
  setLanguage: (lang: Language) => void;
  setUnitSystem: (system: UnitSystem) => void;
  hydrateUserData: (data: {
    profile?: Partial<Profile>;
    weeklyPlan?: WeekDay[];
    bodyLog?: BodyEntry[];
    unitSystem?: UnitSystem;
    language?: Language;
  }) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      hasCompletedOnboarding: false,
      isPremium: false,
      profile: DEFAULT_PROFILE,
      trainingType: 'rest',
      todayMeals: [],
      lastMealDate: '',
      bodyLog: [],
      weeklyPlan: WEEKLY_PLAN,
      language: 'es' as Language,
      unitSystem: 'metric' as UnitSystem,

      login: (user) => set({ isLoggedIn: true, user }),
      logout: () => set({
        isLoggedIn: false,
        user: null,
        isPremium: false,
      }),

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      setPremium: (value) => set({ isPremium: value }),

      updateProfile: (updates) => {
        set((state) => ({ profile: { ...state.profile, ...updates } }));
        const { user, profile, unitSystem, language } = get();
        if (user?.id) {
          syncProfile(user.id, { ...profile, ...updates }, unitSystem, language).catch(() => {});
        }
      },

      setTrainingType: (type) => set({ trainingType: type }),

      addMeal: (meal) =>
        set((state) => ({
          todayMeals: [...state.todayMeals, { ...meal, addedAt: Date.now() }],
        })),

      removeMeal: (index) =>
        set((state) => ({
          todayMeals: state.todayMeals.filter((_, i) => i !== index),
        })),

      clearTodayMeals: () => set({ todayMeals: [] }),

      resetMealsIfNewDay: () => {
        const today = new Date().toISOString().slice(0, 10);
        set((state) => {
          if (state.lastMealDate !== today) {
            return { todayMeals: [], lastMealDate: today };
          }
          return {};
        });
      },

      addBodyEntry: (entry) => {
        set((state) => ({ bodyLog: [...state.bodyLog, entry] }));
        const { user } = get();
        if (user?.id) {
          syncBodyEntry(user.id, entry).catch(() => {});
        }
      },

      setBodyLog: (entries) => set({ bodyLog: entries }),

      updateWeeklyPlan: (plan) => {
        set({ weeklyPlan: plan });
        const { user } = get();
        if (user?.id) {
          syncWeeklyPlan(user.id, plan).catch(() => {});
        }
      },

      setLanguage: (lang) => {
        set({ language: lang });
        const { user, profile, unitSystem } = get();
        if (user?.id) {
          syncProfile(user.id, profile, unitSystem, lang).catch(() => {});
        }
      },

      setUnitSystem: (system) => {
        set({ unitSystem: system });
        const { user, profile, language } = get();
        if (user?.id) {
          syncProfile(user.id, profile, system, language).catch(() => {});
        }
      },

      hydrateUserData: ({ profile, weeklyPlan, bodyLog, unitSystem, language }) => {
        set((state) => ({
          ...(profile ? { profile: { ...state.profile, ...profile } } : {}),
          ...(weeklyPlan ? { weeklyPlan } : {}),
          ...(bodyLog && bodyLog.length > 0 ? { bodyLog } : {}),
          ...(unitSystem ? { unitSystem } : {}),
          ...(language ? { language } : {}),
        }));
      },
    }),
    {
      name: 'appfit-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 9,
      migrate: (persisted: any, version: number) => {
        if (version < 3) {
          persisted.isLoggedIn = persisted.isLoggedIn ?? true;
          persisted.user = persisted.user ?? null;
          persisted.hasCompletedOnboarding = persisted.hasCompletedOnboarding ?? true;
          persisted.weeklyPlan = persisted.weeklyPlan ?? WEEKLY_PLAN;
          persisted.profile = {
            ...DEFAULT_PROFILE,
            ...persisted.profile,
            age: persisted.profile?.age ?? 25,
            gender: persisted.profile?.gender ?? 'male',
            activityLevel: persisted.profile?.activityLevel ?? 'moderate',
          };
        }
        if (version < 4) {
          persisted.hasCompletedOnboarding = true;
        }
        if (version < 5) {
          persisted.language = persisted.language ?? 'es';
        }
        if (version < 6) {
          persisted.lastMealDate = persisted.lastMealDate ?? '';
        }
        if (version < 7) {
          persisted.unitSystem = persisted.unitSystem ?? 'metric';
        }
        if (version < 8) {
          persisted.bodyLog = persisted.bodyLog ?? [];
        }
        if (version < 9) {
          // Migrate weeklyPlan from { day, type, label? } to { day, activities: [{type, label?}] }
          if (Array.isArray(persisted.weeklyPlan)) {
            persisted.weeklyPlan = persisted.weeklyPlan.map((entry: any) => {
              if (entry.activities) return entry;
              return {
                day: entry.day,
                activities: [{ type: entry.type ?? 'rest', ...(entry.label ? { label: entry.label } : {}) }],
              };
            });
          }
        }
        return persisted;
      },
    }
  )
);
