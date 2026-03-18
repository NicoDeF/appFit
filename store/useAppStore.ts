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

export interface FastEntry {
  startTime: number;
  endTime: number;
  goalHours: number;
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

  // Fasting
  fastingActive: boolean;
  fastingStartTime: number | null;
  fastingGoalHours: number;
  fastingHistory: FastEntry[];

  // Notifications
  notificationsEnabled: boolean;
  mealReminderHour: number;
  mealReminderMinute: number;

  // Streak
  currentStreak: number;
  longestStreak: number;
  streakDate: string; // ISO date of last day a meal was logged

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
  setNotificationsEnabled: (v: boolean) => void;
  setMealReminderTime: (hour: number, minute: number) => void;
  startFast: () => void;
  stopFast: () => void;
  setFastingGoal: (hours: number) => void;
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
      fastingActive: false,
      fastingStartTime: null,
      fastingGoalHours: 16,
      fastingHistory: [],
      notificationsEnabled: false,
      mealReminderHour: 13,
      mealReminderMinute: 0,
      currentStreak: 0,
      longestStreak: 0,
      streakDate: '',

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
        set((state) => {
          const newMeals = [...state.todayMeals, { ...meal, addedAt: Date.now() }];
          const today = new Date().toISOString().slice(0, 10);
          // Streak already counted today — just add the meal
          if (state.streakDate === today) return { todayMeals: newMeals };
          const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
          const newStreak = state.streakDate === yesterday ? state.currentStreak + 1 : 1;
          return {
            todayMeals: newMeals,
            currentStreak: newStreak,
            longestStreak: Math.max(state.longestStreak, newStreak),
            streakDate: today,
          };
        }),

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

      setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),
      setMealReminderTime: (hour, minute) => set({ mealReminderHour: hour, mealReminderMinute: minute }),

      startFast: () => set({ fastingActive: true, fastingStartTime: Date.now() }),

      stopFast: () => {
        const { fastingStartTime, fastingGoalHours, fastingHistory } = get();
        if (fastingStartTime) {
          const entry: FastEntry = { startTime: fastingStartTime, endTime: Date.now(), goalHours: fastingGoalHours };
          set({ fastingActive: false, fastingStartTime: null, fastingHistory: [entry, ...fastingHistory].slice(0, 20) });
        } else {
          set({ fastingActive: false, fastingStartTime: null });
        }
      },

      setFastingGoal: (hours) => set({ fastingGoalHours: hours }),

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
      version: 12,
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
        if (version < 10) {
          persisted.fastingActive = false;
          persisted.fastingStartTime = null;
          persisted.fastingGoalHours = 16;
          persisted.fastingHistory = [];
        }
        if (version < 11) {
          persisted.notificationsEnabled = false;
          persisted.mealReminderHour = 13;
          persisted.mealReminderMinute = 0;
        }
        if (version < 12) {
          persisted.currentStreak = 0;
          persisted.longestStreak = 0;
          persisted.streakDate = '';
        }
        return persisted;
      },
    }
  )
);
