import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { colors } from '@/constants/Colors';
import { supabase } from '@/utils/supabase';
import { useAppStore } from '@/store/useAppStore';
import { useT } from '@/constants/i18n';
import * as AuthSession from 'expo-auth-session';

export default function LoginScreen() {
  const router = useRouter();
  const t = useT();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (authError) throw authError;
      // Existing users signing in skip onboarding — only new registrations go through it
      completeOnboarding();
      // _layout.tsx onAuthStateChange will handle navigation
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const redirectTo = AuthSession.makeRedirectUri();
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (authError) throw authError;
      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, { showInRecents: true });
        if (result.type === 'success') {
          const { error: sessionError } = await supabase.auth.exchangeCodeForSession(result.url);
          if (sessionError) throw sessionError;
          completeOnboarding();
        }
      }
    } catch (e: any) {
      setError(e.message ?? 'Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t.common.back}</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t.login.title}</Text>
          <Text style={styles.subtitle}>{t.login.subtitle}</Text>
        </View>

        {/* Google SSO */}
        <TouchableOpacity
          style={[styles.btnGoogle, googleLoading && { opacity: 0.65 }]}
          onPress={handleGoogleLogin}
          disabled={googleLoading || loading}
        >
          <View style={styles.googleIcon}>
            <Text style={styles.googleIconText}>G</Text>
          </View>
          <Text style={styles.btnGoogleText}>
            {googleLoading ? t.common.loading : t.login.googleBtn}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t.login.orEmail}</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>{t.login.email}</Text>
            <TextInput
              style={styles.input}
              placeholder="you@email.com"
              placeholderTextColor={colors.textDim}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <View style={styles.field}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.label}>{t.login.password}</Text>
              <TouchableOpacity onPress={() => router.push('/forgot-password' as any)}>
                <Text style={styles.forgot}>{t.login.forgotPassword}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0 }]}
                placeholder="••••••••"
                placeholderTextColor={colors.textDim}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️  {error}</Text>
            </View>
          ) : null}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.btnPrimary, loading && { opacity: 0.65 }]}
            onPress={handleLogin}
            disabled={loading || googleLoading}
          >
            <Text style={styles.btnPrimaryText}>
              {loading ? t.common.loading : t.login.signInBtn}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t.login.noAccount}</Text>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>{t.login.createOne}</Text>
            </TouchableOpacity>
          </Link>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingBottom: 40,
    paddingTop: 60,
  },
  back: { marginBottom: 36 },
  backText: { fontSize: 14, color: colors.textMuted, fontWeight: '600' },
  header: { marginBottom: 28, gap: 8 },
  title: { fontSize: 34, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: colors.textMuted },
  btnGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: { fontSize: 13, fontWeight: '800', color: '#4285F4' },
  btnGoogleText: { fontSize: 15, fontWeight: '700', color: colors.text },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 12, color: colors.textDim, fontWeight: '600' },
  form: { gap: 20 },
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 17,
    fontSize: 16,
    color: colors.text,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingRight: 8,
  },
  eyeBtn: { padding: 10 },
  eyeText: { fontSize: 18 },
  forgot: { fontSize: 13, color: colors.accent, fontWeight: '600' },
  errorBox: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: `${colors.accent}40`,
    borderRadius: 14,
    padding: 14,
  },
  errorText: { fontSize: 13, color: colors.accent },
  btnPrimary: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.accent,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  btnPrimaryText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 40,
  },
  footerText: { fontSize: 14, color: colors.textMuted },
  footerLink: { fontSize: 14, color: colors.accent, fontWeight: '700' },
});
