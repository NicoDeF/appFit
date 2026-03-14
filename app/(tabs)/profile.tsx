import { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/Colors';
import { useAppStore, Goal, Language } from '@/store/useAppStore';
import {
  ACTIVITY_LEVELS, GOALS, Gender, ActivityLevel,
  calcTDEE, estimateBF, calcCalorieTarget, calcProteinPerKg,
} from '@/utils/helpers';
import { useT } from '@/constants/i18n';
import { useUnits } from '@/utils/units';
import { UnitSystem } from '@/utils/units';
import { supabase } from '@/utils/supabase';

const ACTIVITY_COLORS: Record<string, string> = {
  sedentary: colors.textMuted,
  light:     colors.blue,
  moderate:  colors.green,
  active:    colors.accent,
};

const GOAL_COLORS: Record<string, string> = {
  cut:    colors.blue,
  bulk:   colors.green,
  recomp: colors.accent,
};

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={{
      fontSize: 11, fontWeight: '700', textTransform: 'uppercase',
      letterSpacing: 1.5, color: colors.textMuted,
      marginTop: 24, marginBottom: 10,
    }}>
      {title}
    </Text>
  );
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={{
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.border,
    }}>
      <Text style={{ fontSize: 14, color: colors.textMuted }}>{label}</Text>
      <Text style={{ fontSize: 15, fontWeight: '700', color: accent ? colors.accent : colors.text }}>{value}</Text>
    </View>
  );
}

function NumberRow({ label, value, onChange, unit }: {
  label: string; value: string; onChange: (v: string) => void; unit: string;
}) {
  return (
    <View style={{
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.border,
    }}>
      <Text style={{ fontSize: 14, color: colors.textMuted }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <TextInput
          style={{
            fontSize: 17, fontWeight: '700', color: colors.text,
            textAlign: 'right', minWidth: 60, padding: 4,
          }}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          placeholderTextColor={colors.textDim}
        />
        <Text style={{ fontSize: 13, color: colors.textMuted, minWidth: 24 }}>{unit}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { profile, updateProfile, isPremium, logout, user, language, setLanguage, unitSystem, setUnitSystem } = useAppStore();
  const router = useRouter();
  const t = useT();
  const units = useUnits();

  const initWeight = String(units.displayWeight(profile.weight).value);
  const initHeight = String(units.displayLength(profile.height).value);
  const initTargetWeight = String(units.displayWeight(profile.targetWeight).value);

  const [weight, setWeight] = useState(initWeight);
  const [height, setHeight] = useState(initHeight);
  const [age, setAge] = useState(String(profile.age ?? 25));
  const [targetWeight, setTargetWeight] = useState(initTargetWeight);
  const [gender, setGender] = useState<Gender>(profile.gender ?? 'male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel ?? 'moderate');
  const [goal, setGoal] = useState<Goal>(profile.goal);

  const wKg = units.inputToKg(Number(weight) || 0) || profile.weight;
  const hCm = units.inputToCm(Number(height) || 0) || profile.height;
  const a = Number(age) || 25;
  const tdee = calcTDEE(wKg, hCm, a, gender, activityLevel);
  const calories = calcCalorieTarget(tdee, goal);
  const protein = Math.round(wKg * calcProteinPerKg(goal));
  const bf = estimateBF(wKg, hCm, a, gender);

  const handleSave = () => {
    if (!weight || !height || !age) {
      Alert.alert('Faltan datos', 'Completá peso, altura y edad.');
      return;
    }
    updateProfile({
      weight: wKg, height: hCm, age: a, gender, activityLevel, goal,
      targetWeight: units.inputToKg(Number(targetWeight)) || wKg,
      tdee: calories, bodyFat: bf, targetBf: Math.max(8, bf - 5),
      proteinPerKg: calcProteinPerKg(goal),
    });
    Alert.alert('Guardado', 'Tu perfil fue actualizado.');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    logout();
    router.replace('/welcome' as any);
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* User card */}
      <View style={{ paddingTop: 58, paddingBottom: 8, alignItems: 'center', gap: 12 }}>
        <View style={{
          width: 80, height: 80, borderRadius: 28,
          backgroundColor: colors.accentSoft,
          borderWidth: 2, borderColor: colors.accent,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.accent }}>{initials}</Text>
        </View>
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{user?.name ?? 'Usuario'}</Text>
          <Text style={{ fontSize: 13, color: colors.textMuted }}>{user?.email ?? ''}</Text>
        </View>
      </View>

      {/* Pro banner */}
      {isPremium ? (
        <View style={{
          backgroundColor: colors.accentSoft, borderRadius: 16,
          borderWidth: 1, borderColor: colors.accent,
          padding: 14, flexDirection: 'row', alignItems: 'center',
          justifyContent: 'space-between', marginTop: 12,
        }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.accent }}>{t.profile.proActive}</Text>
          <View style={{ backgroundColor: colors.accent, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 }}>PRO</Text>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => router.push('/paywall' as any)}
          style={{
            backgroundColor: colors.accent, borderRadius: 16, padding: 16,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 12,
            shadowColor: colors.accent, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
          }}
        >
          <View style={{ gap: 3 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff' }}>{t.profile.upgradePro}</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{t.profile.proSubtitle}</Text>
          </View>
          <Text style={{ fontSize: 22, color: '#fff' }}>→</Text>
        </TouchableOpacity>
      )}

      {/* Basic info */}
      <SectionHeader title={t.profile.myInfo} />
      <View style={{ backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 18 }}>
        <View style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 10 }}>{t.profile.gender}</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {(['male', 'female'] as Gender[]).map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => setGender(g)}
                style={{
                  flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
                  borderWidth: 1.5,
                  borderColor: gender === g ? colors.accent : colors.border,
                  backgroundColor: gender === g ? colors.accentSoft : colors.surface,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: gender === g ? colors.accent : colors.textMuted }}>
                  {g === 'male' ? t.profile.male : t.profile.female}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <NumberRow label={t.profile.age} value={age} onChange={setAge} unit="años" />
        <NumberRow label={t.profile.weight} value={weight} onChange={setWeight} unit={units.weightUnit} />
        <NumberRow label={t.profile.height} value={height} onChange={setHeight} unit={units.lengthUnit} />
        <NumberRow label={t.profile.targetWeight} value={targetWeight} onChange={setTargetWeight} unit={units.weightUnit} />
      </View>

      {/* Activity level */}
      <SectionHeader title={t.profile.activitySection} />
      <View style={{ gap: 8 }}>
        {ACTIVITY_LEVELS.map((a) => {
          const isActive = activityLevel === a.id;
          const dotColor = ACTIVITY_COLORS[a.id] ?? colors.textMuted;
          return (
            <TouchableOpacity
              key={a.id}
              onPress={() => setActivityLevel(a.id as ActivityLevel)}
              style={{
                borderRadius: 16, overflow: 'hidden',
                borderWidth: 1.5,
                borderColor: isActive ? dotColor : colors.border,
                backgroundColor: isActive ? `${dotColor}15` : colors.card,
                flexDirection: 'row',
              }}
            >
              <View style={{ width: 4, backgroundColor: dotColor }} />
              <View style={{ flex: 1, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: isActive ? dotColor : colors.text }}>
                    {t.activity[a.id as keyof typeof t.activity]}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{t.activityDesc[a.id as keyof typeof t.activityDesc]}</Text>
                </View>
                {isActive && (
                  <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: dotColor, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Goal */}
      <SectionHeader title={t.profile.goalSection} />
      <View style={{ gap: 8 }}>
        {GOALS.map((g) => {
          const isActive = goal === g.id;
          const dotColor = GOAL_COLORS[g.id] ?? colors.textMuted;
          return (
            <TouchableOpacity
              key={g.id}
              onPress={() => setGoal(g.id as Goal)}
              style={{
                borderRadius: 16, overflow: 'hidden',
                borderWidth: 1.5,
                borderColor: isActive ? dotColor : colors.border,
                backgroundColor: isActive ? `${dotColor}15` : colors.card,
                flexDirection: 'row',
              }}
            >
              <View style={{ width: 4, backgroundColor: dotColor }} />
              <View style={{ flex: 1, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: isActive ? dotColor : colors.text }}>
                    {t.goal[g.id as keyof typeof t.goal]}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{t.goalDesc[g.id as keyof typeof t.goalDesc]}</Text>
                </View>
                {isActive && (
                  <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: dotColor, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Calculated targets */}
      <SectionHeader title={t.profile.targetsSection} />
      <View style={{ backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 18 }}>
        <InfoRow label={t.profile.dailyCal} value={`${calories} kcal`} accent />
        <InfoRow label={t.profile.dailyProt} value={`${protein}g`} />
        <InfoRow label={t.profile.estimatedBF} value={`~${bf}%`} />
        <InfoRow label={t.profile.maintenance} value={`${tdee} kcal`} />
      </View>
      <Text style={{ fontSize: 11, color: colors.textDim, marginTop: 8, lineHeight: 16 }}>
        {t.profile.calcNote}
      </Text>

      {/* Save */}
      <TouchableOpacity
        onPress={handleSave}
        style={{
          marginTop: 28, padding: 17, backgroundColor: colors.accent, borderRadius: 16, alignItems: 'center',
          shadowColor: colors.accent, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff' }}>{t.profile.saveBtn}</Text>
      </TouchableOpacity>

      {/* Language */}
      <SectionHeader title={t.profile.languageSection} />
      <View style={{ backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 6, flexDirection: 'row', gap: 8 }}>
        {([
          { id: 'es', code: 'ES', label: 'Español' },
          { id: 'en', code: 'EN', label: 'English' },
        ] as { id: Language; code: string; label: string }[]).map((lang) => (
          <TouchableOpacity
            key={lang.id}
            onPress={() => setLanguage(lang.id)}
            style={{
              flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center',
              flexDirection: 'row', justifyContent: 'center', gap: 8,
              borderWidth: 1.5,
              borderColor: language === lang.id ? colors.accent : 'transparent',
              backgroundColor: language === lang.id ? colors.accentSoft : colors.surface,
            }}
          >
            <View style={{
              width: 26, height: 18, borderRadius: 4,
              backgroundColor: language === lang.id ? colors.accent : colors.border,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: language === lang.id ? '#fff' : colors.textMuted }}>
                {lang.code}
              </Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: language === lang.id ? colors.accent : colors.textMuted }}>
              {lang.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Unit system */}
      <SectionHeader title={language === 'es' ? 'Sistema de Medidas' : 'Unit System'} />
      <View style={{ backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 6, flexDirection: 'row', gap: 8 }}>
        {([
          { id: 'metric', label: language === 'es' ? 'Métrico' : 'Metric', sub: 'kg · cm' },
          { id: 'imperial', label: 'Imperial', sub: 'lb · ft' },
        ] as { id: UnitSystem; label: string; sub: string }[]).map((us) => (
          <TouchableOpacity
            key={us.id}
            onPress={() => setUnitSystem(us.id)}
            style={{
              flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center',
              borderWidth: 1.5,
              borderColor: unitSystem === us.id ? colors.accent : 'transparent',
              backgroundColor: unitSystem === us.id ? colors.accentSoft : colors.surface,
              gap: 2,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: unitSystem === us.id ? colors.accent : colors.textMuted }}>
              {us.label}
            </Text>
            <Text style={{ fontSize: 11, color: colors.textDim }}>{us.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign out */}
      <TouchableOpacity
        onPress={handleSignOut}
        style={{
          marginTop: 10, padding: 17, borderRadius: 16, alignItems: 'center',
          borderWidth: 1.5, borderColor: colors.border,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textMuted }}>{t.profile.signOut}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
