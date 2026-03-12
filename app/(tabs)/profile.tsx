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

  // Display values in current unit system
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

  // Convert inputs back to metric for calculation
  const wKg = units.inputToKg(Number(weight) || 0) || profile.weight;
  const hCm = units.inputToCm(Number(height) || 0) || profile.height;
  const a = Number(age) || 25;
  const tdee = calcTDEE(wKg, hCm, a, gender, activityLevel);
  const calories = calcCalorieTarget(tdee, goal);
  const protein = Math.round(wKg * calcProteinPerKg(goal));
  const bf = estimateBF(wKg, hCm, a, gender);

  const handleSave = () => {
    if (!weight || !height || !age) {
      Alert.alert('Missing info', 'Please fill in weight, height and age.');
      return;
    }
    updateProfile({
      weight: wKg, height: hCm, age: a, gender, activityLevel, goal,
      targetWeight: units.inputToKg(Number(targetWeight)) || wKg,
      tdee: calories, bodyFat: bf, targetBf: Math.max(8, bf - 5),
      proteinPerKg: calcProteinPerKg(goal),
    });
    Alert.alert('Saved!', 'Your profile has been updated.');
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
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{user?.name ?? 'User'}</Text>
          <Text style={{ fontSize: 13, color: colors.textMuted }}>{user?.email ?? ''}</Text>
        </View>
      </View>

      {/* Pro banner */}
      {isPremium ? (
        <View style={{
          backgroundColor: colors.accentSoft, borderRadius: 16,
          borderWidth: 1, borderColor: colors.accent,
          padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12,
        }}>
          <Text style={{ fontSize: 20 }}>⭐</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.accent }}>{t.profile.proActive}</Text>
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
        {/* Gender */}
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
        <NumberRow label={t.profile.age} value={age} onChange={setAge} unit="yrs" />
        <NumberRow label={t.profile.weight} value={weight} onChange={setWeight} unit={units.weightUnit} />
        <NumberRow label={t.profile.height} value={height} onChange={setHeight} unit={units.lengthUnit} />
        <NumberRow label={t.profile.targetWeight} value={targetWeight} onChange={setTargetWeight} unit={units.weightUnit} />
      </View>

      {/* Activity level */}
      <SectionHeader title={t.profile.activitySection} />
      <View style={{ gap: 8 }}>
        {ACTIVITY_LEVELS.map((a) => (
          <TouchableOpacity
            key={a.id}
            onPress={() => setActivityLevel(a.id as ActivityLevel)}
            style={{
              padding: 14, borderRadius: 16,
              flexDirection: 'row', alignItems: 'center', gap: 12,
              borderWidth: 1.5,
              borderColor: activityLevel === a.id ? colors.accent : colors.border,
              backgroundColor: activityLevel === a.id ? colors.accentSoft : colors.card,
            }}
          >
            <Text style={{ fontSize: 22 }}>{a.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: activityLevel === a.id ? colors.accent : colors.text }}>
                {t.activity[a.id as keyof typeof t.activity]}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{t.activityDesc[a.id as keyof typeof t.activityDesc]}</Text>
            </View>
            {activityLevel === a.id && (
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Goal */}
      <SectionHeader title={t.profile.goalSection} />
      <View style={{ gap: 8 }}>
        {GOALS.map((g) => (
          <TouchableOpacity
            key={g.id}
            onPress={() => setGoal(g.id as Goal)}
            style={{
              padding: 14, borderRadius: 16,
              flexDirection: 'row', alignItems: 'center', gap: 12,
              borderWidth: 1.5,
              borderColor: goal === g.id ? colors.accent : colors.border,
              backgroundColor: goal === g.id ? colors.accentSoft : colors.card,
            }}
          >
            <Text style={{ fontSize: 22 }}>{g.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: goal === g.id ? colors.accent : colors.text }}>
                {t.goal[g.id as keyof typeof t.goal]}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{t.goalDesc[g.id as keyof typeof t.goalDesc]}</Text>
            </View>
            {goal === g.id && (
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
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
          { id: 'es', flag: '🇪🇸', label: 'Español' },
          { id: 'en', flag: '🇺🇸', label: 'English' },
        ] as { id: Language; flag: string; label: string }[]).map((lang) => (
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
            <Text style={{ fontSize: 20 }}>{lang.flag}</Text>
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
          { id: 'metric', label: language === 'es' ? 'Métrico' : 'Metric' },
          { id: 'imperial', label: 'Imperial' },
        ] as { id: UnitSystem; label: string }[]).map((us) => (
          <TouchableOpacity
            key={us.id}
            onPress={() => setUnitSystem(us.id)}
            style={{
              flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center',
              borderWidth: 1.5,
              borderColor: unitSystem === us.id ? colors.accent : 'transparent',
              backgroundColor: unitSystem === us.id ? colors.accentSoft : colors.surface,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: unitSystem === us.id ? colors.accent : colors.textMuted }}>
              {us.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign out */}
      <TouchableOpacity
        onPress={() => { logout(); router.replace('/welcome' as any); }}
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
