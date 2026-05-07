import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

const CustomButton = ({ title, onPress, loading, type = 'primary', style }) => {
  const { colors } = useTheme();

  const handlePress = () => {
    if (loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const backgroundColor = type === 'primary' ? colors.primary : 'transparent';
  const textColor = type === 'primary' ? '#FFFFFF' : colors.primary;
  const borderColor = type === 'outline' ? colors.primary : 'transparent';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor, borderColor, borderWidth: type === 'outline' ? 1 : 0 },
        style,
        loading && { opacity: 0.7 }
      ]}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomButton;
