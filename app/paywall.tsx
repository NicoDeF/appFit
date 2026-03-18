import { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { PurchasesPackage, PACKAGE_TYPE } from '@/utils/purchases';
import { colors } from '@/constants/Colors';
import { useAppStore } from '@/store/useAppStore';
import { useT } from '@/constants/i18n';
import { getOfferings, purchasePackage, restorePurchases } from '@/utils/purchases';

export default function PaywallScreen() {
  const [selected, setSelected] = useState<'annual' | 'monthly'>('annual');
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState('');
  const [annualPkg, setAnnualPkg] = useState<PurchasesPackage | null>(null);
  const [monthlyPkg, setMonthlyPkg] = useState<PurchasesPackage | null>(null);

  const router = useRouter();
  const { setPremium, language } = useAppStore();
  const t = useT();

  useEffect(() => {
    getOfferings().then((offering) => {
      if (!offering) return;
      const annual  = offering.availablePackages.find(p => p.packageType === PACKAGE_TYPE.ANNUAL)  ?? null;
      const monthly = offering.availablePackages.find(p => p.packageType === PACKAGE_TYPE.MONTHLY) ?? null;
      setAnnualPkg(annual);
      setMonthlyPkg(monthly);
    });
  }, []);

  const handleSubscribe = async () => {
    setError('');
    setLoading(true);
    try {
      const pkg = selected === 'annual' ? annualPkg : monthlyPkg;
      // RevenueCat not yet configured — grant premium directly for now
      if (!pkg) {
        setPremium(true);
        router.back();
        return;
      }
      const isPremium = await purchasePackage(pkg);
      if (isPremium) {
        setPremium(true);
        router.back();
      }
    } catch (e: any) {
      // USER_CANCELLED is not an error — just silently ignore
      if (!e?.userCancelled) {
        setError(e?.message ?? (language === 'es' ? 'Error al procesar el pago.' : 'Payment failed.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setError('');
    setRestoring(true);
    try {
      const isPremium = await restorePurchases();
      if (isPremium) {
        setPremium(true);
        router.back();
      } else {
        setError(language === 'es' ? 'No se encontraron compras activas.' : 'No active purchases found.');
      }
    } finally {
      setRestoring(false);
    }
  };

  // Prices: use real RC prices if packages loaded, else fall back to hardcoded
  const annualPrice  = annualPkg?.product.priceString  ?? '$39.99';
  const monthlyPrice = monthlyPkg?.product.priceString ?? '$6.99';
  const annualPerMonth = language === 'es' ? `${t.paywall.perMonth_annual}/mes` : t.paywall.perMonth_annual;

  const PLANS = [
    {
      id: 'annual' as const,
      label: t.paywall.annual,
      price: annualPrice,
      perMonth: annualPerMonth,
      badge: t.paywall.popular,
      highlight: true,
    },
    {
      id: 'monthly' as const,
      label: t.paywall.monthly,
      price: monthlyPrice,
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

  const busy = loading || restoring;

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
            disabled={busy}
            style={{
              borderRadius: 14, borderWidth: 2,
              borderColor: selected === plan.id ? colors.accent : colors.border,
              backgroundColor: selected === plan.id ? colors.accentSoft : colors.card,
              padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
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

      {/* Error */}
      {error ? (
        <View style={{ backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: `${colors.accent}40`, borderRadius: 12, padding: 14 }}>
          <Text style={{ fontSize: 13, color: colors.accent }}>⚠️  {error}</Text>
        </View>
      ) : null}

      {/* CTA */}
      <TouchableOpacity
        onPress={handleSubscribe}
        disabled={busy}
        style={{
          backgroundColor: colors.accent, borderRadius: 14, padding: 16, alignItems: 'center',
          opacity: busy ? 0.65 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff' }}>{t.paywall.trialBtn}</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{t.paywall.cancelNote}</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Restore purchases */}
      <TouchableOpacity onPress={handleRestore} disabled={busy} style={{ alignItems: 'center', paddingVertical: 4 }}>
        {restoring ? (
          <ActivityIndicator color={colors.textMuted} size="small" />
        ) : (
          <Text style={{ fontSize: 13, color: colors.textMuted, fontWeight: '600' }}>
            {language === 'es' ? 'Restaurar compras' : 'Restore purchases'}
          </Text>
        )}
      </TouchableOpacity>

      <Text style={{ fontSize: 11, color: colors.textDim, textAlign: 'center', lineHeight: 16 }}>
        {t.paywall.termsNote}
      </Text>
    </ScrollView>
  );
}
