import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import AnimatedScreen from '../components/AnimatedScreen';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, radius } from '../constants/theme';
import { validateRM } from '../utils/validators';

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors } = useTheme();
  const [rm, setRm] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  function handleRmChange(value) {
    setRm(value.replace(/\D/g, ''));
    setErrors((current) => ({ ...current, rm: '', credentials: '' }));
  }

  function handlePasswordChange(value) {
    setPassword(value);
    setErrors((current) => ({ ...current, password: '', credentials: '' }));
  }

  function validateForm() {
    const nextErrors = {};

    if (!validateRM(rm)) {
      nextErrors.rm = 'Informe um RM contendo apenas numeros.';
    }

    if (!password.trim()) {
      nextErrors.password = 'Informe a sua senha.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleLogin() {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await login({ rm: rm.trim(), password });
      router.replace('/');
    } catch (error) {
      const message = error.message || 'Nao foi possivel iniciar a sessao.';
      setErrors((current) => ({ ...current, credentials: message }));
      setToast({
        visible: true,
        message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatedScreen>
      <KeyboardAvoidingView
        style={[styles.screen, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast((current) => ({ ...current, visible: false }))}
        />
        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <View style={styles.brandBlock}>
            <Image
              source={require('../assets/fiap-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.eyebrow, { color: colors.primary }]}>Acesso</Text>
            <Text style={[styles.title, { color: colors.text }]}>Entrar no FIAP Campus Helper</Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              Use o RM cadastrado para acessar reservas, servicos internos e itens registrados.
            </Text>
          </View>

          <View style={styles.form}>
            <CustomInput
              label="RM"
              value={rm}
              onChangeText={handleRmChange}
              placeholder="Digite seu RM"
              icon="id-card-outline"
              keyboardType="number-pad"
              error={errors.rm}
            />
            <CustomInput
              label="Senha"
              value={password}
              onChangeText={handlePasswordChange}
              placeholder="Digite sua senha"
              icon="lock-closed-outline"
              secureTextEntry
              error={errors.password}
            />
            {errors.credentials ? (
              <Text style={[styles.formError, { color: colors.error }]}>{errors.credentials}</Text>
            ) : null}
            <CustomButton title="Entrar" onPress={handleLogin} loading={loading} />
          </View>

          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={[styles.link, { color: colors.primary }]}>
              Ainda nao tem conta? Criar cadastro
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logo: {
    width: 190,
    height: 64,
    marginBottom: spacing.lg,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  title: {
    ...typography.h1,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  text: {
    ...typography.body,
    marginTop: spacing.sm,
    lineHeight: 22,
    textAlign: 'center',
  },
  form: {
    marginTop: spacing.xl,
  },
  formError: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: -4,
    marginBottom: spacing.sm,
  },
  link: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.md,
  },
});
