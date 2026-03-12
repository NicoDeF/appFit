// Requires: npx expo run:android (native rebuild after installing expo-sensors)
import { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

// Lazy-load Pedometer so a missing native module doesn't crash the whole tab
let Pedometer: typeof import('expo-sensors').Pedometer | null = null;
try { Pedometer = require('expo-sensors').Pedometer; } catch { /* native not compiled yet */ }
import { colors } from '@/constants/Colors';
import { useT } from '@/constants/i18n';
import { useUnits } from '@/utils/units';

const DAILY_GOAL = 10000;

// ── ring helpers ────────────────────────────────────────────────────────────
const R = 90;
const STROKE = 14;
const CIRCUM = 2 * Math.PI * R;

function StepsRing({ steps, goal }: { steps: number; goal: number }) {
  const pct = Math.min(steps / goal, 1);
  const dash = pct * CIRCUM;
  const size = (R + STROKE) * 2;

  return (
    <Svg width={size} height={size}>
      {/* Track */}
      <Circle
        cx={size / 2} cy={size / 2} r={R}
        stroke={colors.surface} strokeWidth={STROKE}
        fill="none"
      />
      {/* Progress */}
      <Circle
        cx={size / 2} cy={size / 2} r={R}
        stroke={colors.green} strokeWidth={STROKE}
        fill="none"
        strokeDasharray={`${dash} ${CIRCUM}`}
        strokeLinecap="round"
        rotation="-90"
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}

// ── stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, unit, color }: {
  label: string; value: string; unit: string; color: string;
}) {
  return (
    <View style={[styles.statCard, { borderColor: `${color}30` }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ── main ─────────────────────────────────────────────────────────────────────
export default function StepsScreen() {
  const t = useT();
  const units = useUnits();

  const [steps, setSteps] = useState(0);
  const [available, setAvailable] = useState<boolean | null>(null); // null = loading
  const [goal, setGoal] = useState(DAILY_GOAL);
  const subRef = useRef<ReturnType<typeof Pedometer.watchStepCount> | null>(null);

  // Derived stats
  const pct = Math.min(steps / goal, 1);
  const kcal = Math.round(steps * 0.04); // ~0.04 kcal/step

  // Distance: metric = km (stride 78cm), imperial = miles
  const distanceValue = units.unitSystem === 'imperial'
    ? (steps * 0.000485).toFixed(2)  // 1 step ≈ 0.000485 miles
    : ((steps * 0.78) / 1000).toFixed(2); // avg stride 78cm
  const distanceUnit = units.unitSystem === 'imperial' ? 'mi' : 'km';

  useEffect(() => {
    if (!Pedometer) { setAvailable(false); return; }

    let mounted = true;

    (async () => {
      const isAvail = await Pedometer!.isAvailableAsync();
      if (!mounted) return;
      setAvailable(isAvail);

      if (!isAvail) return;

      // Read today's steps from midnight
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const { steps: todaySteps } = await Pedometer!.getStepCountAsync(midnight, now);
      if (mounted) setSteps(todaySteps ?? 0);

      // Live updates
      subRef.current = Pedometer!.watchStepCount(({ steps: delta }) => {
        if (mounted) setSteps((s) => s + delta);
      });
    })();

    return () => {
      mounted = false;
      subRef.current?.remove();
    };
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t.steps.title}</Text>
        <Text style={styles.subtitle}>{t.steps.subtitle}</Text>
      </View>

      {/* Unavailable banner */}
      {available === false && (
        <View style={styles.unavailBanner}>
          <Text style={styles.unavailText}>
            {t.steps.notAvailable}
            {Platform.OS === 'ios' ? t.steps.notAvailableIOS : '.'}
          </Text>
        </View>
      )}

      {/* Ring */}
      <View style={styles.ringWrapper}>
        <StepsRing steps={steps} goal={goal} />
        <View style={styles.ringCenter} pointerEvents="none">
          <Text style={styles.stepCount}>
            {available === null ? '—' : steps.toLocaleString()}
          </Text>
          <Text style={styles.stepLabel}>{t.steps.steps}</Text>
          <Text style={styles.stepGoal}>{t.steps.goal} {goal.toLocaleString()}</Text>
        </View>
      </View>

      {/* % label */}
      <Text style={styles.pctLabel}>
        {available === null
          ? t.steps.loadingText
          : available === false
          ? t.steps.noSensor
          : `${Math.round(pct * 100)}% ${t.steps.pctLabel}`}
      </Text>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatCard label={t.steps.distanceLabel} value={distanceValue} unit={distanceUnit} color={colors.blue} />
        <StatCard label={t.steps.caloriesLabel} value={String(kcal)} unit="kcal" color={colors.accent} />
        <StatCard label={t.steps.goalLabel} value={(goal / 1000).toFixed(0) + 'k'} unit={t.steps.steps} color={colors.green} />
      </View>

      {/* Goal selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.steps.changeGoal}</Text>
        <View style={styles.goalRow}>
          {[6000, 8000, 10000, 12000, 15000].map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.goalChip, goal === g && styles.goalChipActive]}
              onPress={() => setGoal(g)}
            >
              <Text style={[styles.goalChipText, goal === g && styles.goalChipTextActive]}>
                {(g / 1000).toFixed(0)}k
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.steps.tipsLabel}</Text>
        <View style={styles.tipsCard}>
          {[
            { icon: '🚶', text: t.steps.tip1 },
            { icon: '🏃', text: t.steps.tip2 },
            { icon: '🔥', text: t.steps.tip3 },
          ].map(({ icon, text }) => (
            <View key={text} style={styles.tip}>
              <Text style={styles.tipIcon}>{icon}</Text>
              <Text style={styles.tipText}>{text}</Text>
            </View>
          ))}
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 58,
    paddingHorizontal: 22,
    paddingBottom: 40,
  },
  header: { marginBottom: 24, gap: 4 },
  title: { fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textMuted, fontWeight: '500' },
  unavailBanner: {
    backgroundColor: `${colors.accent}18`,
    borderWidth: 1,
    borderColor: `${colors.accent}40`,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  unavailText: { fontSize: 13, color: colors.textMuted, lineHeight: 20 },
  ringWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    gap: 2,
  },
  stepCount: { fontSize: 42, fontWeight: '800', color: colors.text, letterSpacing: -1 },
  stepLabel: { fontSize: 15, fontWeight: '600', color: colors.textMuted },
  stepGoal: { fontSize: 12, color: colors.textDim, marginTop: 2 },
  pctLabel: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.green,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 28,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 2,
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statUnit: { fontSize: 11, color: colors.textDim, fontWeight: '600' },
  statLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '500', marginTop: 2 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  goalRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  goalChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  goalChipActive: {
    borderColor: colors.green,
    backgroundColor: `${colors.green}18`,
  },
  goalChipText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  goalChipTextActive: { color: colors.green },
  tipsCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 14,
  },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  tipIcon: { fontSize: 18, marginTop: 1 },
  tipText: { flex: 1, fontSize: 14, color: colors.textMuted, lineHeight: 20 },
});
