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

export const SAMPLE_MEALS = [
  { id: 1, name: 'Avena + whey + platano', cal: 420, p: 35, c: 55, f: 8 },
  { id: 2, name: 'Pollo + arroz + verduras', cal: 520, p: 45, c: 50, f: 12 },
  { id: 3, name: 'Huevos revueltos + tostada', cal: 380, p: 28, c: 30, f: 18 },
  { id: 4, name: 'Ensalada de atun', cal: 320, p: 35, c: 15, f: 14 },
  { id: 5, name: 'Shake post-entreno', cal: 350, p: 40, c: 35, f: 5 },
  { id: 6, name: 'Carne + papa + ensalada', cal: 580, p: 48, c: 45, f: 18 },
  { id: 7, name: 'Yogur griego + fruta + granola', cal: 290, p: 20, c: 35, f: 8 },
  { id: 8, name: 'Pechuga al horno + ensalada', cal: 480, p: 38, c: 30, f: 20 },
  { id: 9, name: 'Tacos de pollo (x2)', cal: 410, p: 32, c: 38, f: 14 },
  { id: 10, name: 'Empanadas de carne (x2)', cal: 460, p: 22, c: 48, f: 18 },
  { id: 11, name: 'Arepa con pollo y aguacate', cal: 390, p: 28, c: 42, f: 12 },
  { id: 12, name: 'Lentejas con verduras', cal: 350, p: 18, c: 52, f: 6 },
  { id: 13, name: 'Tortilla espanola', cal: 310, p: 18, c: 22, f: 16 },
  { id: 14, name: 'Salmon a la plancha + quinoa', cal: 490, p: 42, c: 38, f: 16 },
  { id: 15, name: 'Cazuela de pollo con arroz', cal: 540, p: 44, c: 48, f: 14 },
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
