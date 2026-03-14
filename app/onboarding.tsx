import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { AppLogo } from '@/components/ui/AppLogo';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/Colors';
import { useAppStore, Goal, Language } from '@/store/useAppStore';
import { TRAINING_TYPES } from '@/constants/data';
import {
  ACTIVITY_LEVELS, GOALS, Gender, ActivityLevel,
  calcTDEE, estimateBF, calcCalorieTarget, calcProteinPerKg,
} from '@/utils/helpers';
import { useT } from '@/constants/i18n';
import { UnitSystem } from '@/utils/units';

const TOTAL_STEPS = 5;

const inputStyle = {
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 16,
  padding: 17,
  color: colors.text,
  fontSize: 16,
  marginTop: 6,
  flex: 1,
};

function Label({ children }: { children: string }) {
  return <Text style={{ fontSize: 13, color: colors.textMuted, fontWeight: '600', marginTop: 20 }}>{children}</Text>;
}

function NextButton({ onPress, label, disabled = false }: { onPress: () => void; label: string; disabled?: boolean }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        padding: 18, borderRadius: 16, alignItems: 'center',
        backgroundColor: disabled ? colors.border : colors.accent,
        marginTop: 32,
        shadowColor: disabled ? 'transparent' : colors.accent,
        shadowOpacity: 0.3,
        shadowRadius: 14,
        elevation: disabled ? 0 : 6,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '800', color: disabled ? colors.textMuted : '#fff' }}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Step 0: Welcome ──────────────────────────────────────────────────────────
function StepWelcome({ onNext }: { onNext: () => void }) {
  const t = useT();
  const { language, setLanguage, unitSystem, setUnitSystem } = useAppStore();

  const pillSelected = { backgroundColor: colors.accentSoft, borderColor: colors.accent };
  const pillUnselected = { backgroundColor: colors.card, borderColor: colors.border };

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 28, paddingBottom: 48, paddingTop: 58 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Brand row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 44 }}>
        <AppLogo size={36} />
        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text, letterSpacing: -0.3 }}>appFIT</Text>
      </View>

      {/* Headline */}
      <Text style={{ fontSize: 42, fontWeight: '800', color: colors.text, letterSpacing: -1.5, lineHeight: 46, marginBottom: 10 }}>
        {language === 'es' ? 'Configura\ntu plan.' : 'Set up\nyour plan.'}
      </Text>
      <Text style={{ fontSize: 15, color: colors.textMuted, lineHeight: 22, marginBottom: 40 }}>
        {t.onboarding.step0_subtitle}
      </Text>

      {/* Language */}
      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textDim, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>
        {t.onboarding.language_label}
      </Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 28 }}>
        {([
          { id: 'es' as Language, flag: '🇪🇸', label: 'Español' },
          { id: 'en' as Language, flag: '🇺🇸', label: 'English' },
        ]).map((lang) => (
          <TouchableOpacity
            key={lang.id}
            onPress={() => setLanguage(lang.id)}
            style={{
              flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
              flexDirection: 'row', justifyContent: 'center', gap: 8, borderWidth: 1.5,
              ...(language === lang.id ? pillSelected : pillUnselected),
            }}
          >
            <Text style={{ fontSize: 18 }}>{lang.flag}</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: language === lang.id ? colors.accent : colors.textMuted }}>
              {lang.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Units */}
      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textDim, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>
        {t.onboarding.units_label}
      </Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 44 }}>
        {([
          { id: 'metric' as UnitSystem, label: t.onboarding.metric },
          { id: 'imperial' as UnitSystem, label: t.onboarding.imperial },
        ]).map((us) => (
          <TouchableOpacity
            key={us.id}
            onPress={() => setUnitSystem(us.id)}
            style={{
              flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
              borderWidth: 1.5,
              ...(unitSystem === us.id ? pillSelected : pillUnselected),
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: unitSystem === us.id ? colors.accent : colors.textMuted }}>
              {us.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <NextButton onPress={onNext} label={t.onboarding.letsGo} />
    </ScrollView>
  );
}

// ── Step 1: Basic info ───────────────────────────────────────────────────────
function StepBasicInfo({ form, set, onNext }: { form: any; set: (k: string) => (v: string) => void; onNext: () => void }) {
  const t = useT();
  const canContinue = form.weight && form.height && form.age;
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text }}>{t.onboarding.step1_title}</Text>
      <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4 }}>{t.onboarding.step1_subtitle}</Text>

      <Label>{t.onboarding.gender}</Label>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
        {(['male', 'female'] as Gender[]).map((g) => (
          <TouchableOpacity
            key={g}
            onPress={() => set('gender')(g)}
            style={{
              flex: 1, padding: 16, borderRadius: 14, alignItems: 'center',
              borderWidth: 1.5,
              borderColor: form.gender === g ? colors.accent : colors.border,
              backgroundColor: form.gender === g ? colors.accentSoft : colors.card,
            }}
          >
            <Text style={{ fontSize: 28 }}>{g === 'male' ? '👨' : '👩'}</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: form.gender === g ? colors.accent : colors.text, marginTop: 6 }}>
              {g === 'male' ? t.onboarding.male : t.onboarding.female}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Label>{t.onboarding.age}</Label>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TextInput style={inputStyle} keyboardType="numeric" placeholder="25" placeholderTextColor={colors.textDim} value={form.age} onChangeText={set('age')} />
        <Text style={{ color: colors.textMuted, fontSize: 16 }}>yrs</Text>
      </View>

      <Label>{t.onboarding.weight}</Label>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TextInput style={inputStyle} keyboardType="numeric" placeholder="80" placeholderTextColor={colors.textDim} value={form.weight} onChangeText={set('weight')} />
        <Text style={{ color: colors.textMuted, fontSize: 16 }}>kg</Text>
      </View>

      <Label>{t.onboarding.height}</Label>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TextInput style={inputStyle} keyboardType="numeric" placeholder="175" placeholderTextColor={colors.textDim} value={form.height} onChangeText={set('height')} />
        <Text style={{ color: colors.textMuted, fontSize: 16 }}>cm</Text>
      </View>

      <NextButton onPress={onNext} disabled={!canContinue} label={t.common.continue} />
    </ScrollView>
  );
}

// ── Step 2: Activity level ───────────────────────────────────────────────────
function StepActivity({ form, set, onNext }: { form: any; set: (k: string) => (v: string) => void; onNext: () => void }) {
  const t = useT();
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text }}>{t.onboarding.step2_title}</Text>
      <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: 20 }}>{t.onboarding.step2_subtitle}</Text>

      {ACTIVITY_LEVELS.map((a) => (
        <TouchableOpacity
          key={a.id}
          onPress={() => set('activityLevel')(a.id)}
          style={{
            padding: 18, borderRadius: 14, marginBottom: 10,
            borderWidth: 1.5,
            borderColor: form.activityLevel === a.id ? colors.accent : colors.border,
            backgroundColor: form.activityLevel === a.id ? colors.accentSoft : colors.card,
            flexDirection: 'row', alignItems: 'center', gap: 14,
          }}
        >
          <Text style={{ fontSize: 28 }}>{a.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: form.activityLevel === a.id ? colors.accent : colors.text }}>{t.activity[a.id as keyof typeof t.activity]}</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{t.activityDesc[a.id as keyof typeof t.activityDesc]}</Text>
          </View>
          {form.activityLevel === a.id && (
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}

      <NextButton onPress={onNext} label={t.common.continue} />
    </ScrollView>
  );
}

// ── Step 3: Goal ─────────────────────────────────────────────────────────────
function StepGoal({ form, set, onNext }: { form: any; set: (k: string) => (v: string) => void; onNext: () => void }) {
  const t = useT();
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text }}>{t.onboarding.step3_title}</Text>
      <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: 20 }}>{t.onboarding.step3_subtitle}</Text>

      {GOALS.map((g) => (
        <TouchableOpacity
          key={g.id}
          onPress={() => set('goal')(g.id)}
          style={{
            padding: 20, borderRadius: 14, marginBottom: 12,
            borderWidth: 1.5,
            borderColor: form.goal === g.id ? colors.accent : colors.border,
            backgroundColor: form.goal === g.id ? colors.accentSoft : colors.card,
            flexDirection: 'row', alignItems: 'center', gap: 14,
          }}
        >
          <Text style={{ fontSize: 32 }}>{g.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: form.goal === g.id ? colors.accent : colors.text }}>{t.goal[g.id as keyof typeof t.goal]}</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 3 }}>{t.goalDesc[g.id as keyof typeof t.goalDesc]}</Text>
          </View>
          {form.goal === g.id && (
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}

      <Label>{t.onboarding.targetWeight}</Label>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <TextInput style={inputStyle} keyboardType="numeric" placeholder="75" placeholderTextColor={colors.textDim} value={form.targetWeight} onChangeText={set('targetWeight')} />
        <Text style={{ color: colors.textMuted, fontSize: 16 }}>kg</Text>
      </View>

      <NextButton onPress={onNext} label={t.common.continue} />
    </ScrollView>
  );
}

// ── Step 4: Weekly plan ──────────────────────────────────────────────────────
function StepWeeklyPlan({ weekPlan, setWeekPlan, onNext }: { weekPlan: { day: string; type: string }[]; setWeekPlan: (p: any) => void; onNext: () => void }) {
  const t = useT();
  const { language } = useAppStore();
  const DAY_NAMES: Record<string, string> = language === 'es' ? {
    Monday: 'Lunes', Tuesday: 'Martes', Wednesday: 'Miércoles',
    Thursday: 'Jueves', Friday: 'Viernes', Saturday: 'Sábado', Sunday: 'Domingo',
  } : {
    Monday: 'Monday', Tuesday: 'Tuesday', Wednesday: 'Wednesday',
    Thursday: 'Thursday', Friday: 'Friday', Saturday: 'Saturday', Sunday: 'Sunday',
  };
  const setDayType = (day: string, type: string) =>
    setWeekPlan(weekPlan.map((d) => d.day === day ? { ...d, type } : d));

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text }}>{t.onboarding.step4_title}</Text>
      <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: 20 }}>{t.onboarding.step4_subtitle}</Text>

      {weekPlan.map(({ day, type }) => (
        <View key={day} style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 8 }}>{DAY_NAMES[day] ?? day}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {TRAINING_TYPES.map((tr) => (
              <TouchableOpacity
                key={tr.id}
                onPress={() => setDayType(day, tr.id)}
                style={{
                  paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10,
                  borderWidth: 1,
                  borderColor: type === tr.id ? colors.accent : colors.border,
                  backgroundColor: type === tr.id ? colors.accentSoft : colors.card,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: type === tr.id ? colors.accent : colors.textMuted }}>
                  {tr.emoji} {t.trainingType[tr.id as keyof typeof t.trainingType]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ))}

      <NextButton onPress={onNext} label={t.common.continue} />
    </ScrollView>
  );
}

// ── Step 5: All set ──────────────────────────────────────────────────────────
function StepDone({ form, onFinish }: { form: any; onFinish: () => void }) {
  const t = useT();
  const tdee = calcTDEE(Number(form.weight), Number(form.height), Number(form.age), form.gender, form.activityLevel);
  const calories = calcCalorieTarget(tdee, form.goal);
  const protein = Math.round(Number(form.weight) * calcProteinPerKg(form.goal));
  const goalLabel = t.goal[form.goal as keyof typeof t.goal] ?? '';

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 24 }}>
      <Text style={{ fontSize: 52 }}>🎯</Text>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 30, fontWeight: '800', color: colors.text }}>{t.onboarding.step5_title}</Text>
        <Text style={{ fontSize: 15, color: colors.textMuted, textAlign: 'center' }}>{t.onboarding.step5_subtitle}</Text>
      </View>

      <View style={{ width: '100%', backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 20, gap: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 14, color: colors.textMuted }}>{t.onboarding.goal_label}</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.accent }}>{goalLabel}</Text>
        </View>
        <View style={{ height: 1, backgroundColor: colors.border }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 14, color: colors.textMuted }}>{t.onboarding.dailyCal}</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{calories} kcal</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 14, color: colors.textMuted }}>{t.onboarding.dailyProt}</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{protein}g</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 14, color: colors.textMuted }}>{t.onboarding.targetW}</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{form.targetWeight || form.weight} kg</Text>
        </View>
      </View>

      <Text style={{ fontSize: 12, color: colors.textDim, textAlign: 'center' }}>
        {t.onboarding.calcNote}
      </Text>

      <NextButton onPress={onFinish} label={t.onboarding.startTracking} />
    </View>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const router = useRouter();
  const { updateProfile, completeOnboarding, updateWeeklyPlan } = useAppStore();
  const t = useT();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    gender: 'male' as Gender,
    age: '',
    weight: '',
    height: '',
    activityLevel: 'moderate' as ActivityLevel,
    goal: 'recomp' as Goal,
    targetWeight: '',
  });
  const [weekPlan, setWeekPlan] = useState([
    { day: 'Monday', type: 'upper' },
    { day: 'Tuesday', type: 'lower' },
    { day: 'Wednesday', type: 'football' },
    { day: 'Thursday', type: 'upper' },
    { day: 'Friday', type: 'lower' },
    { day: 'Saturday', type: 'football' },
    { day: 'Sunday', type: 'rest' },
  ]);

  const set = (key: string) => (value: string) => setForm((f) => ({ ...f, [key]: value }));
  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);
  const progress = step === 0 ? 0 : (step / TOTAL_STEPS) * 100;

  const finish = () => {
    const weight = Number(form.weight);
    const height = Number(form.height);
    const age = Number(form.age);
    const tdee = calcTDEE(weight, height, age, form.gender, form.activityLevel);
    const calorieTarget = calcCalorieTarget(tdee, form.goal);
    const bf = estimateBF(weight, height, age, form.gender);
    const proteinPerKg = calcProteinPerKg(form.goal);

    updateProfile({
      weight,
      height,
      age,
      gender: form.gender,
      activityLevel: form.activityLevel,
      goal: form.goal,
      targetWeight: Number(form.targetWeight) || weight,
      tdee: calorieTarget,
      bodyFat: bf,
      targetBf: +Math.max(8, bf - 5).toFixed(2),
      proteinPerKg,
    });
    updateWeeklyPlan(weekPlan);
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {step > 0 && (
        <View style={{ paddingTop: 58, paddingHorizontal: 24, paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <TouchableOpacity onPress={back} style={{ paddingVertical: 4, paddingRight: 12 }}>
              <Text style={{ fontSize: 14, color: colors.textMuted, fontWeight: '600' }}>{t.common.back}</Text>
            </TouchableOpacity>
            <View style={{ backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '700' }}>{step} {t.onboarding.of} {TOTAL_STEPS}</Text>
            </View>
          </View>
          <View style={{ height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' }}>
            <View style={{ width: `${progress}%`, height: '100%', backgroundColor: colors.accent, borderRadius: 2 }} />
          </View>
        </View>
      )}

      {step === 0 && <StepWelcome onNext={next} />}
      {step === 1 && <StepBasicInfo form={form} set={set} onNext={next} />}
      {step === 2 && <StepActivity form={form} set={set} onNext={next} />}
      {step === 3 && <StepGoal form={form} set={set} onNext={next} />}
      {step === 4 && <StepWeeklyPlan weekPlan={weekPlan} setWeekPlan={setWeekPlan} onNext={next} />}
      {step === 5 && <StepDone form={form} onFinish={finish} />}
    </KeyboardAvoidingView>
  );
}
