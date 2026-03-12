import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/Colors';
import { supabase } from '@/utils/supabase';

type Status = 'idle' | 'loading' | 'sent' | 'not_found' | 'error';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) { setErrorMsg('Ingresa tu email.'); setStatus('error'); return; }
    if (!/\S+@\S+\.\S+/.test(trimmed)) { setErrorMsg('Email inválido.'); setStatus('error'); return; }

    setStatus('loading');
    setErrorMsg('');

    // Probe whether the email is registered by attempting sign-in with a
    // garbage password. Supabase returns 'Invalid login credentials' when the
    // email EXISTS (wrong password) and a different message / no-user error
    // when it does NOT exist (enumeration protection permitting).
    const { error: probeError } = await supabase.auth.signInWithPassword({
      email: trimmed,
      password: '__probe_only__',
    });

    const msg = probeError?.message ?? '';

    // "Invalid login credentials" → user exists, wrong password (expected)
    // "Email not confirmed"       → user exists, unconfirmed account
    // Any other string            → treat as not found / unknown
    const userExists =
      msg.toLowerCase().includes('invalid login credentials') ||
      msg.toLowerCase().includes('email not confirmed');

    if (!userExists) {
      setStatus('not_found');
      return;
    }

    // Email is registered — send the real reset link
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed);
    if (resetError) {
      setErrorMsg(resetError.message);
      setStatus('error');
      return;
    }

    setStatus('sent');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Back */}
        <TouchableOpacity
          onPress={() => router.replace('/login' as any)}
          style={styles.back}
        >
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
          <Text style={styles.subtitle}>
            Ingresa tu email y verificaremos si tienes una cuenta registrada.
          </Text>
        </View>

        {/* Sent state */}
        {status === 'sent' ? (
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>✉️</Text>
            <Text style={styles.successTitle}>Email enviado</Text>
            <Text style={styles.successText}>
              Revisa tu bandeja de entrada. Si el enlace no llega en unos minutos, revisa tu carpeta de spam.
            </Text>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => router.replace('/login' as any)}>
              <Text style={styles.btnPrimaryText}>Volver al inicio de sesión</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            {/* Email input */}
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  status === 'not_found' && { borderColor: colors.accent },
                ]}
                placeholder="tu@email.com"
                placeholderTextColor={colors.textDim}
                value={email}
                onChangeText={(v) => { setEmail(v); setStatus('idle'); setErrorMsg(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={status !== 'loading'}
              />
            </View>

            {/* Not found feedback */}
            {status === 'not_found' && (
              <View style={styles.warnBox}>
                <Text style={styles.warnText}>
                  ⚠️  No encontramos una cuenta con ese email. Verifica que lo escribiste correctamente o{' '}
                  <Text style={styles.warnLink} onPress={() => router.push('/register' as any)}>
                    crea una cuenta nueva.
                  </Text>
                </Text>
              </View>
            )}

            {/* Error feedback */}
            {status === 'error' && errorMsg ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️  {errorMsg}</Text>
              </View>
            ) : null}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.btnPrimary, status === 'loading' && { opacity: 0.65 }]}
              onPress={handleSubmit}
              disabled={status === 'loading'}
            >
              <Text style={styles.btnPrimaryText}>
                {status === 'loading' ? 'Verificando…' : 'Enviar enlace de recuperación'}
              </Text>
            </TouchableOpacity>

            {/* Register link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>¿No tienes cuenta?</Text>
              <TouchableOpacity onPress={() => router.push('/register' as any)}>
                <Text style={styles.footerLink}> Regístrate</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

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
  header: { marginBottom: 32, gap: 10 },
  title: { fontSize: 30, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: colors.textMuted, lineHeight: 22 },
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
  warnBox: {
    backgroundColor: `${colors.accent}18`,
    borderWidth: 1,
    borderColor: `${colors.accent}40`,
    borderRadius: 14,
    padding: 14,
  },
  warnText: { fontSize: 13, color: colors.textMuted, lineHeight: 20 },
  warnLink: { color: colors.accent, fontWeight: '700' },
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
    marginTop: 4,
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
    paddingTop: 8,
  },
  footerText: { fontSize: 14, color: colors.textMuted },
  footerLink: { fontSize: 14, color: colors.accent, fontWeight: '700' },
  successBox: {
    alignItems: 'center',
    gap: 16,
    paddingTop: 20,
  },
  successIcon: { fontSize: 52 },
  successTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  successText: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
});
