import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AnimatedScreen from '../components/AnimatedScreen';
import CustomButton from '../components/CustomButton';
import SkeletonCard from '../components/SkeletonCard';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, radius } from '../constants/theme';

const QUICK_ACTIONS = [
  {
    title: 'Reservar salas',
    description: 'Consulte ambientes e crie novas reservas.',
    icon: 'business-outline',
    route: '/salas',
  },
  {
    title: 'Meus agendamentos',
    description: 'Acompanhe reservas registradas localmente.',
    icon: 'calendar-outline',
    route: '/agendamento',
  },
  {
    title: 'Achados e perdidos',
    description: 'Cadastre itens perdidos e acompanhe a lista.',
    icon: 'search-outline',
    route: '/achados',
  },
];

export default function HomeScreen() {
  const { user, loading: authLoading, logout } = useAuth();
  const { reservas, itens, loading: dataLoading } = useAppData();
  const { colors, toggleTheme, themeMode } = useTheme();

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
        <View style={[styles.heroCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <View style={styles.heroHeader}>
            <View style={styles.heroTitleGroup}>
              <Text style={[styles.eyebrow, { color: colors.primary }]}>FIAP Campus Helper</Text>
              <Text style={[styles.heroTitle, { color: colors.text }]}>Ola, {user.name}</Text>
              <Text style={[styles.heroText, { color: colors.textSecondary }]}>
                Centralize reservas, acessos rapidos e registros de achados em um unico fluxo.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.themeButton, { borderColor: colors.border, backgroundColor: colors.inputBg }]}
              onPress={toggleTheme}
            >
              <Ionicons
                name={themeMode === 'dark' ? 'sunny-outline' : 'moon-outline'}
                size={20}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.metricsRow}>
            <MetricCard label="Reservas" value={String(reservas.length)} colors={colors} />
            <MetricCard label="Itens" value={String(itens.length)} colors={colors} />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Modulos</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            Escolha a operacao que voce deseja executar.
          </Text>
        </View>

        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.route}
            style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push(action.route)}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.inputBg }]}>
              <Ionicons name={action.icon} size={22} color={colors.primary} />
            </View>
            <View style={styles.actionBody}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>{action.title}</Text>
              <Text style={[styles.actionText, { color: colors.textSecondary }]}>{action.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}

        <CustomButton title="Encerrar sessao" type="outline" onPress={logout} />
      </ScrollView>
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
  screen: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  heroCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heroTitleGroup: {
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
    fontSize: 26,
    fontWeight: '700',
  },
  metricLabel: {
    marginTop: spacing.xs,
    ...typography.caption,
  },
  sectionHeader: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.h2,
  },
  sectionText: {
    ...typography.body,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBody: {
    flex: 1,
    gap: spacing.xs,
  },
  actionTitle: {
    ...typography.h3,
  },
  actionText: {
    ...typography.caption,
    lineHeight: 18,
  },
});
