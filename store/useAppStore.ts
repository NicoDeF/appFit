import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_PROFILE, SAMPLE_BODY_LOG, WEEKLY_PLAN } from '@/constants/data';
import { Gender, ActivityLevel } from '@/utils/helpers';
import { UnitSystem } from '@/utils/units';

export type Goal = 'cut' | 'bulk' | 'recomp';
export type Language = 'es' | 'en';

export interface User {
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

export interface WeekDay {
  day: string;
  type: string;
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
  updateWeeklyPlan: (plan: WeekDay[]) => void;
  setLanguage: (lang: Language) => void;
  setUnitSystem: (system: UnitSystem) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      hasCompletedOnboarding: false,
      isPremium: false,
      profile: DEFAULT_PROFILE,
      trainingType: 'rest',
      todayMeals: [],
      lastMealDate: '',
      bodyLog: SAMPLE_BODY_LOG,
      weeklyPlan: WEEKLY_PLAN,
      language: 'es' as Language,
      unitSystem: 'metric' as UnitSystem,

      login: (user) => set({ isLoggedIn: true, user }),
      logout: () => set({
        isLoggedIn: false,
        user: null,
        isPremium: false,
        todayMeals: [],
        lastMealDate: '',
        profile: DEFAULT_PROFILE,
        bodyLog: SAMPLE_BODY_LOG,
        weeklyPlan: WEEKLY_PLAN,
        trainingType: 'rest',
      }),

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      setPremium: (value) => set({ isPremium: value }),

      updateProfile: (updates) =>
        set((state) => ({ profile: { ...state.profile, ...updates } })),

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

      addBodyEntry: (entry) =>
        set((state) => ({ bodyLog: [...state.bodyLog, entry] })),

      updateWeeklyPlan: (plan) => set({ weeklyPlan: plan }),
      setLanguage: (lang) => set({ language: lang }),
      setUnitSystem: (system) => set({ unitSystem: system }),
    }),
    {
      name: 'appfit-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 7,
      migrate: (persisted: any, version: number) => {
        if (version < 3) {
          persisted.isLoggedIn = persisted.isLoggedIn ?? true; // keep existing users logged in
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
          // Fix: logout used to reset hasCompletedOnboarding — restore it for existing users
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
        return persisted;
      },
    }
  )
);
