export const TRAINING_TYPES = [
  { id: 'upper', label: 'Upper Body', emoji: '💪', carbMod: 1.0, calMod: 1.0 },
  { id: 'lower', label: 'Lower Body', emoji: '🦵', carbMod: 1.15, calMod: 1.05 },
  { id: 'football', label: 'Football', emoji: '⚽', carbMod: 1.25, calMod: 1.15 },
  { id: 'cardio', label: 'Cardio', emoji: '🏃', carbMod: 0.9, calMod: 1.0 },
  { id: 'rest', label: 'Rest', emoji: '😴', carbMod: 0.7, calMod: 0.85 },
];

export const WEEKLY_PLAN = [
  { day: 'Monday', type: 'upper' },
  { day: 'Tuesday', type: 'lower' },
  { day: 'Wednesday', type: 'football' },
  { day: 'Thursday', type: 'upper' },
  { day: 'Friday', type: 'lower' },
  { day: 'Saturday', type: 'football' },
  { day: 'Sunday', type: 'rest' },
];


export const DEFAULT_PROFILE = {
  weight: 80,
  targetWeight: 75,
  height: 175,
  age: 25,
  gender: 'male' as 'male' | 'female',
  activityLevel: 'moderate' as 'sedentary' | 'light' | 'moderate' | 'active',
  goal: 'recomp' as 'cut' | 'bulk' | 'recomp',
  // calculated by app
  tdee: 2600,
  bodyFat: 20,
  targetBf: 15,
  proteinPerKg: 2.2,
};

export const SAMPLE_BODY_LOG = [
  { date: '2025-02-01', weight: 89.2, bf: 19.5, waist: 88 },
  { date: '2025-02-15', weight: 88.8, bf: 19.0, waist: 87 },
  { date: '2025-03-01', weight: 88.3, bf: 18.5, waist: 86.5 },
  { date: '2025-03-15', weight: 87.9, bf: 18.2, waist: 86 },
  { date: '2025-04-01', weight: 87.5, bf: 18.0, waist: 85.5 },
];
