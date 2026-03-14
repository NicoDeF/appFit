import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { colors } from '@/constants/Colors';
import { useAppStore, DayActivity } from '@/store/useAppStore';
import { TRAINING_TYPES, WEEKLY_PLAN, TrainingCategory } from '@/constants/data';

const DAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DAY_NAMES: Record<string, string> = {
  Monday: 'Lunes', Tuesday: 'Martes', Wednesday: 'Miércoles',
  Thursday: 'Jueves', Friday: 'Viernes', Saturday: 'Sábado', Sunday: 'Domingo',
};
const ENGLISH_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const CATEGORY_LABELS: Record<TrainingCategory, string> = {
  gym: 'Gimnasio', sport: 'Deporte', cardio: 'Cardio',
  other: 'Otro', rest: 'Descanso', custom: 'Personalizado',
};

const CATEGORY_COLOR: Record<TrainingCategory, string> = {
  gym: colors.blue, sport: colors.green, cardio: colors.yellow,
  other: colors.accent, rest: colors.textMuted, custom: colors.accent,
};

const CATEGORIES: TrainingCategory[] = ['gym', 'sport', 'cardio', 'other', 'rest'];

function activityLabel(a: DayActivity): string {
  if (a.type === 'custom') return a.label || 'Personalizado';
  return TRAINING_TYPES.find((t) => t.id === a.type)?.label ?? a.type;
}

function activityColor(a: DayActivity): string {
  const tr = TRAINING_TYPES.find((t) => t.id === a.type);
  return tr ? CATEGORY_COLOR[tr.category] : colors.textMuted;
}

export default function PlannerScreen() {
  const { weeklyPlan, updateWeeklyPlan } = useAppStore();

  const todayIndex = (new Date().getDay() + 6) % 7;
  const [selectedDay, setSelectedDay] = useState(todayIndex);
  const [showPicker, setShowPicker] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const plan = weeklyPlan ?? WEEKLY_PLAN;
  const selectedEntry = plan[selectedDay];
  const activities: DayActivity[] = selectedEntry?.activities ?? [];

  const updateDay = (newActivities: DayActivity[]) => {
    const newPlan = plan.map((entry, i) =>
      i === selectedDay ? { ...entry, activities: newActivities } : entry
    );
    updateWeeklyPlan(newPlan);
  };

  const addActivity = (type: string, label?: string) => {
    // Don't add duplicates (except custom)
    if (type !== 'custom' && activities.some((a) => a.type === type)) return;
    updateDay([...activities, { type, ...(label ? { label } : {}) }]);
    setShowPicker(false);
    setCustomInput('');
  };

  const removeActivity = (index: number) => {
    const next = activities.filter((_, i) => i !== index);
    updateDay(next.length > 0 ? next : [{ type: 'rest' }]);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 22, paddingTop: 58, paddingBottom: 16 }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.text }}>Plan Semanal</Text>
        <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>Organizá tu semana de entrenamiento</Text>
      </View>

      {/* 7-day selector */}
      <View style={{ paddingHorizontal: 16 }}>
        <View style={{
          flexDirection: 'row',
          backgroundColor: colors.card, borderRadius: 18,
          borderWidth: 1, borderColor: colors.border,
          padding: 5, gap: 3,
        }}>
          {DAYS_SHORT.map((day, i) => {
            const isToday = i === todayIndex;
            const isSelected = i === selectedDay;
            const acts = plan[i]?.activities ?? [];
            // Show dot color of first (primary) activity
            const firstTr = TRAINING_TYPES.find((t) => t.id === acts[0]?.type);
            const dotColor = firstTr ? CATEGORY_COLOR[firstTr.category] : colors.textMuted;
            return (
              <TouchableOpacity
                key={day}
                onPress={() => { setSelectedDay(i); setShowPicker(false); setCustomInput(''); }}
                style={{
                  flex: 1, alignItems: 'center', paddingVertical: 10,
                  borderRadius: 13,
                  backgroundColor: isSelected ? colors.surface : 'transparent',
                }}
              >
                <Text style={{
                  fontSize: 10, fontWeight: '700',
                  color: isSelected ? colors.text : isToday ? colors.accent : colors.textMuted,
                  textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                  {day}
                </Text>
                {/* Dot(s): up to 2 colored dots if multiple activities */}
                <View style={{ flexDirection: 'row', gap: 2, marginTop: 4 }}>
                  {acts.slice(0, 2).map((a, ai) => {
                    const c = activityColor(a);
                    return <View key={ai} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: isSelected || isToday ? c : `${c}70` }} />;
                  })}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Selected day card */}
      <View style={{
        marginHorizontal: 16, marginTop: 12,
        backgroundColor: colors.card, borderRadius: 22,
        borderWidth: 1, borderColor: colors.border,
        overflow: 'hidden',
      }}>
        {/* Top color bar — color of most demanding activity */}
        <View style={{ height: 3, backgroundColor: activities.length > 0 ? activityColor(activities.reduce((best, a) => {
          const tr = TRAINING_TYPES.find((t) => t.id === a.type);
          const bestTr = TRAINING_TYPES.find((t) => t.id === best.type);
          return (tr?.calMod ?? 0) > (bestTr?.calMod ?? 0) ? a : best;
        })) : colors.textMuted }} />

        <View style={{ padding: 20, gap: 16 }}>
          {/* Day name + today badge */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>
              {DAY_NAMES[selectedEntry?.day ?? ''] ?? selectedEntry?.day ?? ''}
            </Text>
            {selectedDay === todayIndex && (
              <View style={{ backgroundColor: colors.accentSoft, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ fontSize: 10, color: colors.accent, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Hoy</Text>
              </View>
            )}
          </View>

          {/* Activity chips */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {activities.map((a, i) => {
              const col = activityColor(a);
              return (
                <View
                  key={i}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 6,
                    backgroundColor: `${col}18`,
                    borderWidth: 1, borderColor: `${col}50`,
                    borderRadius: 10, paddingVertical: 7, paddingLeft: 12, paddingRight: 8,
                  }}
                >
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: col }} />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: col }}>{activityLabel(a)}</Text>
                  <TouchableOpacity
                    onPress={() => removeActivity(i)}
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                  >
                    <Text style={{ fontSize: 16, color: col, lineHeight: 18, opacity: 0.7 }}>×</Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            {/* Add button */}
            <TouchableOpacity
              onPress={() => { setShowPicker(!showPicker); setCustomInput(''); }}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 5,
                borderWidth: 1, borderColor: showPicker ? colors.accent : colors.border,
                borderStyle: 'dashed',
                borderRadius: 10, paddingVertical: 7, paddingHorizontal: 12,
                backgroundColor: showPicker ? colors.accentSoft : 'transparent',
              }}
            >
              <Text style={{ fontSize: 16, color: showPicker ? colors.accent : colors.textMuted, lineHeight: 18 }}>
                {showPicker ? '×' : '+'}
              </Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: showPicker ? colors.accent : colors.textMuted }}>
                {showPicker ? 'Cancelar' : 'Agregar'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Picker */}
          {showPicker && (
            <View style={{ gap: 14, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 }}>
              {CATEGORIES.map((cat) => {
                const types = TRAINING_TYPES.filter((t) => t.category === cat);
                return (
                  <View key={cat} style={{ gap: 8 }}>
                    <Text style={{
                      fontSize: 10, fontWeight: '700', textTransform: 'uppercase',
                      letterSpacing: 1.2, color: CATEGORY_COLOR[cat],
                    }}>
                      {CATEGORY_LABELS[cat]}
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {types.map((tr) => {
                        const alreadyAdded = activities.some((a) => a.type === tr.id);
                        return (
                          <TouchableOpacity
                            key={tr.id}
                            onPress={() => addActivity(tr.id)}
                            style={{
                              borderRadius: 10,
                              paddingVertical: 8, paddingHorizontal: 14,
                              backgroundColor: alreadyAdded ? CATEGORY_COLOR[cat] : colors.surface,
                              borderWidth: 1,
                              borderColor: alreadyAdded ? CATEGORY_COLOR[cat] : colors.border,
                              opacity: alreadyAdded ? 0.5 : 1,
                            }}
                          >
                            <Text style={{
                              fontSize: 13, fontWeight: '600',
                              color: alreadyAdded ? '#fff' : colors.text,
                            }}>
                              {tr.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })}

              {/* Custom */}
              <View style={{ gap: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, color: CATEGORY_COLOR['custom'] }}>
                  Personalizado
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <TextInput
                    style={{
                      flex: 1, backgroundColor: colors.surface,
                      borderWidth: 1, borderColor: colors.border,
                      borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14,
                      fontSize: 14, color: colors.text,
                    }}
                    placeholder="Nombre del entrenamiento..."
                    placeholderTextColor={colors.textDim}
                    value={customInput}
                    onChangeText={setCustomInput}
                    autoCapitalize="words"
                  />
                  <TouchableOpacity
                    onPress={() => customInput.trim() && addActivity('custom', customInput.trim())}
                    style={{
                      backgroundColor: customInput.trim() ? colors.accent : colors.surface,
                      borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16,
                      borderWidth: 1, borderColor: customInput.trim() ? colors.accent : colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: customInput.trim() ? '#fff' : colors.textMuted }}>
                      Agregar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Full week list */}
      <View style={{
        marginHorizontal: 16, marginTop: 12,
        backgroundColor: colors.card, borderRadius: 22,
        borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
      }}>
        <View style={{ paddingHorizontal: 18, paddingTop: 18, paddingBottom: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>Semana completa</Text>
        </View>

        {plan.map((entry, i) => {
          const acts = entry.activities ?? [];
          // Primary color = highest calMod activity
          const primaryActivity = acts.reduce((best, a) => {
            const tr = TRAINING_TYPES.find((t) => t.id === a.type);
            const bestTr = TRAINING_TYPES.find((t) => t.id === best.type);
            return (tr?.calMod ?? 0) > (bestTr?.calMod ?? 0) ? a : best;
          }, acts[0] ?? { type: 'rest' });
          const primaryColor = activityColor(primaryActivity);
          const isToday = ENGLISH_DAYS[new Date().getDay()] === entry.day;
          const isSelected = i === selectedDay;

          return (
            <TouchableOpacity
              key={entry.day}
              onPress={() => { setSelectedDay(i); setShowPicker(false); setCustomInput(''); }}
              style={{
                flexDirection: 'row', alignItems: 'center',
                paddingHorizontal: 18, paddingVertical: 14,
                borderTopWidth: 1, borderTopColor: colors.border,
                backgroundColor: isSelected ? `${primaryColor}12` : 'transparent',
              }}
            >
              <View style={{ width: 3, height: 36, borderRadius: 2, backgroundColor: primaryColor, marginRight: 14 }} />

              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: isToday ? colors.accent : colors.text }}>
                  {DAY_NAMES[entry.day] ?? entry.day}
                  {isToday && <Text style={{ fontSize: 11, fontWeight: '600', color: colors.accent }}> · hoy</Text>}
                </Text>
                {/* Activity chips (compact) */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                  {acts.map((a, ai) => (
                    <Text key={ai} style={{ fontSize: 11, color: activityColor(a), fontWeight: '600' }}>
                      {activityLabel(a)}{ai < acts.length - 1 ? '  ·' : ''}
                    </Text>
                  ))}
                </View>
              </View>

              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textDim }}>
                {acts.length > 1 ? `${acts.length} actividades` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
