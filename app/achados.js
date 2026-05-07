import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { useAppData } from '../context/AppDataContext';
import { useTheme } from '../context/ThemeContext';
import { validateRequired } from '../utils/validators';
import { spacing, typography, radius } from '../constants/theme';

export default function LostAndFoundScreen() {
  const { itens, addItem, removeItem } = useAppData();
  const { colors } = useTheme();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [local, setLocal] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

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
        createdAt: new Date().toISOString(),
      });
      setNome('');
      setDescricao('');
      setLocal('');
      setToast({ visible: true, message: 'Item cadastrado com sucesso.', type: 'success' });
    } catch (error) {
      setToast({ visible: true, message: 'Nao foi possivel salvar o item.', type: 'error' });
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
        <CustomButton title="Cadastrar item" onPress={handleAddItem} loading={loading} />
      </View>

      <View style={styles.listSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Itens registrados</Text>
        {itens.length === 0 ? (
          <EmptyState message="Nenhum item cadastrado ate o momento." icon="search-outline" />
        ) : (
          itens.map((item) => (
            <View key={item.id} style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.listTitle, { color: colors.text }]}>{item.nome}</Text>
              <Text style={[styles.listText, { color: colors.textSecondary }]}>{item.descricao}</Text>
              <Text style={[styles.listText, { color: colors.textSecondary }]}>Local: {item.local}</Text>
              <View style={styles.cardFooter}>
                <Text style={[styles.badge, { backgroundColor: colors.inputBg, color: colors.text }]}>
                  {item.status}
                </Text>
                <TouchableOpacity onPress={() => removeItem(item.id)}>
                  <Text style={[styles.removeText, { color: colors.error }]}>Remover</Text>
                </TouchableOpacity>
              </View>
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
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
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
  removeText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
