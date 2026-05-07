import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#ED145B', // Rosa/Vermelho FIAP
  secondary: '#1D1D1B', // Preto FIAP
  background: '#F5F5F5',
  white: '#FFFFFF',
  gray: '#999999',
  lightGray: '#E0E0E0',
  success: '#4CAF50',
  error: '#F44336',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
