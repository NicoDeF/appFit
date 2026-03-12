import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/Colors';
import { useAppStore } from '@/store/useAppStore';
import { useT } from '@/constants/i18n';

export default function PaywallScreen() {
  const [selected, setSelected] = useState('annual');
  const router = useRouter();
  const setPremium = useAppStore((s) => s.setPremium);
  const t = useT();

  const PLANS = [
    {
      id: 'annual',
      label: t.paywall.annual,
      price: '$39.99',
      perMonth: t.paywall.perMonth_annual,
      badge: t.paywall.popular,
      highlight: true,
    },
    {
      id: 'monthly',
      label: t.paywall.monthly,
      price: '$6.99',
      perMonth: t.paywall.perMonth_monthly,
      badge: null,
      highlight: false,
    },
  ];

  const FEATURES = [
    { emoji: '📸', text: t.paywall.feature1 },
    { emoji: '🤖', text: t.paywall.feature2 },
    { emoji: '🍽️', text: t.paywall.feature3 },
    { emoji: '📊', text: t.paywall.feature4 },
    { emoji: '⏱️', text: t.paywall.feature5 },
    { emoji: '💧', text: t.paywall.feature6 },
  ];

  const handleSubscribe = () => {
    // TODO: integrate with RevenueCat or Stripe for real payments
    setPremium(true);
    router.back();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 24, paddingBottom: 48, gap: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ alignItems: 'center', gap: 8, marginTop: 16 }}>
        <View style={{
          width: 56, height: 56, borderRadius: 16,
          backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#fff' }}>F</Text>
        </View>
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.text, textAlign: 'center' }}>
          {t.paywall.title}
        </Text>
        <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 }}>
          {t.paywall.subtitle}
        </Text>
      </View>

      {/* Features */}
      <View style={{ backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 20, gap: 12 }}>
        {FEATURES.map((f, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 20 }}>{f.emoji}</Text>
            <Text style={{ fontSize: 14, color: colors.text, fontWeight: '500' }}>{f.text}</Text>
          </View>
        ))}
      </View>

      {/* Plans */}
      <View style={{ gap: 10 }}>
        {PLANS.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            onPress={() => setSelected(plan.id)}
            style={{
              borderRadius: 14,
              borderWidth: 2,
              borderColor: selected === plan.id ? colors.accent : colors.border,
              backgroundColor: selected === plan.id ? colors.accentSoft : colors.card,
              padding: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={{ gap: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: selected === plan.id ? colors.accent : colors.text }}>
                  {plan.label}
                </Text>
                {plan.badge && (
                  <View style={{ backgroundColor: colors.accent, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#fff' }}>{plan.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>{plan.perMonth}</Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: selected === plan.id ? colors.accent : colors.text }}>
              {plan.price}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity
        onPress={handleSubscribe}
        style={{
          backgroundColor: colors.accent,
          borderRadius: 14,
          padding: 16,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff' }}>
          {t.paywall.trialBtn}
        </Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
          {t.paywall.cancelNote}
        </Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 11, color: colors.textDim, textAlign: 'center', lineHeight: 16 }}>
        {t.paywall.termsNote}
      </Text>
    </ScrollView>
  );
}
