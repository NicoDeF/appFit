import { supabase } from './supabase';
import type { Profile, BodyEntry, WeekDay, Language } from '@/store/useAppStore';
import type { UnitSystem } from '@/utils/units';

export async function syncProfile(
  userId: string,
  profile: Profile,
  unitSystem: UnitSystem,
  language: Language,
) {
  await supabase.from('profiles').upsert({
    user_id: userId,
    weight: profile.weight,
    target_weight: profile.targetWeight,
    height: profile.height,
    age: profile.age,
    gender: profile.gender,
    activity_level: profile.activityLevel,
    goal: profile.goal,
    tdee: profile.tdee,
    body_fat: profile.bodyFat,
    target_bf: profile.targetBf,
    protein_per_kg: profile.proteinPerKg,
    unit_system: unitSystem,
    language,
    updated_at: new Date().toISOString(),
  });
}

export async function syncWeeklyPlan(userId: string, plan: WeekDay[]) {
  await supabase.from('weekly_plans').upsert({
    user_id: userId,
    plan,
    updated_at: new Date().toISOString(),
  });
}

export async function syncBodyEntry(userId: string, entry: BodyEntry) {
  await supabase.from('body_log').upsert({
    user_id: userId,
    date: entry.date,
    weight: entry.weight,
    bf: entry.bf,
    waist: entry.waist,
  }, { onConflict: 'user_id,date' });
}

export interface RemoteUserData {
  profile: (Partial<Profile> & { unitSystem?: UnitSystem; language?: Language }) | null;
  weeklyPlan: WeekDay[] | null;
  bodyLog: BodyEntry[];
}

export async function loadUserData(userId: string): Promise<RemoteUserData> {
  const [profileRes, planRes, bodyRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', userId).single(),
    supabase.from('weekly_plans').select('*').eq('user_id', userId).single(),
    supabase.from('body_log').select('*').eq('user_id', userId).order('date', { ascending: true }),
  ]);

  const raw = profileRes.data;
  const profile = raw ? {
    weight: raw.weight,
    targetWeight: raw.target_weight,
    height: raw.height,
    age: raw.age,
    gender: raw.gender,
    activityLevel: raw.activity_level,
    goal: raw.goal,
    tdee: raw.tdee,
    bodyFat: raw.body_fat,
    targetBf: raw.target_bf,
    proteinPerKg: raw.protein_per_kg,
    unitSystem: raw.unit_system as UnitSystem,
    language: raw.language as Language,
  } : null;

  const weeklyPlan: WeekDay[] | null = planRes.data?.plan ?? null;

  const bodyLog: BodyEntry[] = (bodyRes.data ?? []).map((r: any) => ({
    date: r.date,
    weight: r.weight,
    bf: r.bf,
    waist: r.waist,
  }));

  return { profile, weeklyPlan, bodyLog };
}
