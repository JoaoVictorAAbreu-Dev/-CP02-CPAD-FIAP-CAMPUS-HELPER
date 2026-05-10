import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedScreen from '../components/AnimatedScreen';
import CustomButton from '../components/CustomButton';
import EmptyState from '../components/EmptyState';
import SkeletonCard from '../components/SkeletonCard';
import { campusAnnouncements } from '../constants/campusData';
import { spacing, typography, radius } from '../constants/theme';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const MODULES = [
  {
    title: 'Reservas',
    description: 'Veja ambientes, favoritos e disponibilidade.',
    icon: 'business-outline',
    route: '/salas',
  },
  {
    title: 'Planner',
    description: 'Controle entregas e blocos de estudo.',
    icon: 'library-outline',
    route: '/planner',
  },
  {
    title: 'Agendamentos',
    description: 'Acompanhe o historico das suas reservas.',
    icon: 'calendar-outline',
    route: '/agendamento',
  },
  {
    title: 'Central',
    description: 'Abra chamados para secretaria, TI e campus.',
    icon: 'headset-outline',
    route: '/central',
  },
  {
    title: 'Achados',
    description: 'Registre e acompanhe itens localizados.',
    icon: 'search-outline',
    route: '/achados',
  },
  {
    title: 'Perfil',
    description: 'Personalize sua experiencia e preferencias.',
    icon: 'person-circle-outline',
    route: '/perfil',
  },
];

function parseReservationDate(reserva) {
  if (!reserva?.data) {
    return null;
  }

  const [day, month, year] = reserva.data.split('/');
  if (!day || !month || !year) {
    return null;
  }

  const periodStart = String(reserva.periodo || '').split('-')[0]?.trim() || '08h00';
  const [hourPart, minutePart] = periodStart.replace('h', ':').split(':');
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hourPart), Number(minutePart || 0));
}

export default function HomeScreen() {
  const { user, loading: authLoading, logout } = useAuth();
  const { reservas, itens, tasks, tickets, favoriteRooms, preferences, loading: dataLoading } = useAppData();
  const { colors, toggleTheme, themeMode } = useTheme();

  const pendingTasks = tasks.filter((task) => !task.done);
  const activeTickets = tickets.filter((ticket) => ticket.status !== 'resolvido');

  const nextReserva = useMemo(() => {
    const now = new Date();

    return [...reservas]
      .sort((a, b) => {
        const aDate = parseReservationDate(a)?.getTime() || 0;
        const bDate = parseReservationDate(b)?.getTime() || 0;
        return aDate - bDate;
      })
      .find((reserva) => {
        const reservaDate = parseReservationDate(reserva);
        return reservaDate && reservaDate >= now;
      });
  }, [reservas]);

  const spotlightTasks = pendingTasks.slice(0, 2);

  if (authLoading || dataLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <AnimatedScreen>
      <ScrollView
        style={[styles.screen, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={themeMode === 'dark' ? ['#341321', '#0E0E0E'] : ['#FFE4EE', '#FFF7FA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroCard, { borderColor: colors.border }]}
        >
          <View style={styles.heroHeader}>
            <View style={styles.heroTextGroup}>
              <Text style={[styles.eyebrow, { color: colors.primary }]}>Campus command center</Text>
              <Text style={[styles.heroTitle, { color: colors.text }]}>Ola, {user.name}</Text>
              <Text style={[styles.heroText, { color: colors.textSecondary }]}>
                Hoje o seu foco esta em {preferences.preferredStudySlot.toLowerCase()} com {pendingTasks.length}{' '}
                prioridade(s) ainda abertas.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.themeButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={toggleTheme}
            >
              <Ionicons
                name={themeMode === 'dark' ? 'sunny-outline' : 'moon-outline'}
                size={20}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.metricsGrid}>
            <MetricCard label="Reservas" value={String(reservas.length)} icon="calendar-clear-outline" colors={colors} />
            <MetricCard label="Planner" value={String(pendingTasks.length)} icon="sparkles-outline" colors={colors} />
            <MetricCard label="Chamados" value={String(activeTickets.length)} icon="headset-outline" colors={colors} />
            <MetricCard label="Favoritas" value={String(favoriteRooms.length)} icon="heart-outline" colors={colors} />
          </View>

          <CustomButton title="Encerrar sessao" type="outline" onPress={logout} style={styles.logoutButton} />
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Operacao do campus</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            Avisos relevantes e atalhos para nao perder contexto durante o dia.
          </Text>
        </View>

        {campusAnnouncements.map((item) => (
          <View key={item.id} style={[styles.announcementCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.announcementIcon, { backgroundColor: colors[`${item.tone}Soft`] || colors.inputBg }]}>
              <Ionicons
                name={item.tone === 'warning' ? 'alert-circle-outline' : item.tone === 'success' ? 'checkmark-done-outline' : 'information-circle-outline'}
                size={20}
                color={colors[item.tone] || colors.primary}
              />
            </View>
            <View style={styles.announcementBody}>
              <Text style={[styles.announcementTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.announcementText, { color: colors.textSecondary }]}>{item.description}</Text>
            </View>
          </View>
        ))}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Radar pessoal</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            O que esta vindo a seguir para sua conta.
          </Text>
        </View>

        <View style={styles.spotlightGrid}>
          <View style={[styles.spotlightCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.spotlightLabel, { color: colors.primary }]}>Proxima reserva</Text>
            {nextReserva ? (
              <>
                <Text style={[styles.spotlightTitle, { color: colors.text }]}>{nextReserva.sala}</Text>
                <Text style={[styles.spotlightText, { color: colors.textSecondary }]}>
                  {nextReserva.data} - {nextReserva.periodo}
                </Text>
              </>
            ) : (
              <EmptyState
                title="Agenda livre"
                message="Nenhuma reserva futura cadastrada. Aproveite para bloquear um espaco estrategico."
                icon="calendar-outline"
              />
            )}
          </View>

          <View style={[styles.spotlightCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.spotlightLabel, { color: colors.primary }]}>Tarefas em foco</Text>
            {spotlightTasks.length > 0 ? (
              spotlightTasks.map((task) => (
                <View key={task.id} style={styles.inlineTask}>
                  <Ionicons name="ellipse-outline" size={14} color={colors.primary} />
                  <Text style={[styles.inlineTaskText, { color: colors.text }]} numberOfLines={2}>
                    {task.title}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.spotlightText, { color: colors.textSecondary }]}>
                Nenhuma tarefa pendente. Seu planner esta sob controle.
              </Text>
            )}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Modulos inteligentes</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            Uma camada unica para reservas, produtividade, servicos e perfil.
          </Text>
        </View>

        <View style={styles.modulesGrid}>
          {MODULES.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={[styles.moduleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push(item.route)}
            >
              <View style={[styles.moduleIcon, { backgroundColor: colors.inputBg }]}>
                <Ionicons name={item.icon} size={22} color={colors.primary} />
              </View>
              <Text style={[styles.moduleTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.moduleText, { color: colors.textSecondary }]}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.bottomCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.bottomTitle, { color: colors.text }]}>Resumo rapido</Text>
          <Text style={[styles.bottomText, { color: colors.textSecondary }]}>
            {itens.length} item(ns) em achados, {activeTickets.length} chamado(s) ativo(s) e modo foco{' '}
            {preferences.focusMode ? 'ligado' : 'desligado'}.
          </Text>
        </View>
      </ScrollView>
    </AnimatedScreen>
  );
}

function MetricCard({ label, value, icon, colors }) {
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heroTextGroup: {
    flex: 1,
    gap: spacing.sm,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    ...typography.h1,
  },
  heroText: {
    ...typography.body,
    lineHeight: 22,
  },
  themeButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  logoutButton: {
    marginTop: spacing.lg,
    alignSelf: 'flex-start',
    minWidth: 180,
  },
  metricCard: {
    width: '47%',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '700',
  },
  metricLabel: {
    ...typography.caption,
  },
  sectionHeader: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.h2,
  },
  sectionText: {
    ...typography.body,
  },
  announcementCard: {
    flexDirection: 'row',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  announcementIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  announcementBody: {
    flex: 1,
    gap: spacing.xs,
  },
  announcementTitle: {
    ...typography.h4,
  },
  announcementText: {
    ...typography.caption,
    lineHeight: 18,
  },
  spotlightGrid: {
    gap: spacing.md,
  },
  spotlightCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    minHeight: 120,
  },
  spotlightLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  spotlightTitle: {
    ...typography.h3,
    marginTop: spacing.sm,
  },
  spotlightText: {
    ...typography.body,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  inlineTask: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  inlineTaskText: {
    flex: 1,
    ...typography.caption,
    lineHeight: 18,
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  moduleCard: {
    width: '47%',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    minHeight: 168,
  },
  moduleIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleTitle: {
    ...typography.h4,
    marginTop: spacing.md,
  },
  moduleText: {
    ...typography.caption,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  bottomCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  bottomTitle: {
    ...typography.h3,
  },
  bottomText: {
    ...typography.body,
    lineHeight: 22,
  },
});
