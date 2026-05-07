import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../styles/theme';

const Card = ({ children, onPress, style }) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={[styles.card, style]} onPress={onPress}>
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default Card;
