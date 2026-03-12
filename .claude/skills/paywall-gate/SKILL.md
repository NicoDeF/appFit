---
name: paywall-gate
description: Gate a feature behind the isPremium flag in the Zustand store. Adds a paywall prompt/banner when the user is not premium. Use when implementing premium-only features.
argument-hint: [file-path] [feature-description]
---

# paywall-gate

Wrap a feature or section behind the `isPremium` flag and show a paywall CTA when the user is not subscribed.

## How isPremium works
- `isPremium` lives in `useAppStore`
- `setPremium(true)` unlocks everything (currently mock — RevenueCat not yet integrated)
- Paywall screen is at `app/paywall.tsx`, navigate via `router.push('/paywall')`

## Gate patterns

### Pattern A — Block full screen access
```tsx
const { isPremium } = useAppStore();
const router = useRouter();

if (!isPremium) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 12 }}>
        Función Premium
      </Text>
      <Text style={{ fontSize: 15, color: colors.textMuted, textAlign: 'center', marginBottom: 32 }}>
        Actualiza tu plan para acceder a esta función.
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/paywall')}
        style={{ backgroundColor: colors.accent, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 32 }}
      >
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>Ver planes Pro</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Pattern B — Lock a section within a screen (banner overlay)
```tsx
{!isPremium && (
  <TouchableOpacity
    onPress={() => router.push('/paywall')}
    style={{
      marginHorizontal: 16, marginTop: 12,
      backgroundColor: colors.accentSoft, borderRadius: 22,
      borderWidth: 1, borderColor: colors.accent,
      padding: 20, alignItems: 'center', gap: 8
    }}
  >
    <Text style={{ fontSize: 15, fontWeight: '800', color: colors.accent }}>Pro</Text>
    <Text style={{ fontSize: 13, color: colors.text, fontWeight: '600', textAlign: 'center' }}>
      Desbloquea esta función con Pro
    </Text>
    <Text style={{ fontSize: 12, color: colors.textMuted }}>Toca para ver planes →</Text>
  </TouchableOpacity>
)}

{isPremium && (
  // actual premium feature here
)}
```

### Pattern C — Disable a button / show lock icon
```tsx
<TouchableOpacity
  onPress={() => isPremium ? doAction() : router.push('/paywall')}
  style={{ opacity: isPremium ? 1 : 0.5, ... }}
>
  <Text>...</Text>
  {!isPremium && <Text style={{ color: colors.accent }}>🔒</Text>}
</TouchableOpacity>
```

## Rules

- Always use `TouchableOpacity` for the CTA, never `Btn`
- CTA text in Spanish
- Route to `/paywall` via `router.push('/paywall')`
- Import `useRouter` from `expo-router`
- Never import from `@/components/ui/Btn`
- Use `colors.accent` for premium highlights (red), `colors.accentSoft` for soft backgrounds

## Steps

1. Read the target file from $ARGUMENTS
2. Identify the feature or section to gate
3. Pull `isPremium` from `useAppStore` (add to existing destructure if already present)
4. Add `useRouter` import from `expo-router` if not already imported
5. Choose the appropriate pattern (A, B, or C) based on what's being gated
6. Implement the gate with Spanish UI text
7. Show a summary of changes
