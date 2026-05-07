import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const CustomInput = ({
  label, value, onChangeText, placeholder,
  secureTextEntry, keyboardType, error,
  icon, autoCapitalize = 'none',
}) => {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 4, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [error]);

  const borderColor = error ? colors.error
    : focused ? colors.primary
    : colors.border;

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ translateX: shakeAnim }] }]}>
      {label && (
        <Text style={[styles.label, { color: focused ? colors.primary : colors.textSecondary }]}>
          {label}
        </Text>
      )}
      <View style={[styles.inputContainer, {
        borderColor,
        backgroundColor: colors.inputBg,
        borderWidth: focused ? 2 : 1,
      }]}>
        {icon && <Ionicons name={icon} size={20} color={borderColor} style={styles.icon} />}
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, paddingHorizontal: 14, height: 52,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16 },
  errorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  errorText: { fontSize: 12, marginLeft: 4 },
});

export default CustomInput;
