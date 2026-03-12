import { SAMPLE_MEALS } from '@/constants/data';
import { supabase } from '@/utils/supabase';

export type FoodSource = 'local' | 'db' | 'ai';

export interface FoodResult {
  name: string;
  cal: number;
  p: number;
  c: number;
  f: number;
  source: FoodSource;
}

/**
 * Cascading food search:
 * 1. Local SAMPLE_MEALS (instant, offline)
 * 2. Supabase foods table (shared AI cache)
 * 3. Claude AI via Edge Function (estimates + saves to DB)
 */
export async function searchFood(query: string): Promise<FoodResult[]> {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return [];

  // 1. Local search — instant
  const local = SAMPLE_MEALS.filter((m) =>
    m.name.toLowerCase().includes(q)
  );
  if (local.length > 0) {
    return local.map((m) => ({ ...m, source: 'local' as FoodSource }));
  }

  // 2. Supabase foods table
  const { data: dbResults } = await supabase
    .from('foods')
    .select('name, cal, p, c, f')
    .ilike('name', `%${q}%`)
    .limit(5);

  if (dbResults && dbResults.length > 0) {
    return dbResults.map((m) => ({ ...m, source: 'db' as FoodSource }));
  }

  // 3. Claude AI via Edge Function
  const { data, error } = await supabase.functions.invoke('estimate-macros', {
    body: { query },
  });

  if (error || !data) throw error ?? new Error('No response from AI');

  return [{
    name: data.name,
    cal: Math.round(data.cal),
    p: Number(data.p),
    c: Number(data.c),
    f: Number(data.f),
    source: 'ai' as FoodSource,
  }];
}
