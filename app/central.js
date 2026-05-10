import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedScreen from '../components/AnimatedScreen';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import EmptyState from '../components/EmptyState';
import KeyboardAwareScreen from '../components/KeyboardAwareScreen';
import Toast from '../components/Toast';
import { priorityLevels, serviceAreas } from '../constants/campusData';
import { spacing, typography, radius } from '../constants/theme';
import { useAppData } from '../context/AppDataContext';
import { useTheme } from '../context/ThemeContext';
import { validateRequired } from '../utils/validators';

const FILTERS = [
  { label: 'Abertos', value: 'active' },
  { label: 'Resolvidos', value: 'resolved' },
  { label: 'Todos', value: 'all' },
];

const statusLabels = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  aguardando: 'Aguardando retorno',
  resolvido: 'Resolvido',
};

export default function CentralScreen() {
  const { colors } = useTheme();
  const { tickets, addTicket, advanceTicketStatus } = useAppData();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState(serviceAreas[0]);
  const [priority, setPriority] = useState(priorityLevels[1]);
  const [filter, setFilter] = useState('active');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const activeCount = tickets.filter((ticket) => ticket.status !== 'resolvido').length;
  const resolvedCount = tickets.filter((ticket) => ticket.status === 'resolvido').length;

  const filteredTickets = useMemo(() => {
    if (filter === 'resolved') {
      return tickets.filter((ticket) => ticket.status === 'resolvido');
    }

    if (filter === 'active') {
      return tickets.filter((ticket) => ticket.status !== 'resolvido');
    }

    return tickets;
  }, [filter, tickets]);

  async function handleCreateTicket() {
    if (!validateRequired(title) || !validateRequired(description)) {
      setToast({ visible: true, message: 'Preencha titulo e descricao do chamado.', type: 'warning' });
      return;
    }

    try {
      setLoading(true);
      await addTicket({
        title: title.trim(),
        description: description.trim(),
        area,
        priority,
      });
      setTitle('');
      setDescription('');
      setArea(serviceAreas[0]);
      setPriority(priorityLevels[1]);
      setToast({ visible: true, message: 'Chamado criado com sucesso.', type: 'success' });
    } catch (error) {
      setToast({ visible: true, message: 'Nao foi possivel abrir o chamado.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status) {
    if (status === 'resolvido') {
      return colors.success;
    }

    if (status === 'aguardando') {
      return colors.warning;
    }

    return colors.info;
  }

  function getPriorityTone(level) {
    if (level === 'Alta') {
      return colors.errorSoft;
    }

    if (level === 'Media') {
      return colors.warningSoft;
    }

    return colors.infoSoft;
  }

  return (
    <AnimatedScreen>
      <KeyboardAwareScreen backgroundColor={colors.background} contentContainerStyle={styles.content}>
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast((current) => ({ ...current, visible: false }))}
        />

        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>Central de servicos</Text>
          <Text style={[styles.title, { color: colors.text }]}>Abra chamados e acompanhe atendimentos</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Secretaria, TI, biblioteca e infraestrutura em uma fila organizada e facil de acompanhar.
          </Text>

          <View style={styles.metricsRow}>
            <MetricCard label="Ativos" value={String(activeCount)} colors={colors} />
            <MetricCard label="Resolvidos" value={String(resolvedCount)} colors={colors} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Novo chamado</Text>
          <CustomInput
            label="Titulo"
            value={title}
            onChangeText={setTitle}
            placeholder="Ex.: Computador do laboratorio sem acesso a internet"
            icon="build-outline"
          />
          <CustomInput
            label="Descricao"
            value={description}
            onChangeText={setDescription}
            placeholder="Explique o contexto e o que precisa ser resolvido"
            icon="document-text-outline"
            multiline
            numberOfLines={4}
          />

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Area</Text>
          <View style={styles.chipsRow}>
            {serviceAreas.map((item) => {
              const selected = area === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? colors.primary : colors.inputBg,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setArea(item)}
                >
                  <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : colors.text }]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Prioridade</Text>
          <View style={styles.chipsRow}>
            {priorityLevels.map((item) => {
              const selected = priority === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? colors.primary : colors.inputBg,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setPriority(item)}
                >
                  <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : colors.text }]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <CustomButton title="Abrir chamado" onPress={handleCreateTicket} loading={loading} />
        </View>

        <View style={styles.listSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Fila de atendimento</Text>
            <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
              Atualize o status conforme o atendimento evolui.
            </Text>
          </View>

          <View style={styles.chipsRow}>
            {FILTERS.map((item) => {
              const selected = filter === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? colors.primary : colors.inputBg,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setFilter(item.value)}
                >
                  <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : colors.text }]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {filteredTickets.length === 0 ? (
            <EmptyState
              title="Nenhum chamado por enquanto"
              message="Abra o primeiro ticket para acompanhar demandas academicas e operacionais daqui."
              icon="headset-outline"
            />
          ) : (
            filteredTickets.map((ticket) => (
              <View
                key={ticket.id}
                style={[styles.ticketCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.ticketTopRow}>
                  <View style={styles.ticketBody}>
                    <Text style={[styles.ticketTitle, { color: colors.text }]}>{ticket.title}</Text>
                    <Text style={[styles.ticketMeta, { color: colors.textSecondary }]}>
                      {ticket.area} - prioridade {ticket.priority}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: getPriorityTone(ticket.priority), borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: colors.text }]}>{ticket.priority}</Text>
                  </View>
                </View>

                <Text style={[styles.ticketDescription, { color: colors.textSecondary }]}>
                  {ticket.description}
                </Text>

                <View style={styles.ticketFooter}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(ticket.status), borderColor: getStatusColor(ticket.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>{statusLabels[ticket.status]}</Text>
                  </View>

                  {ticket.status !== 'resolvido' ? (
                    <TouchableOpacity onPress={() => advanceTicketStatus(ticket.id)}>
                      <Text style={[styles.advanceLink, { color: colors.primary }]}>Avancar status</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </View>
      </KeyboardAwareScreen>
    </AnimatedScreen>
  );
}

function MetricCard({ label, value, colors }) {
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.inputBg }]}>
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  title: {
    ...typography.h1,
    marginTop: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  metricCard: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  metricLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  sectionHeader: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
  },
  sectionHint: {
    ...typography.caption,
  },
  fieldLabel: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listSection: {
    gap: spacing.sm,
  },
  ticketCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  ticketTopRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  ticketBody: {
    flex: 1,
    gap: spacing.xs,
  },
  ticketTitle: {
    ...typography.h4,
  },
  ticketMeta: {
    ...typography.caption,
  },
  badge: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ticketDescription: {
    ...typography.body,
    lineHeight: 22,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  advanceLink: {
    fontSize: 13,
    fontWeight: '700',
  },
});
