import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '@/constants/Colors';
import { useAppStore } from '@/store/useAppStore';
import { useT } from '@/constants/i18n';
import {
  scheduleFastingCompleteNotification,
  cancelFastingCompleteNotification,
} from '@/utils/notifications';

const PROTOCOLS = [14, 16, 18, 20, 23];
const SIZE = 240, R = 92, CIRC = 2 * Math.PI * R;

const PHASES = {
  es: [
    { hours: 4,  icon: '🍽️', title: 'Digestión completa',    desc: 'La insulina baja. El cuerpo agota la glucosa en sangre y empieza a usar glucógeno hepático.' },
    { hours: 8,  icon: '🔥', title: 'Quema de grasa activa', desc: 'Las reservas de glucógeno se agotan. El cuerpo cambia a quemar grasa como fuente principal.' },
    { hours: 12, icon: '⚡', title: 'Cetosis leve',           desc: 'El hígado produce cetonas. Primera reducción de inflamación y estabilización del azúcar.' },
    { hours: 16, icon: '🧬', title: 'Autofagia',              desc: 'Las células reciclan componentes dañados. Limpieza celular profunda en marcha.' },
    { hours: 18, icon: '🧠', title: 'Claridad mental',        desc: 'Aumenta el BDNF. Mejora el enfoque, la memoria y la función cognitiva.' },
    { hours: 24, icon: '✨', title: 'Cetosis profunda',       desc: 'Máxima autofagia. Fuertes efectos antiinflamatorios y regeneración celular.' },
  ],
  en: [
    { hours: 4,  icon: '🍽️', title: 'Digestion complete',    desc: 'Insulin drops. Body exhausts blood glucose and starts using liver glycogen.' },
    { hours: 8,  icon: '🔥', title: 'Active fat burning',    desc: 'Glycogen stores depleted. Body switches to fat as its primary fuel source.' },
    { hours: 12, icon: '⚡', title: 'Light ketosis',          desc: 'Liver produces ketones. First drop in inflammation and blood sugar stabilises.' },
    { hours: 16, icon: '🧬', title: 'Autophagy',              desc: 'Cells begin recycling damaged components. Deep cellular cleanup underway.' },
    { hours: 18, icon: '🧠', title: 'Mental clarity',         desc: 'BDNF rises. Focus, memory and cognitive function improve noticeably.' },
    { hours: 24, icon: '✨', title: 'Deep ketosis',           desc: 'Peak autophagy. Strong anti-inflammatory effects and cellular regeneration.' },
  ],
};

function fmt(ms: number) {
  const s = Math.floor(Math.abs(ms) / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function FastingScreen() {
  const router = useRouter();
  const {
    fastingActive, fastingStartTime, fastingGoalHours, fastingHistory,
    startFast, stopFast, setFastingGoal, language,
  } = useAppStore();
  const t = useT();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!fastingActive) { setNow(Date.now()); return; }
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [fastingActive]);

  // Re-schedule fasting notification on mount in case the app was restarted mid-fast
  useEffect(() => {
    if (fastingActive && fastingStartTime) {
      scheduleFastingCompleteNotification(fastingStartTime, fastingGoalHours, language).catch(() => {});
    }
  }, []);

  const handleToggleFast = async () => {
    if (fastingActive) {
      await cancelFastingCompleteNotification();
      stopFast();
    } else {
      const startTime = Date.now();
      startFast();
      scheduleFastingCompleteNotification(startTime, fastingGoalHours, language).catch(() => {});
    }
  };

  const elapsed = fastingActive && fastingStartTime ? Math.max(0, now - fastingStartTime) : 0;
  const elapsedHours = elapsed / 3_600_000;
  const goalMs = fastingGoalHours * 3_600_000;
  const remaining = Math.max(0, goalMs - elapsed);
  const progress = fastingActive ? Math.min(1, elapsed / goalMs) : 0;
  const completed = fastingActive && elapsed >= goalMs;
  const strokeColor = completed ? colors.yellow : colors.blue;
  const offset = CIRC * (1 - progress);
  const locale = language === 'es' ? 'es-ES' : 'en-US';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 22, paddingTop: 58, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={{ fontSize: 15, color: colors.textMuted, fontWeight: '600' }}>{t.common.back}</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{t.fasting.title}</Text>
      </View>

      {/* Ring Card */}
      <View style={{
        marginHorizontal: 16, backgroundColor: colors.card, borderRadius: 24,
        borderWidth: 1, borderColor: fastingActive ? (completed ? colors.yellow : colors.blue) : colors.border,
        padding: 28, alignItems: 'center', gap: 20,
      }}>
        {/* SVG Ring */}
        <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ position: 'absolute' }}>
            <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={colors.border} strokeWidth={14} />
            <Circle
              cx={SIZE / 2} cy={SIZE / 2} r={R}
              fill="none" stroke={strokeColor} strokeWidth={14} strokeLinecap="round"
              strokeDasharray={`${CIRC}`} strokeDashoffset={offset}
              rotation={-90} origin={`${SIZE / 2}, ${SIZE / 2}`}
            />
          </Svg>
          <View style={{ alignItems: 'center' }}>
            {fastingActive ? (
              <>
                <Text style={{ fontSize: 36, fontWeight: '800', color: colors.text, letterSpacing: 2 }}>
                  {fmt(elapsed)}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '600', marginTop: 4 }}>
                  {t.fasting.elapsed}
                </Text>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 52, color: colors.textDim }}>⏱</Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '600', marginTop: 6 }}>
                  {t.fasting.inactive}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Stats row */}
        {fastingActive ? (
          <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-around' }}>
            {fastingStartTime && (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
                  {new Date(fastingStartTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{t.fasting.started}</Text>
              </View>
            )}
            <View style={{ width: 1, backgroundColor: colors.border }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: completed ? colors.yellow : colors.blue }}>
                {completed ? '🎉' : fmt(remaining)}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                {completed ? t.fasting.goalReached : t.fasting.remaining}
              </Text>
            </View>
            <View style={{ width: 1, backgroundColor: colors.border }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>{fastingGoalHours}h</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{t.fasting.goal}</Text>
            </View>
          </View>
        ) : (
          <Text style={{ fontSize: 13, color: colors.textMuted }}>
            {t.fasting.protocol}: {fastingGoalHours}/{24 - fastingGoalHours}
          </Text>
        )}
      </View>

      {/* Protocol Picker */}
      <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 20 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: colors.textMuted, marginBottom: 14 }}>
          {t.fasting.protocol}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {PROTOCOLS.map((h) => {
            const active = fastingGoalHours === h;
            return (
              <TouchableOpacity
                key={h}
                onPress={() => !fastingActive && setFastingGoal(h)}
                activeOpacity={fastingActive ? 1 : 0.7}
                style={{
                  flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center',
                  backgroundColor: active ? colors.blueSoft : colors.surface,
                  borderWidth: 1, borderColor: active ? colors.blue : colors.border,
                  opacity: fastingActive && !active ? 0.35 : 1,
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '800', color: active ? colors.blue : colors.textMuted }}>
                  {h}h
                </Text>
                <Text style={{ fontSize: 9, color: colors.textMuted, marginTop: 2 }}>
                  {h}:{24 - h}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* CTA */}
      <TouchableOpacity
        onPress={handleToggleFast}
        activeOpacity={0.8}
        style={{
          marginHorizontal: 16, marginTop: 12, paddingVertical: 18, borderRadius: 16,
          backgroundColor: fastingActive ? colors.accentSoft : colors.blue,
          borderWidth: 1, borderColor: fastingActive ? colors.accent : colors.blue,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '800', color: fastingActive ? colors.accent : '#fff' }}>
          {fastingActive ? t.fasting.stopBtn : t.fasting.startBtn}
        </Text>
      </TouchableOpacity>

      {/* Fasting Phases */}
      <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 20 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: colors.textMuted, marginBottom: 16 }}>
          {language === 'es' ? 'Fases del ayuno' : 'Fasting phases'}
        </Text>
        {PHASES[language === 'es' ? 'es' : 'en'].map((phase, i) => {
          const done = fastingActive && elapsedHours >= phase.hours;
          const current = fastingActive && elapsedHours >= (PHASES.es[i - 1]?.hours ?? 0) && elapsedHours < phase.hours;
          const dimmed = fastingActive && !done && !current;
          return (
            <View
              key={phase.hours}
              style={{
                flexDirection: 'row', gap: 14, paddingVertical: 14,
                borderBottomWidth: i < PHASES.es.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
                opacity: dimmed ? 0.38 : 1,
              }}
            >
              {/* Left: icon + line */}
              <View style={{ alignItems: 'center', width: 36 }}>
                <View style={{
                  width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: done ? colors.greenSoft : current ? colors.blueSoft : colors.surface,
                  borderWidth: 1,
                  borderColor: done ? colors.green : current ? colors.blue : colors.border,
                }}>
                  <Text style={{ fontSize: 16 }}>{done ? '✓' : phase.icon}</Text>
                </View>
                <Text style={{ fontSize: 10, fontWeight: '700', color: done ? colors.green : current ? colors.blue : colors.textDim, marginTop: 4 }}>
                  {phase.hours}h
                </Text>
              </View>
              {/* Right: title + desc */}
              <View style={{ flex: 1, justifyContent: 'center', gap: 3 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: done ? colors.green : current ? colors.blue : colors.text }}>
                  {current ? '▶ ' : ''}{phase.title}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, lineHeight: 17 }}>
                  {phase.desc}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* History */}
      <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 20 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: colors.textMuted, marginBottom: 14 }}>
          {t.fasting.history}
        </Text>
        {fastingHistory.length === 0 ? (
          <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 8 }}>
            {t.fasting.noHistory}
          </Text>
        ) : (
          fastingHistory.slice(0, 5).map((entry, i) => {
            const dur = entry.endTime - entry.startTime;
            const reachedGoal = dur >= entry.goalHours * 3_600_000;
            return (
              <View
                key={i}
                style={{
                  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: i < Math.min(fastingHistory.length, 5) - 1 ? 1 : 0,
                  borderBottomColor: colors.border,
                }}
              >
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>
                    {new Date(entry.startTime).toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                    {t.fasting.fastOf} {entry.goalHours}h
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: reachedGoal ? colors.green : colors.textMuted }}>
                    {fmt(dur)}
                  </Text>
                  <Text style={{ fontSize: 10, color: reachedGoal ? colors.green : colors.textMuted, marginTop: 2 }}>
                    {reachedGoal ? t.fasting.reached : t.fasting.notReached}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
