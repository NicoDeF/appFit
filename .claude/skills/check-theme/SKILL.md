---
name: check-theme
description: Audit one or more screens for dark theme violations — hardcoded hex colors, missing color tokens, or incorrect spacing. Use when reviewing UI code for theme consistency.
argument-hint: [file-path or "all"]
---

# check-theme

Audit appFIT screens for dark theme and convention violations.

## What to check

### 1. Hardcoded colors (critical)
Flag any hex values, rgb/rgba literals, or color names that are NOT from `colors.*`:
- Bad: `color: '#fff'`, `backgroundColor: 'black'`, `borderColor: 'rgba(0,0,0,0.5)'`
- Good: `color: colors.text`, `backgroundColor: colors.bg`

### 2. Missing colors import
Check that `import { colors } from '@/constants/Colors'` is present if the file uses any color.

### 3. Spacing conventions
- Headers should use `paddingTop: 58` (not SafeAreaView, not other values)
- Cards: `marginHorizontal: 16`, border radius 22
- Headers: `paddingHorizontal: 22`

### 4. SafeAreaView usage (forbidden)
Flag any `SafeAreaView` import or usage — use `paddingTop: 58` instead.

### 5. Btn component usage (forbidden)
Flag any import or use of the `Btn` component — use `TouchableOpacity` instead.

### 6. Light theme references
Flag any `useColorScheme`, `light` theme references, or conditional light/dark logic.

## Color tokens reference
```
bg, card, surface, border,
accent, accentSoft, accentGlow,
green, greenSoft, blue, blueSoft,
yellow, yellowSoft, purple, purpleSoft,
text, textMuted, textDim
```

## Steps

1. If $ARGUMENTS is a file path, read that file. If "all" or empty, glob `app/**/*.tsx` and `components/**/*.tsx`
2. For each file, scan for each violation category above
3. Report findings grouped by file, with line numbers and suggested fix
4. If no violations found, confirm the file is clean
