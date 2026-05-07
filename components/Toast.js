import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ICONS = {
  success: { name: 'checkmark-circle', color: '#4CAF50' },
  error: { name: 'close-circle', color: '#F44336' },
  info: { name: 'information-circle', color: '#2196F3' },
  warning: { name: 'warning', color: '#FF9800' },
};

const Toast = ({ visible, message, type = 'success', onHide }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: -100, duration: 300, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => onHide?.());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;
  const icon = ICONS[type];

  return (
    <Animated.View style={[
      styles.container,
      { top: insets.top + 10, opacity, transform: [{ translateY }] }
    ]}>
      <Ionicons name={icon.name} size={22} color={icon.color} />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute', left: 16, right: 16, zIndex: 9999,
    backgroundColor: '#1E1E1E', borderRadius: 12,
    padding: 14, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  message: { color: '#FFF', fontSize: 14, marginLeft: 10, flex: 1 },
});

export default Toast;
