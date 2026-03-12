import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/Colors';
import { useT } from '@/constants/i18n';
import { AppLogo } from '@/components/ui/AppLogo';

const FEATURES = [
  'Objetivo diario de calorías y proteína',
  'Registro inteligente de comidas',
  'Seguimiento corporal a lo largo del tiempo',
  'Análisis corporal con inteligencia artificial',
];

export default function WelcomeScreen() {
  const t = useT();
  const router = useRouter();

  const topAnim   = useRef(new Animated.Value(0)).current;
  const heroAnim  = useRef(new Animated.Value(0)).current;
  const listAnim  = useRef(new Animated.Value(0)).current;
  const btnsAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(topAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(heroAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(listAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(btnsAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const slideUp = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [32, 0] }) }],
  });

  // Split tagline into two lines for big display
  const [line1, line2] = t.welcome.tagline.split('\n');

  return (
    <View style={styles.container}>
      {/* Background glows */}
      <View style={styles.glow1} pointerEvents="none" />
      <View style={styles.glow2} pointerEvents="none" />

      {/* Brand */}
      <Animated.View style={[styles.brand, slideUp(topAnim)]}>
        <AppLogo size={38} />
        <Text style={styles.brandName}>appFIT</Text>
      </Animated.View>

      {/* Hero headline */}
      <Animated.View style={[styles.hero, slideUp(heroAnim)]}>
        <Text style={styles.headline1}>{line1}</Text>
        <Text style={styles.headline2}>{line2}</Text>
        <View style={styles.accentBar} />
      </Animated.View>

      {/* Feature list */}
      <Animated.View style={[styles.featureList, slideUp(listAnim)]}>
        {FEATURES.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <View style={[styles.featureDot, i === 0 && { backgroundColor: colors.accent }]} />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </Animated.View>

      {/* CTAs */}
      <Animated.View style={[styles.footer, slideUp(btnsAnim)]}>
        <TouchableOpacity style={styles.btnPrimary} activeOpacity={0.85} onPress={() => router.push('/register' as any)}>
          <Text style={styles.btnPrimaryText}>{t.welcome.getStarted}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} activeOpacity={0.7} onPress={() => router.push('/login' as any)}>
          <Text style={styles.btnSecondaryText}>{t.welcome.signIn}</Text>
        </TouchableOpacity>
        <Text style={styles.terms}>{t.welcome.terms}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 28,
    paddingTop: 68,
    paddingBottom: 40,
  },

  // Background
  glow1: {
    position: 'absolute',
    top: -80,
    left: -100,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: colors.accent,
    opacity: 0.07,
  },
  glow2: {
    position: 'absolute',
    bottom: 60,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.blue,
    opacity: 0.05,
  },

  // Brand
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 48,
  },
  brandName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },

  // Headline
  hero: {
    marginBottom: 40,
  },
  headline1: {
    fontSize: 58,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -2.5,
    lineHeight: 60,
    textTransform: 'uppercase',
  },
  headline2: {
    fontSize: 58,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: -2.5,
    lineHeight: 62,
    textTransform: 'uppercase',
    marginBottom: 22,
  },
  accentBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },

  // Features
  featureList: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textDim,
  },
  featureText: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '500',
    flex: 1,
    lineHeight: 22,
  },

  // Footer
  footer: {
    gap: 10,
    paddingTop: 24,
  },
  btnPrimary: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    padding: 19,
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 22,
    elevation: 10,
  },
  btnPrimaryText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.2,
  },
  btnSecondary: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  btnSecondaryText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  terms: {
    fontSize: 11,
    color: colors.textDim,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
});
