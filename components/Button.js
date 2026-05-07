import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/theme';

const Button = ({ title, onPress, type = 'primary', style }) => {
  const buttonStyle = type === 'primary' ? styles.primaryButton : styles.secondaryButton;
  const textStyle = type === 'primary' ? styles.primaryText : styles.secondaryText;

  return (
    <TouchableOpacity style={[styles.button, buttonStyle, style]} onPress={onPress}>
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.primary,
  },
});

export default Button;
