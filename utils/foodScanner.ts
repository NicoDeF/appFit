export type ScanResult = {
  name: string;
  cal: number;
  p: number;
  c: number;
  f: number;
  portion: string;
};

/** Opens camera or gallery and returns a base64-encoded JPEG (max 800px). */
export async function pickAndResizeImage(source: 'camera' | 'gallery'): Promise<string | null> {
  // expo-image-picker requires a native/development build — not available in Expo Go
  let ImagePicker: typeof import('expo-image-picker');
  let ImageManipulator: typeof import('expo-image-manipulator');
  try {
    ImagePicker = require('expo-image-picker');
    ImageManipulator = require('expo-image-manipulator');
  } catch {
    throw new Error('REQUIRES_NATIVE_BUILD');
  }

  const permResult =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permResult.granted) return null;

  const picked =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync({ base64: false, quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ base64: false, quality: 0.8, mediaTypes: 'images' as any });

  if (picked.canceled || !picked.assets?.[0]?.uri) return null;

  const resized = await ImageManipulator.manipulateAsync(
    picked.assets[0].uri,
    [{ resize: { width: 800 } }],
    { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );

  return resized.base64 ?? null;
}

/** Sends a base64 image to Claude Vision and returns parsed food macros. */
export async function scanFoodImage(base64: string): Promise<ScanResult | null> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('[FoodScanner] EXPO_PUBLIC_ANTHROPIC_API_KEY not set');
    return null;
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: base64 },
            },
            {
              type: 'text',
              text: `Eres un nutricionista experto. Analiza el alimento en la imagen y responde ÚNICAMENTE con un JSON válido, sin texto adicional, en este formato exacto:
{"name":"nombre del alimento en español","cal":000,"p":00,"c":00,"f":00,"portion":"100g"}

Reglas:
- name: nombre descriptivo en español (ej: "Pollo a la plancha", "Taco de carne")
- cal: calorías totales (número entero)
- p: proteínas en gramos (número entero)
- c: carbohidratos en gramos (número entero)
- f: grasas en gramos (número entero)
- portion: porción estimada visible en la imagen

Si no puedes identificar ningún alimento, responde exactamente: {"error":"no_food"}`,
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    console.warn('[FoodScanner] API error', res.status);
    return null;
  }

  const data = await res.json();
  const text: string = data?.content?.[0]?.text ?? '';

  try {
    const parsed = JSON.parse(text.trim());
    if (parsed.error) return null;
    return {
      name: String(parsed.name ?? 'Alimento escaneado'),
      cal: Math.round(Number(parsed.cal) || 0),
      p: Math.round(Number(parsed.p) || 0),
      c: Math.round(Number(parsed.c) || 0),
      f: Math.round(Number(parsed.f) || 0),
      portion: String(parsed.portion ?? ''),
    };
  } catch {
    return null;
  }
}
