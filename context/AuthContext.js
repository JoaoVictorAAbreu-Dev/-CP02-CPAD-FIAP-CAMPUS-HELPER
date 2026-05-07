import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('@fiap:user_session');
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch (e) {
      console.error('Erro ao carregar sessão', e);
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, rm, password }) => {
    // NoSQL Pattern: Usamos o RM como chave única no "banco" de usuários
    const usersKey = '@fiap:users_db';
    
    // Salva senha de forma segura (SecureStore)
    await SecureStore.setItemAsync(`@fiap:pwd:${rm}`, password);
    
    const newUser = { name, rm, createdAt: new Date().toISOString() };
    
    // Recupera o "documento" de usuários
    const existing = await AsyncStorage.getItem(usersKey);
    const users = existing ? JSON.parse(existing) : {};
    
    if (users[rm]) {
      throw new Error('Este RM já está cadastrado');
    }

    // Adiciona o novo "documento" ao objeto (NoSQL Style)
    users[rm] = newUser;
    await AsyncStorage.setItem(usersKey, JSON.stringify(users));
    
    // Login automático: salva a sessão atual
    await AsyncStorage.setItem('@fiap:user_session', JSON.stringify(newUser));
    setUser(newUser);
  };

  const login = async ({ rm, password }) => {
    // Valida senha no SecureStore
    const savedPwd = await SecureStore.getItemAsync(`@fiap:pwd:${rm}`);
    if (!savedPwd || savedPwd !== password) {
      throw new Error('RM ou senha incorretos');
    }
    
    // Busca o usuário no "banco" NoSQL (AsyncStorage)
    const existing = await AsyncStorage.getItem('@fiap:users_db');
    const users = existing ? JSON.parse(existing) : {};
    const found = users[rm];
    
    if (!found) throw new Error('Usuário não encontrado');
    
    // Salva sessão
    await AsyncStorage.setItem('@fiap:user_session', JSON.stringify(found));
    setUser(found);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('@fiap:user_session');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
