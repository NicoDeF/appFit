---
name: store-field
description: Add a new state field and/or action to the Zustand store in store/useAppStore.ts. Use when the user wants to persist new data or add new state to the app.
argument-hint: [field-name] [type] [description]
---

# store-field

Add a new field (and optionally an action) to `store/useAppStore.ts`.

## Store structure (current)
- `AppState` interface — defines all state shape and action signatures
- `create<AppState>()` call — provides initial values and action implementations
- `persist` middleware with `version` number and `migrate` function

## Rules

- Add the new field to the `AppState` interface with correct TypeScript type
- Add the initial value in the `create()` call
- If the field needs an action (setter/updater), add it to both the interface and the implementation
- If the field should be persisted across app restarts, it's automatic (everything is persisted)
- If the field should NOT be persisted, note that and use a separate non-persisted store or `zustand` without persist
- Bump the `version` number by 1 after adding the field
- Add a migration case for the new version that sets a default value for existing users

## Action naming conventions
- Simple setters: `set[FieldName]`
- Array adders: `add[ItemName]`
- Array removers: `remove[ItemName]`
- Array clearers: `clear[FieldName]`
- Partial updaters: `update[FieldName]`

## Migration pattern
```ts
if (version < NEW_VERSION) {
  persisted.newField = persisted.newField ?? defaultValue;
}
```

## Steps

1. Read `store/useAppStore.ts` to understand current state and version
2. Parse $ARGUMENTS to determine field name, TypeScript type, and purpose
3. Add the field to `AppState` interface
4. Add initial value in the `create()` call
5. If an action is needed, add it to both interface and implementation
6. Bump `version` by 1
7. Add migration case for the new version
8. Show a summary of all changes made
