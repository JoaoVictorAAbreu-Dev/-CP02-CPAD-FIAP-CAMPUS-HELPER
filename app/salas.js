import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AnimatedScreen from '../components/AnimatedScreen';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, radius } from '../constants/theme';

const ROOMS = [
  { id: 'lab-01', name: 'Laboratorio 01', capacity: 24, resource: 'Projetor e bancada', availability: 'Disponivel' },
  { id: 'sala-305', name: 'Sala 305', capacity: 12, resource: 'TV e videoconferencia', availability: 'Disponivel' },
  { id: 'arena-tech', name: 'Arena Tech', capacity: 40, resource: 'Espaco para apresentacoes', availability: 'Uso moderado' },
];

export default function RoomsScreen() {
  const { colors } = useTheme();

  return (
    <AnimatedScreen>
      <ScrollView
        style={[styles.screen, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>Salas e ambientes</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Consulte espacos disponiveis e siga para o fluxo de agendamento.
        </Text>

        {ROOMS.map((room) => (
          <View key={room.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrap, { backgroundColor: colors.inputBg }]}>
                <Ionicons name="business-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{room.name}</Text>
                <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                  {room.capacity} lugares - {room.resource}
                </Text>
              </View>
            </View>

            <View style={styles.footerRow}>
              <Text style={[styles.badge, { backgroundColor: colors.inputBg, color: colors.text }]}>
                {room.availability}
              </Text>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/agendamento', params: { sala: room.name } })}
              >
                <Text style={[styles.link, { color: colors.primary }]}>Agendar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTitle: {
    ...typography.h3,
  },
  cardText: {
    ...typography.caption,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  badge: {
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    fontSize: 12,
    fontWeight: '600',
  },
  link: {
    fontSize: 14,
    fontWeight: '700',
  },
});
