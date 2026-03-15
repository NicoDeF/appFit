import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { colors } from '@/constants/Colors';
import { useAppStore } from '@/store/useAppStore';
import { MiniBar } from '@/components/ui/MiniBar';
import { WeightChart } from '@/components/ui/WeightChart';
import { formatNum, today } from '@/utils/helpers';
import { useT } from '@/constants/i18n';
import { useUnits } from '@/utils/units';

export default function BodyScreen() {
  const { bodyLog, addBodyEntry, profile } = useAppStore();
  const t = useT();
  const units = useUnits();

  const [weightInput, setWeightInput] = useState('');
  const [waistInput, setWaistInput] = useState('');
  const [activeLog, setActiveLog] = useState<'weight' | 'waist' | null>(null);
  const defaultBody = { weight: profile.weight, bf: profile.bodyFat, waist: 0, date: '' };
  const latestBody = bodyLog[bodyLog.length - 1] ?? defaultBody;
  const firstBody = bodyLog[0] ?? defaultBody;

  const leanMass = formatNum(latestBody.weight * (1 - latestBody.bf / 100));
  const fatMass = formatNum(latestBody.weight * (latestBody.bf / 100));

  const dispWeight = units.displayWeight(latestBody.weight);
  const dispWaist = units.displayLength(latestBody.waist);
  const dispFirstWeight = units.displayWeight(firstBody.weight);
  const dispFirstWaist = units.displayLength(firstBody.waist);

  const handleSaveWeight = () => {
    if (!weightInput) return;
    const kgValue = units.inputToKg(Number(weightInput));
    addBodyEntry({
      date: today(),
      weight: kgValue,
      bf: latestBody.bf,
      waist: latestBody.waist,
    });
    setWeightInput('');
    setActiveLog(null);
  };

  const handleSaveWaist = () => {
    if (!waistInput) return;
    const cmValue = units.inputToCm(Number(waistInput));
    addBodyEntry({
      date: today(),
      weight: latestBody.weight,
      bf: latestBody.bf,
      waist: cmValue,
    });
    setWaistInput('');
    setActiveLog(null);
  };

  const inputStyle = {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 15,
    color: colors.text,
    fontSize: 17,
    fontWeight: '700' as const,
    flex: 1,
    textAlign: 'center' as const,
  };

  const weightDelta = dispWeight.value - dispFirstWeight.value;
  const waistDelta = dispWaist.value - dispFirstWaist.value;

  const stats = [
    { label: t.body.statWeight, value: `${dispWeight.value}`, unit: dispWeight.unit, delta: weightDelta, color: colors.text },
    { label: t.body.statBF, value: `~${latestBody.bf.toFixed(2)}`, unit: '%', delta: +( latestBody.bf - firstBody.bf).toFixed(2), color: colors.blue },
    { label: t.body.statWaist, value: `${dispWaist.value}`, unit: dispWaist.unit, delta: waistDelta, color: colors.yellow },
  ];

  const weightUnit = units.weightUnit;
  const lengthUnit = units.lengthUnit;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 22, paddingTop: 58, paddingBottom: 18 }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.text }}>{t.body.title}</Text>
        <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>{t.body.subtitle}</Text>
      </View>

      {/* Stat cards */}
      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16 }}>
        {stats.map(({ label, value, unit, delta, color }) => (
          <View key={label} style={{
            flex: 1, backgroundColor: colors.card, borderRadius: 20,
            borderWidth: 1, borderColor: colors.border, padding: 16, alignItems: 'center',
          }}>
            <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
              {label}
            </Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color, marginTop: 8 }}>{value}</Text>
            <Text style={{ fontSize: 11, color: colors.textMuted }}>{unit}</Text>
            <View style={{ marginTop: 6 }}>
              <Text style={{ fontSize: 10, color: delta < 0 ? colors.green : colors.accent, fontWeight: '700' }}>
                {delta < 0 ? '▼' : '▲'} {formatNum(Math.abs(delta))}{unit}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Weight log */}
      <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 20, gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{t.body.weightCard}</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{t.body.weightCardSub}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setActiveLog(activeLog === 'weight' ? null : 'weight')}
            style={{
              backgroundColor: activeLog === 'weight' ? colors.surface : colors.accent,
              borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
              borderWidth: activeLog === 'weight' ? 1 : 0, borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: activeLog === 'weight' ? colors.textMuted : '#fff' }}>
              {activeLog === 'weight' ? t.common.cancel : '+ Log'}
            </Text>
          </TouchableOpacity>
        </View>
        {activeLog === 'weight' && (
          <View style={{ gap: 10 }}>
            <TextInput
              style={inputStyle}
              keyboardType="numeric"
              placeholder={`${dispWeight.value} ${weightUnit}`}
              placeholderTextColor={colors.textDim}
              value={weightInput}
              onChangeText={setWeightInput}
              autoFocus
            />
            <TouchableOpacity
              onPress={handleSaveWeight}
              style={{ padding: 14, backgroundColor: colors.accent, borderRadius: 12, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>{t.body.saveWeight}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Waist log */}
      <View style={{ marginHorizontal: 16, marginTop: 10, backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 20, gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{t.body.waistCard}</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{t.body.waistCardSub}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setActiveLog(activeLog === 'waist' ? null : 'waist')}
            style={{
              backgroundColor: activeLog === 'waist' ? colors.surface : colors.yellow,
              borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
              borderWidth: activeLog === 'waist' ? 1 : 0, borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: activeLog === 'waist' ? colors.textMuted : '#000' }}>
              {activeLog === 'waist' ? t.common.cancel : '+ Log'}
            </Text>
          </TouchableOpacity>
        </View>
        {activeLog === 'waist' && (
          <View style={{ gap: 10 }}>
            <TextInput
              style={inputStyle}
              keyboardType="numeric"
              placeholder={`${dispWaist.value} ${lengthUnit}`}
              placeholderTextColor={colors.textDim}
              value={waistInput}
              onChangeText={setWaistInput}
              autoFocus
            />
            <TouchableOpacity
              onPress={handleSaveWaist}
              style={{ padding: 14, backgroundColor: colors.yellow, borderRadius: 12, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#000' }}>{t.body.saveWaist}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Body composition */}
      <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 20, gap: 16 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: colors.textMuted }}>
          {t.body.composition}
        </Text>

        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue }} />
              <Text style={{ fontSize: 14, color: colors.textMuted }}>{t.body.leanMass}</Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.blue }}>{leanMass} {weightUnit}</Text>
          </View>
          <MiniBar value={100 - latestBody.bf} max={100} color={colors.blue} height={10} />
        </View>

        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.yellow }} />
              <Text style={{ fontSize: 14, color: colors.textMuted }}>{t.body.fatMass}</Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.yellow }}>{fatMass} {weightUnit}</Text>
          </View>
          <MiniBar value={latestBody.bf} max={100} color={colors.yellow} height={10} />
        </View>
      </View>

      {/* Weight chart */}
      <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 20 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: colors.textMuted, marginBottom: 14 }}>
          {t.body.weightTrend}
        </Text>
        <WeightChart data={bodyLog} field="weight" color={colors.accent} unit={weightUnit} />
      </View>

      {/* Waist chart */}
      <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 20 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, color: colors.textMuted, marginBottom: 14 }}>
          {t.body.waistTrend}
        </Text>
        <WeightChart data={bodyLog} field="waist" color={colors.yellow} unit={lengthUnit} />
      </View>

      {/* History table */}
      <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
        <View style={{ padding: 18, paddingBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>{t.body.history}</Text>
        </View>
        <View style={{ flexDirection: 'row', paddingHorizontal: 18, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface }}>
          <Text style={{ flex: 2, fontSize: 10, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>{t.body.dateCol}</Text>
          <Text style={{ flex: 1, fontSize: 10, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>{weightUnit}</Text>
          <Text style={{ flex: 1, fontSize: 10, color: colors.blue, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>{t.body.bfCol}</Text>
          <Text style={{ flex: 1, fontSize: 10, color: colors.yellow, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'right' }}>{t.body.waistCol}</Text>
        </View>
        {[...bodyLog].reverse().slice(0, 10).map((e, i) => {
          const dw = units.displayWeight(e.weight);
          const dl = units.displayLength(e.waist);
          return (
            <View
              key={i}
              style={{
                flexDirection: 'row', paddingHorizontal: 18, paddingVertical: 14,
                borderTopWidth: 1, borderTopColor: colors.border,
              }}
            >
              <Text style={{ flex: 2, fontSize: 13, color: colors.textMuted }}>{e.date}</Text>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: colors.text, textAlign: 'center' }}>{dw.value}</Text>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: colors.blue, textAlign: 'center' }}>{Number(e.bf).toFixed(2)}%</Text>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: colors.yellow, textAlign: 'right' }}>{dl.value}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
