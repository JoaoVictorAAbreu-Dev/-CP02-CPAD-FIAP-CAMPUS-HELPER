import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/theme';

const EmptyState = ({ message, icon = 'information-circle-outline' }) => {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={colors.gray} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 40,
  },
  message: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default EmptyState;
