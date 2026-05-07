import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { colors } from '../styles/theme';

const Header = ({ title }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  title: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Header;
