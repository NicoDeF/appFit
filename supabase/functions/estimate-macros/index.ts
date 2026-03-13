import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js';

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FoodMacro {
  name: string;
  cal: number;
  p: number;
  c: number;
  f: number;
}

function isValidMacro(m: any): m is FoodMacro {
  return m && typeof m.name === 'string' && m.cal !== undefined && m.p !== undefined;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return Response.json({ error: 'query is required' }, { status: 400, headers: corsHeaders });
    }

    const q = query.trim().toLowerCase();

    // 1. Check foods table cache
    try {
      const { data: existing, error: dbError } = await supabase
        .from('foods')
        .select('name, cal, p, c, f')
        .ilike('name', `%${q}%`)
        .limit(5);

      if (!dbError && existing && existing.length > 0) {
        return Response.json(existing, { headers: corsHeaders });
      }
    } catch {
      // foods table not created yet — continue to Claude
    }

    // 2. Ask Claude — handles single food or multiple foods
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: `Eres un experto en nutricion. El usuario puede mencionar uno o varios alimentos.
- Si es UN alimento: responde con un JSON objeto: {"name":"...","cal":0,"p":0,"c":0,"f":0}
- Si son VARIOS alimentos: responde con un JSON array: [{"name":"...","cal":0,"p":0,"c":0,"f":0}, ...]
Cada item: name (string en espanol), cal (kcal integer), p (proteina number), c (carbos number), f (grasa number).
Sin explicacion, sin markdown, solo el JSON.`,
      messages: [{ role: 'user', content: query }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '';

    // Strip markdown code fences
    const clean = text
      .replace(/^```json?\s*/im, '')
      .replace(/```\s*$/im, '')
      .trim();

    const parsed = JSON.parse(clean);

    // Normalize to always be an array
    const items: FoodMacro[] = Array.isArray(parsed) ? parsed : [parsed];
    const valid = items.filter(isValidMacro).map((m) => ({
      name: m.name,
      cal: Math.round(Number(m.cal)),
      p: Number(m.p) || 0,
      c: Number(m.c) || 0,
      f: Number(m.f) || 0,
    }));

    if (valid.length === 0) throw new Error('No valid macros in Claude response');

    // 3. Save to foods table (best-effort)
    try {
      await supabase.from('foods').insert(
        valid.map((m) => ({ ...m, source: 'claude' }))
      );
    } catch {
      // foods table not created yet — ignore
    }

    // Return array always
    return Response.json(valid, { headers: corsHeaders });

  } catch (err) {
    console.error('estimate-macros error:', err);
    return Response.json({ error: 'Error estimating macros' }, { status: 500, headers: corsHeaders });
  }
});
