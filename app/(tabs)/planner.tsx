import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/Colors';
import { useAppStore } from '@/store/useAppStore';
import { TRAINING_TYPES, WEEKLY_PLAN } from '@/constants/data';
import { useT } from '@/constants/i18n';

const DAYS_SHORT_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DAYS_SHORT_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ENGLISH_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function PlannerScreen() {
  const { profile, weeklyPlan, language } = useAppStore();
  const t = useT();

  const DAYS_SHORT = language === 'es' ? DAYS_SHORT_ES : DAYS_SHORT_EN;

  const DAY_NAMES: Record<string, string> = language === 'es' ? {
    Monday: 'Lunes', Tuesday: 'Martes', Wednesday: 'Miércoles',
    Thursday: 'Jueves', Friday: 'Viernes', Saturday: 'Sábado', Sunday: 'Domingo',
  } : {
    Monday: 'Monday', Tuesday: 'Tuesday', Wednesday: 'Wednesday',
    Thursday: 'Thursday', Friday: 'Friday', Saturday: 'Saturday', Sunday: 'Sunday',
  };

  const TIPS = [
    { emoji: '💪', title: t.planner.tip1Title, tip: t.planner.tip1Text },
    { emoji: '⚽', title: t.planner.tip2Title, tip: t.planner.tip2Text },
    { emoji: '😴', title: t.planner.tip3Title, tip: t.planner.tip3Text },
  ];

  // 0=Mon, 6=Sun (getDay returns 0=Sun so we shift)
  const todayIndex = (new Date().getDay() + 6) % 7;
  const [selectedDay, setSelectedDay] = useState(todayIndex);

  const plan = weeklyPlan ?? WEEKLY_PLAN;
  const selectedEntry = plan[selectedDay];
  const training = selectedEntry ? TRAINING_TYPES.find((t) => t.id === selectedEntry.type) : null;

  const dayCalories = training ? Math.round(profile.tdee * training.calMod) : profile.tdee;
  const dayCarbs = training ? Math.round(((dayCalories * 0.45) / 4) * training.carbMod) : 0;
  const dayProtein = Math.round(profile.weight * (profile.proteinPerKg || 2));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 22, paddingTop: 58, paddingBottom: 16 }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.text }}>{t.planner.title}</Text>
        <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>{t.planner.subtitle}</Text>
      </View>

      {/* 7-day pill selector */}
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
            return (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(i)}
                style={{
                  flex: 1, alignItems: 'center', paddingVertical: 10,
                  borderRadius: 13,
                  backgroundColor: isSelected ? colors.accent : 'transparent',
                }}
              >
                <Text style={{
                  fontSize: 10, fontWeight: '700',
                  color: isSelected ? '#fff' : isToday ? colors.accent : colors.textMuted,
                  textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                  {day}
                </Text>
                {isToday && !isSelected && (
                  <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent, marginTop: 3 }} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Selected day detail */}
      {selectedEntry && training && (
        <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 20, gap: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{
              width: 58, height: 58, borderRadius: 18,
              backgroundColor: colors.accentSoft,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 28 }}>{training.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>{DAY_NAMES[selectedEntry.day] ?? selectedEntry.day}</Text>
              <Text style={{ fontSize: 14, color: colors.accent, fontWeight: '600', marginTop: 2 }}>{t.trainingType[training.id as keyof typeof t.trainingType]}</Text>
            </View>
            {selectedDay === todayIndex && (
              <View style={{ backgroundColor: colors.accentSoft, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}>
                <Text style={{ fontSize: 11, color: colors.accent, fontWeight: '700' }}>{t.planner.today}</Text>
              </View>
            )}
          </View>

          <View style={{ height: 1, backgroundColor: colors.border }} />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { label: t.planner.calories, value: `${dayCalories}`, unit: 'kcal', color: colors.text },
              { label: t.planner.protein, value: `${dayProtein}`, unit: 'g', color: colors.accent },
              { label: t.planner.carbs, value: `${dayCarbs}`, unit: 'g', color: colors.blue },
            ].map(({ label, value, unit, color }) => (
              <View key={label} style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
                  {label}
                </Text>
                <Text style={{ fontSize: 22, fontWeight: '800', color }}>{value}</Text>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>{unit}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Full week overview */}
      <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
        <View style={{ padding: 18, paddingBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>{t.planner.fullWeek}</Text>
        </View>
        {plan.map(({ day, type }, i) => {
          const tr = TRAINING_TYPES.find((x) => x.id === type)!;
          const dayCals = Math.round(profile.tdee * tr.calMod);
          const isToday = ENGLISH_DAYS[new Date().getDay()] === day;
          const isSelected = i === selectedDay;

          return (
            <TouchableOpacity
              key={day}
              onPress={() => setSelectedDay(i)}
              style={{
                flexDirection: 'row', alignItems: 'center',
                paddingHorizontal: 18, paddingVertical: 15,
                borderTopWidth: 1, borderTopColor: colors.border,
                backgroundColor: isSelected ? colors.accentSoft : isToday ? `${colors.accentSoft}80` : 'transparent',
              }}
            >
              <Text style={{ fontSize: 20, marginRight: 14 }}>{tr.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: isToday ? colors.accent : colors.text }}>
                  {DAY_NAMES[day] ?? day}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>{t.trainingType[tr.id as keyof typeof t.trainingType]}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 2 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: isSelected ? colors.accent : colors.text }}>
                  {dayCals}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>kcal</Text>
              </View>
              {isToday && (
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, marginLeft: 10 }} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Nutrition tips */}
      <View style={{ marginHorizontal: 16, marginTop: 20, gap: 10 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: colors.textMuted, marginBottom: 4 }}>
          {t.planner.tipsLabel}
        </Text>
        {TIPS.map((item, i) => (
          <View
            key={i}
            style={{ backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 18, flexDirection: 'row', gap: 14 }}
          >
            <Text style={{ fontSize: 24, marginTop: 2 }}>{item.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 6 }}>{item.title}</Text>
              <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 20 }}>{item.tip}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
