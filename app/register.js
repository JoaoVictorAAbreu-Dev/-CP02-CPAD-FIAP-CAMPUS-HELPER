import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import AnimatedScreen from '../components/AnimatedScreen';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, radius } from '../constants/theme';
import { validateName, validatePassword, validateRM } from '../utils/validators';

export default function RegisterScreen() {
  const { register } = useAuth();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [rm, setRm] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  function handleNameChange(value) {
    setName(value);
    setErrors((current) => ({ ...current, name: '', register: '' }));
  }

  function handleRmChange(value) {
    setRm(value.replace(/\D/g, ''));
    setErrors((current) => ({ ...current, rm: '', register: '' }));
  }

  function handlePasswordChange(value) {
    setPassword(value);
    setErrors((current) => ({ ...current, password: '', register: '' }));
  }

  function validateForm() {
    const nextErrors = {};

    if (!validateName(name)) {
      nextErrors.name = 'Informe um nome valido com letras e pelo menos 2 caracteres.';
    }

    if (!validateRM(rm)) {
      nextErrors.rm = 'Informe um RM contendo apenas numeros.';
    }

    if (!validatePassword(password)) {
      nextErrors.password = 'A senha deve ter no minimo 6 caracteres.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleRegister() {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await register({ name: name.trim(), rm: rm.trim(), password });
      router.replace('/');
    } catch (error) {
      const message = error.message || 'Nao foi possivel concluir o cadastro.';
      setErrors((current) => ({ ...current, register: message }));
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
          <Text style={[styles.eyebrow, { color: colors.primary }]}>Cadastro</Text>
          <Text style={[styles.title, { color: colors.text }]}>Criar conta de acesso</Text>
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            O cadastro fica salvo localmente para testes no Expo Go e demonstra a integracao com SecureStore.
          </Text>

          <View style={styles.form}>
            <CustomInput
              label="Nome"
              value={name}
              onChangeText={handleNameChange}
              placeholder="Digite seu nome"
              icon="person-outline"
              autoCapitalize="words"
              error={errors.name}
            />
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
              placeholder="Crie uma senha"
              icon="lock-closed-outline"
              secureTextEntry
              error={errors.password}
            />
            {errors.register ? (
              <Text style={[styles.formError, { color: colors.error }]}>{errors.register}</Text>
            ) : null}
            <CustomButton title="Concluir cadastro" onPress={handleRegister} loading={loading} />
          </View>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.link, { color: colors.primary }]}>Voltar para o login</Text>
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
