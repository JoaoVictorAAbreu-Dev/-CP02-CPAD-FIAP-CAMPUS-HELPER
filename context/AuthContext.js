import React, { createContext, useContext, useEffect, useState } from 'react';
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
    } catch (error) {
      console.error('Erro ao carregar sessao', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, rm, password }) => {
    const usersKey = '@fiap:users_db';

    await SecureStore.setItemAsync(`@fiap:pwd:${rm}`, password);

    const newUser = { name, rm, createdAt: new Date().toISOString() };
    const existing = await AsyncStorage.getItem(usersKey);
    const users = existing ? JSON.parse(existing) : {};

    if (users[rm]) {
      throw new Error('Este RM ja esta cadastrado');
    }

    users[rm] = newUser;
    await AsyncStorage.setItem(usersKey, JSON.stringify(users));
    await AsyncStorage.setItem('@fiap:user_session', JSON.stringify(newUser));
    setUser(newUser);
  };

  const login = async ({ rm, password }) => {
    const savedPwd = await SecureStore.getItemAsync(`@fiap:pwd:${rm}`);
    if (!savedPwd || savedPwd !== password) {
      throw new Error('RM ou senha incorretos');
    }

    const existing = await AsyncStorage.getItem('@fiap:users_db');
    const users = existing ? JSON.parse(existing) : {};
    const found = users[rm];

    if (!found) {
      throw new Error('Usuario nao encontrado');
    }

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
