---
name: add-meal
description: Add a new food entry to SAMPLE_MEALS in constants/data.ts. Use when the user wants to add a food, dish, or ingredient to the app's food database.
argument-hint: [food-name] [calories] [protein] [carbs] [fat]
---

# add-meal

Add a new food to `SAMPLE_MEALS` in `constants/data.ts`.

## Rules

- Food names MUST be in Spanish or the local name used in Latin America / Spain
- No English-only food names (e.g. use "Pechuga de pollo" not "Chicken breast")
- Macros per 100g or per typical serving (be consistent with existing entries)
- `id` must be unique — check the highest existing id and increment
- `cal` = total kcal, `p` = protein (g), `c` = carbs (g), `f` = fat (g)

## Entry format

```ts
{ id: <next_id>, name: '<Spanish name>', cal: <kcal>, p: <protein>, c: <carbs>, f: <fat> }
```

## Steps

1. Read `constants/data.ts` to find the current SAMPLE_MEALS array and the highest `id`
2. Parse the food name and macros from $ARGUMENTS (or ask the user if not provided)
3. Validate the macros make sense: cal ≈ (p * 4) + (c * 4) + (f * 9) ± rounding
4. Add the new entry at the end of the SAMPLE_MEALS array with the next available id
5. Confirm the entry was added and show the final object
