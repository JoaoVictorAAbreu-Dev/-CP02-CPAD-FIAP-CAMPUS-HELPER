import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AnimatedScreen from '../components/AnimatedScreen';
import CustomInput from '../components/CustomInput';
import EmptyState from '../components/EmptyState';
import { roomsCatalog } from '../constants/campusData';
import { spacing, typography, radius } from '../constants/theme';
import { useAppData } from '../context/AppDataContext';
import { useTheme } from '../context/ThemeContext';

const FILTERS = [
  { label: 'Todas', value: 'all' },
  { label: 'Favoritas', value: 'favorites' },
  { label: 'Disponiveis', value: 'available' },
];

export default function RoomsScreen() {
  const { colors } = useTheme();
  const { favoriteRooms, toggleFavoriteRoom } = useAppData();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredRooms = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return roomsCatalog
      .filter((room) => {
        if (filter === 'favorites') {
          return favoriteRooms.includes(room.id);
        }

        if (filter === 'available') {
          return room.availability !== 'Reservas intensas' && room.availability !== 'Vagas limitadas';
        }

        return true;
      })
      .filter((room) => {
        if (!normalizedSearch) {
          return true;
        }

        return [room.name, room.resource, room.zone, room.profile]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);
      });
  }, [favoriteRooms, filter, search]);

  function getAvailabilityTone(label) {
    if (label === 'Alta disponibilidade' || label === 'Disponivel hoje') {
      return { background: colors.successSoft, text: colors.success };
    }

    if (label === 'Uso moderado') {
      return { background: colors.infoSoft, text: colors.info };
    }

    return { background: colors.warningSoft, text: colors.warning };
  }

  return (
    <AnimatedScreen>
      <ScrollView
        style={[styles.screen, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>Reserva inteligente</Text>
          <Text style={[styles.title, { color: colors.text }]}>Salas e ambientes do campus</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Filtre por disponibilidade, favorite seus espacos preferidos e entre direto no fluxo de agendamento.
          </Text>
        </View>

        <CustomInput
          label="Buscar ambiente"
          value={search}
          onChangeText={setSearch}
          placeholder="Ex.: Arena, laboratorio, studio..."
          icon="search-outline"
          autoCapitalize="none"
        />

        <View style={styles.filtersRow}>
          {FILTERS.map((item) => {
            const selected = filter === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selected ? colors.primary : colors.inputBg,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setFilter(item.value)}
              >
                <Text style={[styles.filterChipText, { color: selected ? '#FFFFFF' : colors.text }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.resultText, { color: colors.textSecondary }]}>
          {filteredRooms.length} ambiente(s) encontrados | {favoriteRooms.length} favorito(s)
        </Text>

        {filteredRooms.length === 0 ? (
          <EmptyState
            title="Nenhum ambiente encontrado"
            message="Ajuste a busca ou o filtro para localizar salas, estudios e espacos estrategicos do campus."
            icon="business-outline"
          />
        ) : (
          filteredRooms.map((room) => {
            const favorite = favoriteRooms.includes(room.id);
            const tone = getAvailabilityTone(room.availability);

            return (
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
                    <Text style={[styles.cardSubText, { color: colors.textSecondary }]}>
                      {room.floor} - zona {room.zone}
                    </Text>
                  </View>

                  <TouchableOpacity onPress={() => toggleFavoriteRoom(room.id)}>
                    <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color={colors.primary} />
                  </TouchableOpacity>
                </View>

                <View style={[styles.availabilityBadge, { backgroundColor: tone.background }]}>
                  <Text style={[styles.availabilityText, { color: tone.text }]}>{room.availability}</Text>
                </View>

                <Text style={[styles.profileText, { color: colors.textSecondary }]}>{room.profile}</Text>

                <View style={styles.footerRow}>
                  <TouchableOpacity
                    style={[styles.secondaryAction, { borderColor: colors.border, backgroundColor: colors.inputBg }]}
                    onPress={() => toggleFavoriteRoom(room.id)}
                  >
                    <Text style={[styles.secondaryActionText, { color: colors.text }]}>
                      {favorite ? 'Remover favorito' : 'Salvar favorito'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.primaryAction, { backgroundColor: colors.primary }]}
                    onPress={() => router.push({ pathname: '/agendamento', params: { sala: room.name } })}
                  >
                    <Text style={styles.primaryActionText}>Agendar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
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
  heroCard: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
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
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  resultText: {
    ...typography.caption,
    marginBottom: spacing.md,
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
    lineHeight: 18,
  },
  cardSubText: {
    ...typography.small,
  },
  availabilityBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginTop: spacing.md,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  profileText: {
    ...typography.body,
    lineHeight: 22,
    marginTop: spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  secondaryAction: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  primaryAction: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
