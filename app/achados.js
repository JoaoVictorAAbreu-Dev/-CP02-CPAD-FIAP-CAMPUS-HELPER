import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedScreen from '../components/AnimatedScreen';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import EmptyState from '../components/EmptyState';
import KeyboardAwareScreen from '../components/KeyboardAwareScreen';
import Toast from '../components/Toast';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, radius } from '../constants/theme';
import { validateRequired } from '../utils/validators';
import { achadosService, initDatabase } from '../utils/db';

const STATUS_FILTERS = [
  { label: 'Todos', value: 'todos' },
  { label: 'Perdidos', value: 'perdido' },
  { label: 'Devolvidos', value: 'devolvido' },
];

export default function LostAndFoundScreen() {
  const { user } = useAuth();
  const { refreshData } = useAppData();
  const { colors } = useTheme();
  const [itens, setItens] = useState([]);
  const [nome, setNome] = useState('');
  const [local, setLocal] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const localRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    initDatabase();
    loadItems();
  }, [search, user?.rm]);

  async function loadItems() {
    try {
      const data = achadosService.getItems(search, user?.rm);
      setItens(data);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    }
  }

  const filteredItens = itens.filter((item) => statusFilter === 'todos' || item.status === statusFilter);

  async function handleAddItem() {
    if (![nome, local].every(validateRequired)) {
      setToast({ visible: true, message: 'Preencha os dados do item encontrado.', type: 'warning' });
      return;
    }

    try {
      setLoading(true);
      achadosService.addItem(nome.trim(), local.trim(), 'perdido', new Date().toISOString(), user?.rm || 'Anonimo');
      setNome('');
      setLocal('');
      setToast({ visible: true, message: 'Item cadastrado com sucesso.', type: 'success' });
      await loadItems();
      await refreshData();
    } catch (error) {
      setToast({ visible: true, message: 'Nao foi possivel salvar o item.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(item) {
    const nextStatus = item.status === 'devolvido' ? 'perdido' : 'devolvido';
    achadosService.updateStatus(item.id, nextStatus, user?.rm);
    await loadItems();
    await refreshData();
    setToast({
      visible: true,
      message: nextStatus === 'devolvido' ? 'Item marcado como devolvido.' : 'Item marcado como perdido.',
      type: 'success',
    });
  }

  async function handleDelete(id) {
    achadosService.deleteItem(id, user?.rm);
    await loadItems();
    await refreshData();
    setToast({ visible: true, message: 'Item removido com sucesso.', type: 'success' });
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

        <Text style={[styles.title, { color: colors.text }]}>Achados e perdidos</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Cada usuario visualiza apenas os itens que registrou na propria conta.
        </Text>

        <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <CustomInput
            label="Item"
            value={nome}
            onChangeText={setNome}
            placeholder="Ex.: Carteira preta"
            icon="briefcase-outline"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => localRef.current?.focus()}
          />
          <CustomInput
            ref={localRef}
            label="Local encontrado"
            value={local}
            onChangeText={setLocal}
            placeholder="Ex.: Biblioteca"
            icon="location-outline"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => searchRef.current?.focus()}
          />

          <CustomButton title="Cadastrar item" onPress={handleAddItem} loading={loading} />
        </View>

        <View style={styles.listSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Meus itens registrados</Text>
          <CustomInput
            ref={searchRef}
            label="Buscar itens"
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por item ou local"
            icon="search-outline"
            autoCapitalize="none"
            returnKeyType="search"
          />

          <View style={styles.filterRow}>
            {STATUS_FILTERS.map((filter) => {
              const selected = statusFilter === filter.value;
              return (
                <TouchableOpacity
                  key={filter.value}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: selected ? colors.primary : colors.inputBg,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setStatusFilter(filter.value)}
                >
                  <Text style={[styles.filterChipText, { color: selected ? '#FFFFFF' : colors.text }]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {filteredItens.length === 0 ? (
            <EmptyState
              message={
                itens.length === 0
                  ? 'Voce ainda nao registrou itens.'
                  : 'Nenhum item encontrado para os filtros informados.'
              }
              icon="search-outline"
            />
          ) : (
            filteredItens.map((item) => (
              <View
                key={item.id}
                style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={[styles.listTitle, { color: colors.text }]}>{item.item}</Text>
                <Text style={[styles.listText, { color: colors.textSecondary }]}>Local: {item.local}</Text>
                <Text style={[styles.listText, { color: colors.textSecondary }]}>Registrado por: {user?.name}</Text>
                <View style={styles.cardFooter}>
                  <Text
                    style={[
                      styles.badge,
                      {
                        backgroundColor: item.status === 'devolvido' ? colors.success : colors.inputBg,
                        color: item.status === 'devolvido' ? '#FFFFFF' : colors.text,
                      },
                    ]}
                  >
                    {item.status}
                  </Text>
                  <View style={styles.actionsRow}>
                    <TouchableOpacity onPress={() => handleToggleStatus(item)}>
                      <Text style={[styles.actionText, { color: colors.primary }]}>
                        {item.status === 'devolvido' ? 'Reabrir' : 'Devolver'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                      <Text style={[styles.actionText, { color: colors.error }]}>Remover</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </KeyboardAwareScreen>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { ...typography.h1 },
  subtitle: { ...typography.body, marginTop: spacing.sm, marginBottom: spacing.lg, lineHeight: 22 },
  formCard: { borderWidth: 1, borderRadius: radius.xl, padding: spacing.lg },
  listSection: { marginTop: spacing.xl },
  sectionTitle: { ...typography.h2, marginBottom: spacing.md },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  filterChip: { borderWidth: 1, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  filterChipText: { fontSize: 12, fontWeight: '700' },
  listCard: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.xs },
  listTitle: { ...typography.h3 },
  listText: { ...typography.caption, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, gap: spacing.md },
  actionsRow: { flexDirection: 'row', gap: spacing.md },
  badge: { overflow: 'hidden', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full, fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  actionText: { fontSize: 13, fontWeight: '700' },
});
