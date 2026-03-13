import { supabase } from '@/utils/supabase';

export type FoodSource = 'db' | 'ai';

export interface FoodResult {
  name: string;
  cal: number;
  p: number;
  c: number;
  f: number;
  source: FoodSource;
}

/**
 * Food search:
 * 1. Supabase foods table (cache de búsquedas previas)
 * 2. Claude AI via Edge Function si no hay resultados en DB
 */
export async function searchFood(query: string): Promise<FoodResult[]> {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return [];

  // 1. Supabase foods table
  try {
    const { data, error } = await supabase
      .from('foods')
      .select('name, cal, p, c, f')
      .ilike('name', `%${q}%`)
      .limit(6);

    if (!error && data && data.length > 0) {
      return data.map((m) => ({ ...m, source: 'db' as FoodSource }));
    }
  } catch {
    // tabla no existe aún — continúa a AI
  }

  // 2. Claude AI via Edge Function
  try {
    const { data, error } = await supabase.functions.invoke('estimate-macros', {
      body: { query },
    });

    if (!error && data && Array.isArray(data) && data.length > 0) {
      return data.map((m: any) => ({
        name: m.name,
        cal: Math.round(m.cal),
        p: Number(m.p) || 0,
        c: Number(m.c) || 0,
        f: Number(m.f) || 0,
        source: 'ai' as FoodSource,
      }));
    }
  } catch {
    // Edge Function no disponible
  }

  return [];
}
