import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AnimatedScreen from '../components/AnimatedScreen';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { useAppData } from '../context/AppDataContext';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, radius } from '../constants/theme';
import { validateRequired } from '../utils/validators';

const STATUS_FILTERS = [
  { label: 'Todos', value: 'todos' },
  { label: 'Perdidos', value: 'perdido' },
  { label: 'Devolvidos', value: 'devolvido' },
];

export default function LostAndFoundScreen() {
  const { itens, addItem, updateItemStatus, removeItem } = useAppData();
  const { colors } = useTheme();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [local, setLocal] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [imageUri, setImageUri] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const filteredItens = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return itens.filter((item) => {
      const matchesStatus = statusFilter === 'todos' || item.status === statusFilter;
      const matchesSearch =
        !normalizedSearch ||
        [item.nome, item.descricao, item.local, item.status]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch));

      return matchesStatus && matchesSearch;
    });
  }, [itens, search, statusFilter]);

  async function handlePickImage(fromCamera = false) {
    try {
      if (fromCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setToast({ visible: true, message: 'Permita o acesso a camera para capturar a foto.', type: 'warning' });
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.7,
        });

        if (!result.canceled && result.assets?.length) {
          setImageUri(result.assets[0].uri);
        }
        return;
      }

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setToast({ visible: true, message: 'Permita o acesso a galeria para selecionar uma imagem.', type: 'warning' });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.length) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      setToast({ visible: true, message: 'Nao foi possivel acessar a imagem.', type: 'error' });
    }
  }

  async function handleAddItem() {
    if (![nome, descricao, local].every(validateRequired)) {
      setToast({ visible: true, message: 'Preencha os dados do item encontrado.', type: 'warning' });
      return;
    }

    try {
      setLoading(true);
      await addItem({
        nome: nome.trim(),
        descricao: descricao.trim(),
        local: local.trim(),
        imageUri,
        createdAt: new Date().toISOString(),
      });
      setNome('');
      setDescricao('');
      setLocal('');
      setImageUri('');
      setToast({ visible: true, message: 'Item cadastrado com sucesso.', type: 'success' });
    } catch (error) {
      setToast({ visible: true, message: 'Nao foi possivel salvar o item.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(item) {
    const nextStatus = item.status === 'devolvido' ? 'perdido' : 'devolvido';
    await updateItemStatus(item.id, nextStatus);
    setToast({
      visible: true,
      message: nextStatus === 'devolvido' ? 'Item marcado como devolvido.' : 'Item marcado como perdido.',
      type: 'success',
    });
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

        <Text style={[styles.title, { color: colors.text }]}>Achados e perdidos</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Registre itens localizados no campus e acompanhe a listagem salva no dispositivo.
        </Text>

        <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <CustomInput
            label="Item"
            value={nome}
            onChangeText={setNome}
            placeholder="Ex.: Carteira preta"
            icon="briefcase-outline"
          />
          <CustomInput
            label="Descricao"
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Ex.: Documentos e cartoes"
            icon="document-text-outline"
          />
          <CustomInput
            label="Local encontrado"
            value={local}
            onChangeText={setLocal}
            placeholder="Ex.: Biblioteca"
            icon="location-outline"
          />

          <View style={styles.mediaRow}>
            <TouchableOpacity
              style={[styles.mediaButton, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
              onPress={() => handlePickImage(false)}
            >
              <Text style={[styles.mediaButtonText, { color: colors.text }]}>Escolher da galeria</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mediaButton, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
              onPress={() => handlePickImage(true)}
            >
              <Text style={[styles.mediaButtonText, { color: colors.text }]}>Abrir camera</Text>
            </TouchableOpacity>
          </View>

          {imageUri ? (
            <View style={styles.previewSection}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <TouchableOpacity onPress={() => setImageUri('')}>
                <Text style={[styles.removeText, { color: colors.error }]}>Remover imagem</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <CustomButton title="Cadastrar item" onPress={handleAddItem} loading={loading} />
        </View>

        <View style={styles.listSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Itens registrados</Text>
          <CustomInput
            label="Buscar itens"
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por item, descricao, local ou status"
            icon="search-outline"
            autoCapitalize="none"
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
                  ? 'Nenhum item cadastrado ate o momento.'
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
                {item.imageUri ? <Image source={{ uri: item.imageUri }} style={styles.listImage} /> : null}
                <Text style={[styles.listTitle, { color: colors.text }]}>{item.nome}</Text>
                <Text style={[styles.listText, { color: colors.textSecondary }]}>{item.descricao}</Text>
                <Text style={[styles.listText, { color: colors.textSecondary }]}>Local: {item.local}</Text>
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
                    <TouchableOpacity onPress={() => removeItem(item.id)}>
                      <Text style={[styles.actionText, { color: colors.error }]}>Remover</Text>
                    </TouchableOpacity>
                  </View>
                </View>
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
  mediaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  mediaButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  mediaButtonText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  previewSection: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: radius.lg,
  },
  listSection: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
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
  listCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  listImage: {
    width: '100%',
    height: 160,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  listTitle: {
    ...typography.h3,
  },
  listText: {
    ...typography.caption,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  badge: {
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  removeText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
