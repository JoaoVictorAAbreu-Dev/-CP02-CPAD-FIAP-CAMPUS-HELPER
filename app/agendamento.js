import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AnimatedScreen from '../components/AnimatedScreen';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, radius } from '../constants/theme';
import { validateRequired } from '../utils/validators';

export default function SchedulingScreen() {
  const params = useLocalSearchParams();
  const defaultRoom = typeof params.sala === 'string' ? params.sala : '';
  const { user } = useAuth();
  const { reservas, addReserva } = useAppData();
  const { colors } = useTheme();
  const [sala, setSala] = useState(defaultRoom);
  const [data, setData] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [finalidade, setFinalidade] = useState('');
  const [search, setSearch] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const sortedReservas = useMemo(
    () => [...reservas].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [reservas]
  );

  const filteredReservas = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) {
      return sortedReservas;
    }

    return sortedReservas.filter((reserva) =>
      [reserva.sala, reserva.data, reserva.periodo, reserva.finalidade, reserva.responsavel]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch))
    );
  }, [search, sortedReservas]);

  function handleDateChange(value) {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;

    if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    }

    setData(formatted);
    setErrors((current) => ({ ...current, data: '', conflict: '' }));
  }

  function handlePeriodoChange(value) {
    setPeriodo(value);
    setErrors((current) => ({ ...current, periodo: '', conflict: '' }));
  }

  function handleSalaChange(value) {
    setSala(value);
    setErrors((current) => ({ ...current, sala: '', conflict: '' }));
  }

  function handleFinalidadeChange(value) {
    setFinalidade(value);
    setErrors((current) => ({ ...current, finalidade: '', conflict: '' }));
  }

  function isValidDate(value) {
    return /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(value);
  }

  function isValidPeriod(value) {
    return /^([01]\d|2[0-3])h([0-5]\d)\s?-\s?([01]\d|2[0-3])h([0-5]\d)$/.test(value.trim());
  }

  function hasConflict() {
    const normalizedRoom = sala.trim().toLowerCase();
    const normalizedDate = data.trim();
    const normalizedPeriod = periodo.trim().replace(/\s+/g, ' ');

    return reservas.some(
      (reserva) =>
        reserva.sala?.trim().toLowerCase() === normalizedRoom &&
        reserva.data?.trim() === normalizedDate &&
        reserva.periodo?.trim().replace(/\s+/g, ' ') === normalizedPeriod
    );
  }

  function validateForm() {
    const nextErrors = {};

    if (!validateRequired(sala)) {
      nextErrors.sala = 'Informe a sala desejada.';
    }
    if (!isValidDate(data)) {
      nextErrors.data = 'Use o formato DD/MM/AAAA.';
    }
    if (!isValidPeriod(periodo)) {
      nextErrors.periodo = 'Use o formato 19h00 - 21h00.';
    }
    if (!validateRequired(finalidade)) {
      nextErrors.finalidade = 'Descreva a finalidade da reserva.';
    }
    if (Object.keys(nextErrors).length === 0 && hasConflict()) {
      nextErrors.conflict = 'Ja existe uma reserva para a mesma sala, data e periodo.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleCreateReserva() {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await addReserva({
        sala: sala.trim(),
        data: data.trim(),
        periodo: periodo.trim().replace(/\s+/g, ' '),
        finalidade: finalidade.trim(),
        responsavel: user?.name || 'Usuario FIAP',
        createdAt: new Date().toISOString(),
      });
      setData('');
      setPeriodo('');
      setFinalidade('');
      setErrors({});
      setToast({ visible: true, message: 'Reserva registrada com sucesso.', type: 'success' });
    } catch (error) {
      setToast({ visible: true, message: 'Nao foi possivel salvar a reserva.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatedScreen>
      <ScrollView
        style={[styles.screen, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast((current) => ({ ...current, visible: false }))}
        />

        <Text style={[styles.title, { color: colors.text }]}>Agendamento de salas</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Registre reservas localmente para simular a operacao no campus.
        </Text>

        <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <CustomInput
            label="Sala"
            value={sala}
            onChangeText={handleSalaChange}
            placeholder="Ex.: Sala 305"
            icon="business-outline"
            error={errors.sala}
          />
          <CustomInput
            label="Data"
            value={data}
            onChangeText={handleDateChange}
            placeholder="Ex.: 10/05/2026"
            icon="calendar-outline"
            keyboardType="number-pad"
            error={errors.data}
          />
          <CustomInput
            label="Periodo"
            value={periodo}
            onChangeText={handlePeriodoChange}
            placeholder="Ex.: 19h00 - 21h00"
            icon="time-outline"
            error={errors.periodo}
          />
          <CustomInput
            label="Finalidade"
            value={finalidade}
            onChangeText={handleFinalidadeChange}
            placeholder="Ex.: Reuniao de projeto"
            icon="document-text-outline"
            error={errors.finalidade}
          />
          {errors.conflict ? (
            <Text style={[styles.formError, { color: colors.error }]}>{errors.conflict}</Text>
          ) : null}
          <CustomButton title="Salvar reserva" onPress={handleCreateReserva} loading={loading} />
        </View>

        <View style={styles.listSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Reservas registradas</Text>
          <CustomInput
            label="Buscar reservas"
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por sala, data, periodo ou finalidade"
            icon="search-outline"
            autoCapitalize="none"
          />
          {filteredReservas.length === 0 ? (
            <EmptyState
              message={
                sortedReservas.length === 0
                  ? 'Nenhuma reserva registrada ate o momento.'
                  : 'Nenhuma reserva encontrada para a busca informada.'
              }
              icon="calendar-clear-outline"
            />
          ) : (
            filteredReservas.map((reserva) => (
              <View
                key={reserva.id}
                style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={[styles.listTitle, { color: colors.text }]}>{reserva.sala}</Text>
                <Text style={[styles.listText, { color: colors.textSecondary }]}>
                  {reserva.data} - {reserva.periodo}
                </Text>
                <Text style={[styles.listText, { color: colors.textSecondary }]}>
                  {reserva.finalidade} - {reserva.responsavel}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.h1,
  },
  subtitle: {
    ...typography.body,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  formError: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: -4,
    marginBottom: spacing.sm,
  },
  listSection: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  listCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  listTitle: {
    ...typography.h3,
  },
  listText: {
    ...typography.caption,
    lineHeight: 18,
  },
});
