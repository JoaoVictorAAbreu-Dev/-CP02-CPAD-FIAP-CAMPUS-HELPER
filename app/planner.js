import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AnimatedScreen from '../components/AnimatedScreen';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import EmptyState from '../components/EmptyState';
import KeyboardAwareScreen from '../components/KeyboardAwareScreen';
import Toast from '../components/Toast';
import { plannerCategories } from '../constants/campusData';
import { spacing, typography, radius } from '../constants/theme';
import { useAppData } from '../context/AppDataContext';
import { useTheme } from '../context/ThemeContext';
import { validateRequired } from '../utils/validators';

const STATUS_FILTERS = [
  { label: 'Pendentes', value: 'pending' },
  { label: 'Concluidas', value: 'done' },
  { label: 'Todas', value: 'all' },
];

export default function PlannerScreen() {
  const { colors } = useTheme();
  const { tasks, addTask, toggleTaskStatus, removeTask } = useAppData();
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState(plannerCategories[0]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const dueDateRef = useRef(null);

  const pendingTasks = tasks.filter((task) => !task.done);
  const completedTasks = tasks.filter((task) => task.done);

  const filteredTasks = useMemo(() => {
    if (filter === 'done') {
      return tasks.filter((task) => task.done);
    }

    if (filter === 'pending') {
      return tasks.filter((task) => !task.done);
    }

    return tasks;
  }, [filter, tasks]);

  function handleDateChange(value) {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;

    if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }

    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    }

    setDueDate(formatted);
  }

  function isValidDate(value) {
    return /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(value);
  }

  async function handleCreateTask() {
    if (!validateRequired(title)) {
      setToast({ visible: true, message: 'Defina a entrega ou atividade principal.', type: 'warning' });
      return;
    }

    if (!isValidDate(dueDate)) {
      setToast({ visible: true, message: 'Use a data no formato DD/MM/AAAA.', type: 'warning' });
      return;
    }

    try {
      setLoading(true);
      await addTask({
        title: title.trim(),
        dueDate: dueDate.trim(),
        category,
      });
      setTitle('');
      setDueDate('');
      setCategory(plannerCategories[0]);
      setToast({ visible: true, message: 'Tarefa adicionada ao planner.', type: 'success' });
    } catch (error) {
      setToast({ visible: true, message: 'Nao foi possivel salvar a tarefa.', type: 'error' });
    } finally {
      setLoading(false);
    }
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

        <View style={[styles.heroCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>Planner academico</Text>
          <Text style={[styles.title, { color: colors.text }]}>Organize entregas e blocos de estudo</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Concentre tudo em um fluxo rapido para acompanhar prioridades e nao perder prazos.
          </Text>

          <View style={styles.metricsRow}>
            <MetricCard label="Pendentes" value={String(pendingTasks.length)} colors={colors} />
            <MetricCard label="Concluidas" value={String(completedTasks.length)} colors={colors} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Nova tarefa</Text>
          <CustomInput
            label="Titulo"
            value={title}
            onChangeText={setTitle}
            placeholder="Ex.: Finalizar apresentacao do checkpoint"
            icon="sparkles-outline"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => dueDateRef.current?.focus()}
          />
          <CustomInput
            ref={dueDateRef}
            label="Prazo"
            value={dueDate}
            onChangeText={handleDateChange}
            placeholder="Ex.: 20/05/2026"
            icon="calendar-outline"
            keyboardType="number-pad"
          />

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Categoria</Text>
          <View style={styles.chipsRow}>
            {plannerCategories.map((item) => {
              const selected = item === category;
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
                  onPress={() => setCategory(item)}
                >
                  <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : colors.text }]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <CustomButton title="Adicionar ao planner" onPress={handleCreateTask} loading={loading} />
        </View>

        <View style={styles.listSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Minha rotina</Text>
            <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
              Marque o que ja foi entregue ou estudado.
            </Text>
          </View>

          <View style={styles.chipsRow}>
            {STATUS_FILTERS.map((item) => {
              const selected = item.value === filter;
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

          {filteredTasks.length === 0 ? (
            <EmptyState
              title="Planner pronto para uso"
              message="Adicione suas entregas, blocos de estudo ou atividades de projeto para acompanhar tudo daqui."
              icon="library-outline"
            />
          ) : (
            filteredTasks.map((task) => (
              <View
                key={task.id}
                style={[
                  styles.taskCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: task.done ? colors.success : colors.border,
                  },
                ]}
              >
                <View style={styles.taskHeader}>
                  <TouchableOpacity
                    style={[
                      styles.checkButton,
                      {
                        backgroundColor: task.done ? colors.success : colors.inputBg,
                        borderColor: task.done ? colors.success : colors.border,
                      },
                    ]}
                    onPress={() => toggleTaskStatus(task.id)}
                  >
                    <Ionicons
                      name={task.done ? 'checkmark' : 'ellipse-outline'}
                      size={18}
                      color={task.done ? '#FFFFFF' : colors.textSecondary}
                    />
                  </TouchableOpacity>

                  <View style={styles.taskBody}>
                    <Text
                      style={[
                        styles.taskTitle,
                        { color: colors.text, textDecorationLine: task.done ? 'line-through' : 'none' },
                      ]}
                    >
                      {task.title}
                    </Text>
                    <Text style={[styles.taskMeta, { color: colors.textSecondary }]}>
                      {task.category} - prazo {task.dueDate}
                    </Text>
                  </View>

                  <TouchableOpacity onPress={() => removeTask(task.id)}>
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
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
    <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
    borderWidth: 1,
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
  taskCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskBody: {
    flex: 1,
    gap: spacing.xs,
  },
  taskTitle: {
    ...typography.h4,
  },
  taskMeta: {
    ...typography.caption,
  },
});
