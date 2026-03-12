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

    // 1. Check if we already have it in the foods table
    const { data: existing } = await supabase
      .from('foods')
      .select('name, cal, p, c, f')
      .ilike('name', `%${q}%`)
      .limit(1)
      .maybeSingle();

    if (existing) {
      // Bump search count
      await supabase
        .from('foods')
        .update({ search_count: supabase.rpc('search_count + 1') })
        .ilike('name', `%${q}%`);

      return Response.json(existing, { headers: corsHeaders });
    }

    // 2. Ask Claude to estimate macros
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      system: `Eres un experto en nutrición. Cuando el usuario mencione un alimento, responde ÚNICAMENTE con un objeto JSON con estas claves exactas:
- name: string (nombre del alimento en español, tal como lo conocen en Latinoamérica)
- cal: integer (kcal por porción típica)
- p: number (gramos de proteína, un decimal)
- c: number (gramos de carbohidratos, un decimal)
- f: number (gramos de grasa, un decimal)

No incluyas explicación, markdown, ni nada más. Solo el JSON.`,
      messages: [{ role: 'user', content: query }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '';

    // Strip markdown code fences if Claude adds them
    const clean = text.replace(/^```json?\s*/i, '').replace(/```$/i, '').trim();
    const macros = JSON.parse(clean);

    // Validate the shape before saving
    if (!macros.name || !macros.cal || macros.p === undefined) {
      throw new Error('Unexpected Claude response shape');
    }

    // 3. Save to foods table for future searches
    await supabase.from('foods').insert({
      name: macros.name,
      cal: Math.round(macros.cal),
      p: Number(macros.p),
      c: Number(macros.c),
      f: Number(macros.f),
      source: 'claude',
    });

    return Response.json(macros, { headers: corsHeaders });
  } catch (err) {
    console.error('estimate-macros error:', err);
    return Response.json({ error: 'Error estimating macros' }, { status: 500, headers: corsHeaders });
  }
});
