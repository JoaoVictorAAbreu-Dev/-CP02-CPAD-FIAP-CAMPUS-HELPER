import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { validateRequired } from '../utils/validators';
import { spacing, typography, radius } from '../constants/theme';

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
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const sortedReservas = useMemo(
    () => [...reservas].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [reservas]
  );

  async function handleCreateReserva() {
    if (![sala, data, periodo, finalidade].every(validateRequired)) {
      setToast({ visible: true, message: 'Preencha todos os campos do agendamento.', type: 'warning' });
      return;
    }

    try {
      setLoading(true);
      await addReserva({
        sala: sala.trim(),
        data: data.trim(),
        periodo: periodo.trim(),
        finalidade: finalidade.trim(),
        responsavel: user?.name || 'Usuario FIAP',
        createdAt: new Date().toISOString(),
      });
      setData('');
      setPeriodo('');
      setFinalidade('');
      setToast({ visible: true, message: 'Reserva registrada com sucesso.', type: 'success' });
    } catch (error) {
      setToast({ visible: true, message: 'Nao foi possivel salvar a reserva.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
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
          onChangeText={setSala}
          placeholder="Ex.: Sala 305"
          icon="business-outline"
        />
        <CustomInput
          label="Data"
          value={data}
          onChangeText={setData}
          placeholder="Ex.: 10/05/2026"
          icon="calendar-outline"
        />
        <CustomInput
          label="Periodo"
          value={periodo}
          onChangeText={setPeriodo}
          placeholder="Ex.: 19h00 - 21h00"
          icon="time-outline"
        />
        <CustomInput
          label="Finalidade"
          value={finalidade}
          onChangeText={setFinalidade}
          placeholder="Ex.: Reuniao de projeto"
          icon="document-text-outline"
        />
        <CustomButton title="Salvar reserva" onPress={handleCreateReserva} loading={loading} />
      </View>

      <View style={styles.listSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Reservas registradas</Text>
        {sortedReservas.length === 0 ? (
          <EmptyState message="Nenhuma reserva registrada ate o momento." icon="calendar-clear-outline" />
        ) : (
          sortedReservas.map((reserva) => (
            <View
              key={reserva.id}
              style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={[styles.listTitle, { color: colors.text }]}>{reserva.sala}</Text>
              <Text style={[styles.listText, { color: colors.textSecondary }]}>
                {reserva.data} • {reserva.periodo}
              </Text>
              <Text style={[styles.listText, { color: colors.textSecondary }]}>
                {reserva.finalidade} • {reserva.responsavel}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
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
  },
});
