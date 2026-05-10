import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../constants/theme';

export default function EmptyState({ message, icon = 'information-circle-outline', title = 'Nada por aqui ainda' }) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: colors.inputBg }]}>
        <Ionicons name={icon} size={34} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h3,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
    maxWidth: 320,
  },
});
