import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { colors } from '@/constants/Colors';
import { supabase } from '@/utils/supabase';
import { useT } from '@/constants/i18n';
import * as AuthSession from 'expo-auth-session';

export default function RegisterScreen() {
  const router = useRouter();
  const t = useT();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);

  const handleRegister = async () => {
    setError('');
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError(t.register.mismatch);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: name.trim() },
        },
      });
      if (authError) throw authError;
      setRegistered(true);
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
        }
      }
    } catch (e: any) {
      setError(e.message ?? 'Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const strengthLevel =
    password.length === 0 ? 0 :
    password.length < 6 ? 1 :
    password.length < 10 ? 2 : 3;

  const strengthColor = [colors.textDim, colors.accent, colors.yellow, colors.green][strengthLevel];
  const strengthLabel = ['', t.register.tooShort, t.register.fair, t.register.strong][strengthLevel];

  const isValid = name && email && password && confirmPassword;

  if (registered) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 24 }}>
        <Text style={{ fontSize: 64 }}>📧</Text>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, textAlign: 'center' }}>
            {t.register.confirmTitle}
          </Text>
          <Text style={{ fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 24 }}>
            {t.register.emailSentTo}
          </Text>
          <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 18 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{email.trim().toLowerCase()}</Text>
          </View>
          <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginTop: 4 }}>
            {t.register.openEmail}
          </Text>
        </View>

        <View style={{ width: '100%', backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 4 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textDim, marginBottom: 8, letterSpacing: 0.5 }}>
            {t.register.notArrived}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 20 }}>
            {t.register.spamTip}{'\n'}
            {t.register.timeTip}{'\n'}
            {t.register.typoTip}
          </Text>
        </View>

        <TouchableOpacity
          style={{ width: '100%', backgroundColor: colors.accent, borderRadius: 16, padding: 18, alignItems: 'center', shadowColor: colors.accent, shadowOpacity: 0.3, shadowRadius: 14, elevation: 6 }}
          onPress={() => router.replace('/login')}
        >
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff' }}>{t.register.confirmedBtn}</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          <Text style={styles.title}>{t.register.title}</Text>
          <Text style={styles.subtitle}>{t.register.subtitle}</Text>
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
          <Text style={styles.dividerText}>{t.register.orEmail}</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>{t.register.name}</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor={colors.textDim}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t.register.email}</Text>
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

          <View style={styles.field}>
            <Text style={styles.label}>{t.register.password}</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0 }]}
                placeholder="Min. 6 characters"
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

          {/* Strength indicator */}
          {password.length > 0 && (
            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', gap: 5 }}>
                {[1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={{
                      flex: 1, height: 4, borderRadius: 2,
                      backgroundColor: strengthLevel >= i ? strengthColor : colors.border,
                    }}
                  />
                ))}
              </View>
              <Text style={{ fontSize: 12, color: strengthColor, fontWeight: '600' }}>{strengthLabel}</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>{t.register.confirmPassword}</Text>
            <TextInput
              style={[
                styles.input,
                confirmPassword && password !== confirmPassword && styles.inputError,
              ]}
              placeholder="Repeat your password"
              placeholderTextColor={colors.textDim}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            {confirmPassword && password !== confirmPassword && (
              <Text style={{ fontSize: 12, color: colors.accent, marginTop: 4 }}>{t.register.mismatch}</Text>
            )}
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️  {error}</Text>
            </View>
          ) : null}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.btnPrimary, (!isValid || loading) && { opacity: 0.55 }]}
            onPress={handleRegister}
            disabled={!isValid || loading || googleLoading}
          >
            <Text style={styles.btnPrimaryText}>
              {loading ? t.common.loading : t.register.createBtn}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t.register.hasAccount}</Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>{t.register.signInLink}</Text>
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
  inputError: {
    borderColor: colors.accent,
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
