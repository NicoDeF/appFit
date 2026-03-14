import { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { colors } from '@/constants/Colors';
import { useAppStore } from '@/store/useAppStore';
import { TRAINING_TYPES } from '@/constants/data';
import { MacroRing } from '@/components/ui/MacroRing';
import { MiniBar } from '@/components/ui/MiniBar';
import { calcMacros } from '@/utils/helpers';
import { searchFood, FoodResult } from '@/utils/foodSearch';
import { useT } from '@/constants/i18n';

type SearchStatus = 'idle' | 'searching' | 'ai' | 'done' | 'error';

export default function MacrosScreen() {
  const { profile, weeklyPlan, todayMeals, addMeal, removeMeal } = useAppStore();
  const t = useT();

  const [showCustom, setShowCustom] = useState(false);
  const [custom, setCustom] = useState({ name: '', cal: '', p: '', c: '', f: '' });

  // Search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodResult[]>([]);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derive today's training from the weekly plan (highest calMod wins)
  const todayIndex = (new Date().getDay() + 6) % 7;
  const todayActivities = weeklyPlan?.[todayIndex]?.activities ?? [{ type: 'rest' }];
  const REST = TRAINING_TYPES.find((t) => t.id === 'rest')!;
  const training = todayActivities
    .map((a) => TRAINING_TYPES.find((t) => t.id === a.type) ?? REST)
    .reduce((best, t) => t.calMod > best.calMod ? t : best, REST);
  const todayTrainingLabel = todayActivities
    .map((a) => a.type === 'custom' ? (a.label || 'Personalizado') : (TRAINING_TYPES.find((t) => t.id === a.type)?.label ?? a.type))
    .join(' · ');

  const { adjustedTdee, protein, fat, carbs } = calcMacros(
    profile.tdee,
    profile.weight,
    profile.proteinPerKg,
    training.calMod,
    training.carbMod
  );

  const totals = todayMeals.reduce(
    (acc, m) => ({ cal: acc.cal + m.cal, p: acc.p + m.p, c: acc.c + m.c, f: acc.f + m.f }),
    { cal: 0, p: 0, c: 0, f: 0 }
  );

  const remaining = Math.max(0, adjustedTdee - totals.cal);
  const over = totals.cal > adjustedTdee;

  const SOURCE_LABEL: Record<string, { label: string; color: string }> = {
    db: { label: t.macros.sourceSaved, color: colors.blue },
    ai: { label: t.macros.sourceAI,   color: colors.accent },
  };

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query || query.trim().length < 2) {
      setResults([]);
      setStatus('idle');
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setStatus('searching');
      setResults([]);
      try {
        const aiTimer = setTimeout(() => setStatus('ai'), 400);
        const found = await searchFood(query);
        clearTimeout(aiTimer);
        setResults(found);
        setStatus('done');
      } catch {
        setStatus('error');
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleAddMeal = (meal: FoodResult) => {
    addMeal({ id: Date.now(), name: meal.name, cal: meal.cal, p: meal.p, c: meal.c, f: meal.f });
    setQuery('');
    setResults([]);
    setStatus('idle');
  };

  const handleAddCustom = () => {
    if (!custom.name || !custom.cal) return;
    addMeal({
      id: Date.now(),
      name: custom.name,
      cal: Number(custom.cal),
      p: Number(custom.p) || 0,
      c: Number(custom.c) || 0,
      f: Number(custom.f) || 0,
    });
    setCustom({ name: '', cal: '', p: '', c: '', f: '' });
    setShowCustom(false);
  };

  const inputStyle = {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 13,
    color: colors.text,
    fontSize: 14,
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 22, paddingTop: 58, paddingBottom: 8 }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.text }}>{t.macros.title}</Text>
        <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>{t.macros.subtitle}</Text>
      </View>

      {/* Today's training badge — derived from weekly plan */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 4, paddingTop: 8 }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: colors.card, borderRadius: 16,
          borderWidth: 1, borderColor: colors.border,
          paddingVertical: 12, paddingHorizontal: 16,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ gap: 2 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: colors.textDim }}>
                Entrenamiento hoy
              </Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>
                {todayTrainingLabel}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 2 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: colors.textDim }}>
              Objetivo ajustado
            </Text>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.accent }}>
              {adjustedTdee} kcal
            </Text>
          </View>
        </View>
      </View>

      {/* Calorie hero */}
      <View style={{ marginHorizontal: 16, backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 24, alignItems: 'center', gap: 6 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: colors.textMuted }}>
          {over ? t.macros.exceeded : t.macros.remaining}
        </Text>
        <Text style={{ fontSize: 56, fontWeight: '800', color: over ? colors.accent : colors.text, lineHeight: 64 }}>
          {remaining}
        </Text>
        <Text style={{ fontSize: 13, color: colors.textMuted }}>
          {t.macros.ofTarget.replace('{n}', String(adjustedTdee))}
        </Text>
        <View style={{ width: '100%', marginTop: 12, gap: 6 }}>
          <MiniBar value={totals.cal} max={adjustedTdee} color={over ? colors.accent : colors.green} height={8} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 11, color: colors.textMuted }}>{totals.cal} {t.macros.eaten}</Text>
            <Text style={{ fontSize: 11, color: colors.textMuted }}>{adjustedTdee} {t.macros.ofTarget.split(' ').pop()}</Text>
          </View>
        </View>
      </View>

      {/* Macro rings */}
      <View style={{
        flexDirection: 'row', justifyContent: 'space-around',
        marginHorizontal: 16, marginTop: 12,
        backgroundColor: colors.card, borderRadius: 22,
        borderWidth: 1, borderColor: colors.border,
        paddingVertical: 22,
      }}>
        <MacroRing label={t.home.protein} current={totals.p} target={protein} color={colors.accent} />
        <MacroRing label={t.home.carbs} current={totals.c} target={carbs} color={colors.blue} />
        <MacroRing label={t.home.fat} current={totals.f} target={fat} color={colors.yellow} />
      </View>

      {/* Today's meals */}
      <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, paddingBottom: 14 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>{t.macros.todayMeals}</Text>
          <View style={{ backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 }}>
            <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '600' }}>{todayMeals.length} {t.macros.items}</Text>
          </View>
        </View>

        {todayMeals.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 32 }}>
            <Text style={{ fontSize: 28, marginBottom: 8 }}>🍽</Text>
            <Text style={{ fontSize: 14, color: colors.textMuted }}>{t.macros.noMeals}</Text>
            <Text style={{ fontSize: 12, color: colors.textDim, marginTop: 4 }}>{t.macros.searchBelow}</Text>
          </View>
        ) : (
          todayMeals.map((m, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row', alignItems: 'center',
                paddingHorizontal: 18, paddingVertical: 15,
                borderTopWidth: 1, borderTopColor: colors.border,
              }}
            >
              <View style={{
                width: 38, height: 38, borderRadius: 10,
                backgroundColor: colors.surface,
                alignItems: 'center', justifyContent: 'center',
                marginRight: 12,
              }}>
                <Text style={{ fontSize: 18 }}>🍽</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{m.name}</Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                  P: {m.p}g · C: {m.c}g · G: {m.f}g
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.green }}>{m.cal}</Text>
                <TouchableOpacity onPress={() => removeMeal(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={{ fontSize: 20, color: colors.textDim, lineHeight: 22 }}>×</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Smart food search */}
      <View style={{ marginHorizontal: 16, marginTop: 12 }}>
        {/* Search input */}
        <View style={{
          backgroundColor: colors.card, borderRadius: 18,
          borderWidth: 1, borderColor: colors.border, padding: 16,
        }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
            {t.macros.searchLabel}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TextInput
              style={[inputStyle, { flex: 1 }]}
              placeholder={t.macros.searchPlaceholder}
              placeholderTextColor={colors.textDim}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              autoCorrect={false}
            />
            {(status === 'searching' || status === 'ai') && (
              <ActivityIndicator color={colors.accent} size="small" />
            )}
            {query.length > 0 && status === 'idle' && (
              <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setStatus('idle'); }}>
                <Text style={{ fontSize: 18, color: colors.textDim }}>×</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* AI status label */}
          {status === 'ai' && (
            <Text style={{ fontSize: 12, color: colors.purple, marginTop: 8, fontWeight: '600' }}>
              {t.macros.estimating}
            </Text>
          )}
          {status === 'error' && (
            <Text style={{ fontSize: 12, color: colors.accent, marginTop: 8 }}>
              {t.macros.searchError}
            </Text>
          )}
        </View>

        {/* Search results */}
        {results.length > 0 && (
          <View style={{ backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginTop: 4 }}>
            {results.map((item, i) => {
              const src = SOURCE_LABEL[item.source] ?? { label: item.source, color: colors.textMuted };
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleAddMeal(item)}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    paddingHorizontal: 16, paddingVertical: 14,
                    borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{item.name}</Text>
                      <View style={{ backgroundColor: `${src.color}20`, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: src.color }}>{src.label}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 12, color: colors.textMuted }}>
                      P: {item.p}g · C: {item.c}g · G: {item.f}g
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={{ fontSize: 13, color: colors.textMuted }}>{item.cal} kcal</Text>
                    <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 18, color: colors.green, fontWeight: '700', lineHeight: 22 }}>+</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* No results found */}
        {status === 'done' && results.length === 0 && (
          <View style={{ backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 20, marginTop: 4, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: colors.textMuted }}>{t.macros.noResults.replace('{q}', query)}</Text>
          </View>
        )}

        {/* Custom meal */}
        <TouchableOpacity
          onPress={() => setShowCustom(!showCustom)}
          style={{
            marginTop: 8, backgroundColor: colors.card, borderRadius: 18,
            borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border,
            padding: 16, alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textMuted }}>{t.macros.addManual}</Text>
        </TouchableOpacity>

        {showCustom && (
          <View style={{ backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 16, marginTop: 4, gap: 10 }}>
            <TextInput
              style={[inputStyle, { fontSize: 15 }]}
              placeholder={t.macros.foodName}
              placeholderTextColor={colors.textDim}
              value={custom.name}
              onChangeText={(v) => setCustom({ ...custom, name: v })}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[
                { key: 'cal', placeholder: t.macros.kcal },
                { key: 'p', placeholder: t.macros.prot },
                { key: 'c', placeholder: t.macros.carb },
                { key: 'f', placeholder: t.macros.fat },
              ].map(({ key, placeholder }) => (
                <TextInput
                  key={key}
                  style={[inputStyle, { flex: 1, textAlign: 'center' }]}
                  placeholder={placeholder}
                  placeholderTextColor={colors.textDim}
                  keyboardType="numeric"
                  value={(custom as any)[key]}
                  onChangeText={(v) => setCustom({ ...custom, [key]: v })}
                />
              ))}
            </View>
            <TouchableOpacity
              onPress={handleAddCustom}
              style={{ padding: 15, backgroundColor: colors.accent, borderRadius: 14, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>{t.macros.addBtn}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
