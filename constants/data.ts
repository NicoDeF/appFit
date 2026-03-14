export type TrainingCategory = 'gym' | 'sport' | 'cardio' | 'other' | 'rest' | 'custom';

export const TRAINING_TYPES = [
  // Gym — splits
  { id: 'push',     label: 'Push',           category: 'gym'    as TrainingCategory, calMod: 1.0,  carbMod: 1.0  },
  { id: 'pull',     label: 'Pull',           category: 'gym'    as TrainingCategory, calMod: 1.0,  carbMod: 1.0  },
  { id: 'legs',     label: 'Piernas',        category: 'gym'    as TrainingCategory, calMod: 1.05, carbMod: 1.15 },
  { id: 'upper',    label: 'Tren Superior',  category: 'gym'    as TrainingCategory, calMod: 1.0,  carbMod: 1.0  },
  { id: 'lower',    label: 'Tren Inferior',  category: 'gym'    as TrainingCategory, calMod: 1.05, carbMod: 1.1  },
  { id: 'fullbody', label: 'Full Body',      category: 'gym'    as TrainingCategory, calMod: 1.05, carbMod: 1.1  },
  // Sport
  { id: 'football',   label: 'Fútbol',      category: 'sport'  as TrainingCategory, calMod: 1.15, carbMod: 1.25 },
  { id: 'basketball', label: 'Basketball',  category: 'sport'  as TrainingCategory, calMod: 1.1,  carbMod: 1.2  },
  { id: 'tennis',     label: 'Tenis',       category: 'sport'  as TrainingCategory, calMod: 1.1,  carbMod: 1.15 },
  { id: 'boxing',     label: 'Boxeo',       category: 'sport'  as TrainingCategory, calMod: 1.15, carbMod: 1.15 },
  // Cardio
  { id: 'running',  label: 'Running',       category: 'cardio' as TrainingCategory, calMod: 1.05, carbMod: 0.95 },
  { id: 'cycling',  label: 'Ciclismo',      category: 'cardio' as TrainingCategory, calMod: 1.05, carbMod: 0.95 },
  { id: 'swimming', label: 'Natación',      category: 'cardio' as TrainingCategory, calMod: 1.1,  carbMod: 1.0  },
  { id: 'hiit',     label: 'HIIT',          category: 'cardio' as TrainingCategory, calMod: 1.1,  carbMod: 1.0  },
  { id: 'cardio',   label: 'Cardio',        category: 'cardio' as TrainingCategory, calMod: 1.0,  carbMod: 0.9  },
  // Otro
  { id: 'yoga',     label: 'Yoga / Movilidad', category: 'other' as TrainingCategory, calMod: 0.9, carbMod: 0.9 },
  { id: 'rest',     label: 'Descanso',      category: 'rest'   as TrainingCategory, calMod: 0.85, carbMod: 0.7  },
  { id: 'custom',   label: 'Personalizado', category: 'custom' as TrainingCategory, calMod: 1.0,  carbMod: 1.0  },
];

export const WEEKLY_PLAN = [
  { day: 'Monday',    activities: [{ type: 'upper' }] },
  { day: 'Tuesday',   activities: [{ type: 'lower' }] },
  { day: 'Wednesday', activities: [{ type: 'football' }] },
  { day: 'Thursday',  activities: [{ type: 'upper' }] },
  { day: 'Friday',    activities: [{ type: 'lower' }] },
  { day: 'Saturday',  activities: [{ type: 'football' }] },
  { day: 'Sunday',    activities: [{ type: 'rest' }] },
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
