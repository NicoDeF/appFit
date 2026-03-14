export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';

export const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Not very active', desc: 'Desk job, little or no exercise', emoji: '🪑' },
  { id: 'light',     label: 'Lightly active',  desc: 'Light exercise 1–3 days/week',   emoji: '🚶' },
  { id: 'moderate',  label: 'Moderately active', desc: 'Exercise 3–5 days/week',        emoji: '🏃' },
  { id: 'active',    label: 'Very active',     desc: 'Hard exercise 6–7 days/week',    emoji: '⚡' },
] as const;

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

export const GOALS = [
  { id: 'cut',    label: 'Lose fat',             desc: 'Reduce body fat while keeping muscle', emoji: '🔥' },
  { id: 'bulk',   label: 'Build muscle',          desc: 'Gain strength and muscle mass',        emoji: '💪' },
  { id: 'recomp', label: 'Lose fat & build muscle', desc: 'Transform your body composition',   emoji: '⚡' },
] as const;

// Mifflin-St Jeor BMR → multiply by activity factor
export const calcTDEE = (
  weight: number,
  height: number,
  age: number,
  gender: Gender,
  activity: ActivityLevel
): number => {
  const bmr =
    gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activity]);
};

// Deurenberg BMI-based BF% estimate
export const estimateBF = (
  weight: number,
  height: number,
  age: number,
  gender: Gender
): number => {
  const bmi = weight / Math.pow(height / 100, 2);
  const bf = 1.2 * bmi + 0.23 * age - 10.8 * (gender === 'male' ? 1 : 0) - 5.4;
  return +Math.max(5, Math.round(bf * 100) / 100).toFixed(2);
};

// Calorie target based on goal
export const calcCalorieTarget = (tdee: number, goal: string): number => {
  if (goal === 'cut') return Math.round(tdee - 400);
  if (goal === 'bulk') return Math.round(tdee + 250);
  return tdee;
};

// Protein target based on goal
export const calcProteinPerKg = (goal: string): number => {
  if (goal === 'cut') return 2.4;
  if (goal === 'bulk') return 2.0;
  return 2.2;
};

export const formatNum = (n: number) => (Math.round(n * 10) / 10).toFixed(1);

export const today = () => new Date().toISOString().split('T')[0];

export const pct = (current: number, target: number, start: number) => {
  if (start === target) return 100;
  return Math.min(100, Math.max(0, ((start - current) / (start - target)) * 100));
};

export const calcMacros = (
  tdee: number,
  weight: number,
  proteinPerKg: number,
  calMod: number,
  carbMod: number
) => {
  const adjustedTdee = Math.round(tdee * calMod);
  const protein = Math.round(weight * proteinPerKg);
  const fat = Math.round((adjustedTdee * 0.25) / 9);
  const carbs = Math.round(((adjustedTdee - protein * 4 - fat * 9) / 4) * carbMod);
  return { adjustedTdee, protein, fat, carbs };
};
