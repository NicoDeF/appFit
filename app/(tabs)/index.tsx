import { ScrollView, View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '@/constants/Colors';
import { useAppStore } from '@/store/useAppStore';
import { TRAINING_TYPES } from '@/constants/data';
import { MiniBar } from '@/components/ui/MiniBar';
import { WeightChart } from '@/components/ui/WeightChart';
import { pct, calcMacros } from '@/utils/helpers';
import { useT } from '@/constants/i18n';
import { useUnits } from '@/utils/units';

const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function CalorieRing({ consumed, target, labelLeft, labelEaten, labelTarget, labelOver }: {
  consumed: number; target: number;
  labelLeft: string; labelEaten: string; labelTarget: string; labelOver: string;
}) {
  const SIZE = 190;
  const R = 78;
  const CIRC = 2 * Math.PI * R;
  const progress = Math.min(1, consumed / (target || 1));
  const offset = CIRC * (1 - progress);
  const over = consumed > target;
  const strokeColor = over ? colors.accent : colors.green;
  const remaining = Math.max(0, target - consumed);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: SIZE, height: SIZE }}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ position: 'absolute' }}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={colors.border} strokeWidth={14} />
        <Circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          fill="none"
          stroke={strokeColor}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={`${CIRC}`}
          strokeDashoffset={offset}
          rotation={-90}
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 42, fontWeight: '800', color: colors.text, lineHeight: 48 }}>
          {remaining}
        </Text>
        <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '600', marginTop: 2 }}>{labelLeft}</Text>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const { profile, weeklyPlan, todayMeals, bodyLog, user, language } = useAppStore();
  const t = useT();
  const units = useUnits();

  const DAYS = language === 'es' ? DAYS_ES : DAYS_EN;
  const MONTHS = language === 'es' ? MONTHS_ES : MONTHS_EN;

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

  const defaultBody = { weight: profile.weight, bf: profile.bodyFat, waist: 0, date: '' };
  const latestBody = bodyLog[bodyLog.length - 1] ?? defaultBody;
  const firstBody = bodyLog[0] ?? defaultBody;

  const now = new Date();
  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const hour = now.getHours();
  const greeting = hour < 12 ? t.home.morning : hour < 17 ? t.home.afternoon : t.home.evening;
  const dateStr = `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]}`;

  const dispWeight = units.displayWeight(latestBody.weight);
  const dispTargetWeight = units.displayWeight(profile.targetWeight);

  const macroRows = [
    { label: t.home.protein, current: totals.p, target: protein, color: colors.accent },
    { label: t.home.carbs, current: totals.c, target: carbs, color: colors.blue },
    { label: t.home.fat, current: totals.f, target: fat, color: colors.yellow },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{
        paddingHorizontal: 22, paddingTop: 58, paddingBottom: 16,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        <View>
          <Text style={{ fontSize: 13, color: colors.textMuted, fontWeight: '600' }}>{greeting},</Text>
          <Text style={{ fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 1 }}>{firstName}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', paddingTop: 2 }}>
          <Text style={{ fontSize: 12, color: colors.textMuted }}>{dateStr}</Text>
          <View style={{ marginTop: 6, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: colors.accentSoft, borderRadius: 8 }}>
            <Text style={{ fontSize: 12, color: colors.accent, fontWeight: '700' }}>
              {todayTrainingLabel}
            </Text>
          </View>
        </View>
      </View>

      {/* Hero Calorie Card */}
      <View style={{ marginHorizontal: 16, backgroundColor: colors.card, borderRadius: 24, borderWidth: 1, borderColor: colors.border, padding: 24, alignItems: 'center', gap: 20 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: colors.textMuted }}>
          {t.home.dailyCal}
        </Text>
        <CalorieRing
          consumed={totals.cal}
          target={adjustedTdee}
          labelLeft={t.home.kcalLeft}
          labelEaten={t.home.eaten}
          labelTarget={t.home.target}
          labelOver={t.home.over}
        />
        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{totals.cal}</Text>
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{t.home.eaten}</Text>
          </View>
          <View style={{ width: 1, backgroundColor: colors.border }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{adjustedTdee}</Text>
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{t.home.target}</Text>
          </View>
          <View style={{ width: 1, backgroundColor: colors.border }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: totals.cal > adjustedTdee ? colors.accent : colors.green }}>
              {Math.abs(adjustedTdee - totals.cal)}
            </Text>
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
              {totals.cal > adjustedTdee ? t.home.over : t.home.left}
            </Text>
          </View>
        </View>
      </View>

      {/* Macro Bars */}
      <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 20, gap: 16 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: colors.textMuted }}>
          {t.home.macrosToday}
        </Text>
        {macroRows.map(({ label, current, target, color }) => (
          <View key={label} style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: colors.textMuted, fontWeight: '600' }}>{label}</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color }}>
                {current}g <Text style={{ color: colors.textDim, fontWeight: '500' }}>/ {target}g</Text>
              </Text>
            </View>
            <MiniBar value={current} max={target} color={color} height={6} />
          </View>
        ))}
      </View>

      {/* Body Stats */}
      <View style={{ flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: 12 }}>
        <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 18 }}>
          <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>{t.body.statWeight}</Text>
          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, marginTop: 8 }}>
            {dispWeight.value}<Text style={{ fontSize: 14, color: colors.textMuted, fontWeight: '500' }}> {dispWeight.unit}</Text>
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>Meta: {dispTargetWeight.value} {dispTargetWeight.unit}</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 18 }}>
          <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>{t.body.statBF}</Text>
          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.blue, marginTop: 8 }}>
            ~{latestBody.bf.toFixed(2)}<Text style={{ fontSize: 14, color: colors.textMuted, fontWeight: '500' }}> %</Text>
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>Estimado</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 20, gap: 16 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: colors.textMuted }}>
          {t.home.recompProgress}
        </Text>
        {[
          { label: 'Peso', from: units.displayWeight(firstBody.weight).value, to: units.displayWeight(profile.targetWeight).value, current: dispWeight.value, unit: units.weightUnit, color: colors.accent },
          { label: 'Grasa Corp.', from: +firstBody.bf.toFixed(2), to: +profile.targetBf.toFixed(2), current: +latestBody.bf.toFixed(2), unit: '%', color: colors.blue },
        ].map(({ label, from, to, current, unit, color }) => (
          <View key={label} style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: colors.textMuted }}>
                {label}: {from}{unit} → {to}{unit}
              </Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color }}>
                {Math.round(pct(current, to, from))}%
              </Text>
            </View>
            <MiniBar value={pct(current, to, from)} max={100} color={color} height={6} />
          </View>
        ))}
      </View>

      {/* Weight Chart */}
      <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 20 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: colors.textMuted, marginBottom: 14 }}>
          {t.home.weightTrend}
        </Text>
        <WeightChart data={bodyLog} field="weight" color={colors.accent} unit={units.weightUnit} />
      </View>
    </ScrollView>
  );
}
