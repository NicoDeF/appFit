---
name: new-screen
description: Scaffold a new Expo screen for appFIT following project conventions. Use when the user asks to create a new screen, tab, or page.
argument-hint: [screen-name] [description]
---

# new-screen

Scaffold a new Expo screen at `app/$ARGUMENTS.tsx` following all appFIT conventions.

## Rules — always apply

- `paddingTop: 58` at the top container (never SafeAreaView)
- `marginHorizontal: 16` for cards, `paddingHorizontal: 22` for headers
- Border radius: 22 for cards, 16 for buttons, 14 for smaller elements
- Font weights: 800 titles, 700 labels, 600 secondary, 500 body
- `TouchableOpacity` for ALL taps — never `Btn` component
- Dark theme only — import `colors` from `@/constants/Colors`
- Never hardcode hex values — always use `colors.*` tokens
- Import store with `useAppStore` from `@/store/useAppStore`
- All UI text in Spanish (app targets Spanish-speaking market)
- No external navigation libraries — use `expo-router` only (`useRouter`, `Link`)

## Color tokens available
`bg`, `card`, `surface`, `border`, `accent`, `accentSoft`, `accentGlow`,
`green`, `greenSoft`, `blue`, `blueSoft`, `yellow`, `yellowSoft`,
`purple`, `purpleSoft`, `text`, `textMuted`, `textDim`

## Standard screen template

```tsx
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/Colors';
import { useAppStore } from '@/store/useAppStore';

export default function ScreenName() {
  const { profile, isPremium } = useAppStore();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 22, paddingTop: 58, paddingBottom: 16 }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.text }}>
          Título
        </Text>
        <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
          Subtítulo o descripción
        </Text>
      </View>

      {/* Card example */}
      <View style={{
        marginHorizontal: 16, backgroundColor: colors.card,
        borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 20
      }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>
          Contenido
        </Text>
      </View>
    </ScrollView>
  );
}
```

## Steps

1. Read the argument to determine the file path and screen purpose
2. Check if the screen needs to be registered in `app/_layout.tsx` (for non-tab screens)
3. Check if it's a new tab — if so, update `app/(tabs)/_layout.tsx` too
4. Write the screen file following the template above
5. If a new Stack screen, add it to the Stack in `app/_layout.tsx`
6. Confirm what was created and the navigation path to reach it
