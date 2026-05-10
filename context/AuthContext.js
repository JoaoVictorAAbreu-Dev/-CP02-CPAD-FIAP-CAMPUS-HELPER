import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext({});

const USERS_KEY = '@fiap:users_db';
const SESSION_KEY = '@fiap:user_session';
const getPasswordKey = (rm) => `fiappwd${String(rm).trim()}`;

function normalizeUser(user = {}) {
  return {
    name: user.name || 'Aluno FIAP',
    rm: String(user.rm || '').trim(),
    email: user.email || '',
    course: user.course || '',
    campus: user.campus || 'Paulista',
    semester: user.semester || '',
    bio: user.bio || '',
    createdAt: user.createdAt || new Date().toISOString(),
  };
}

async function getUsers() {
  const existing = await AsyncStorage.getItem(USERS_KEY);
  return existing ? JSON.parse(existing) : {};
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const savedUser = await AsyncStorage.getItem(SESSION_KEY);
      if (savedUser) {
        setUser(normalizeUser(JSON.parse(savedUser)));
      }
    } catch (error) {
      console.error('Erro ao carregar sessao', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, rm, password, email = '', course = '', campus = 'Paulista', semester = '' }) => {
    const normalizedRm = String(rm).trim();
    const users = await getUsers();

    if (users[normalizedRm]) {
      throw new Error('Este RM ja esta cadastrado');
    }

    await SecureStore.setItemAsync(getPasswordKey(normalizedRm), password);

    const newUser = normalizeUser({
      name,
      rm: normalizedRm,
      email,
      course,
      campus,
      semester,
      createdAt: new Date().toISOString(),
    });

    users[normalizedRm] = newUser;
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  const login = async ({ rm, password }) => {
    const normalizedRm = String(rm).trim();
    const savedPwd = await SecureStore.getItemAsync(getPasswordKey(normalizedRm));

    if (!savedPwd || savedPwd !== password) {
      throw new Error('RM ou senha incorretos');
    }

    const users = await getUsers();
    const found = users[normalizedRm];

    if (!found) {
      throw new Error('Usuario nao encontrado');
    }

    const normalizedUser = normalizeUser(found);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  };

  const updateProfile = async (updates) => {
    if (!user?.rm) {
      throw new Error('Usuario nao autenticado');
    }

    const users = await getUsers();
    const nextUser = normalizeUser({
      ...users[user.rm],
      ...user,
      ...updates,
      rm: user.rm,
    });

    users[user.rm] = nextUser;
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
