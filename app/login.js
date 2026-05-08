import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { validateRM } from '../utils/validators';
import { spacing, typography, radius } from '../constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors } = useTheme();
  const [rm, setRm] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  function handleRmChange(value) {
    setRm(value.replace(/\D/g, ''));
  }

  async function handleLogin() {
    if (!validateRM(rm) || !password.trim()) {
      setToast({ visible: true, message: 'Informe um RM numerico e a senha.', type: 'warning' });
      return;
    }

    try {
      setLoading(true);
      await login({ rm: rm.trim(), password });
      router.replace('/');
    } catch (error) {
      setToast({
        visible: true,
        message: error.message || 'Nao foi possivel iniciar a sessao.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
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

        <View style={styles.form}>
          <CustomInput
            label="RM"
            value={rm}
            onChangeText={handleRmChange}
            placeholder="Digite seu RM"
            icon="id-card-outline"
            keyboardType="number-pad"
          />
          <CustomInput
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="Digite sua senha"
            icon="lock-closed-outline"
            secureTextEntry
          />
          <CustomButton title="Entrar" onPress={handleLogin} loading={loading} />
        </View>

        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={[styles.link, { color: colors.primary }]}>
            Ainda nao tem conta? Criar cadastro
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  logo: {
    width: 96,
    height: 32,
    marginBottom: spacing.md,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.h1,
    marginTop: spacing.sm,
  },
  text: {
    ...typography.body,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  form: {
    marginTop: spacing.xl,
  },
  link: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.md,
  },
});
