import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function SkeletonCard() {
  const { colors } = useTheme();
  const opacity = new Animated.Value(0.3);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.card, 
        { backgroundColor: colors.card, opacity, borderColor: colors.border }
      ]}
    >
      <View style={[styles.line, { backgroundColor: colors.border, width: '60%' }]} />
      <View style={[styles.line, { backgroundColor: colors.border, width: '40%', height: 10 }]} />
      <View style={[styles.line, { backgroundColor: colors.border, width: '90%', height: 10, marginTop: 12 }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    height: 100,
    justifyContent: 'center',
  },
  line: {
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
  }
});
