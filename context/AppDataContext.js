import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { achadosService, initDatabase } from '../utils/db';

const AppDataContext = createContext({});
const getReservasKey = (rm) => `@fiap:reservas:${String(rm).trim()}`;

export function AppDataProvider({ children }) {
  const { user } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initDatabase();
  }, []);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);

      try {
        if (!user?.rm) {
          if (active) {
            setReservas([]);
            setItens([]);
          }
          return;
        }

        const savedReservas = await AsyncStorage.getItem(getReservasKey(user.rm));
        const nextReservas = savedReservas ? JSON.parse(savedReservas) : [];
        const nextItens = achadosService.getItems('', user.rm);

        if (!active) {
          return;
        }

        setReservas(nextReservas);
        setItens(nextItens);
      } catch (error) {
        console.error('Erro ao carregar dados', error);
        if (active) {
          setReservas([]);
          setItens([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [user?.rm]);

  const refreshData = async () => {
    if (!user?.rm) {
      setReservas([]);
      setItens([]);
      return;
    }

    const savedReservas = await AsyncStorage.getItem(getReservasKey(user.rm));
    setReservas(savedReservas ? JSON.parse(savedReservas) : []);
    setItens(achadosService.getItems('', user.rm));
  };

  const addReserva = async (reserva) => {
    if (!user?.rm) {
      throw new Error('Usuario nao autenticado');
    }

    const newReservas = [...reservas, { ...reserva, id: Date.now().toString(), ownerRm: user.rm }];
    setReservas(newReservas);
    await AsyncStorage.setItem(getReservasKey(user.rm), JSON.stringify(newReservas));
  };

  const addItem = async (item) => {
    if (!user?.rm) {
      throw new Error('Usuario nao autenticado');
    }

    achadosService.addItem(
      item.nome?.trim() || item.item?.trim(),
      item.local?.trim(),
      item.status || 'perdido',
      item.createdAt || new Date().toISOString(),
      user.rm
    );
    await refreshData();
  };

  const updateItemStatus = async (id, status) => {
    if (!user?.rm) {
      throw new Error('Usuario nao autenticado');
    }

    achadosService.updateStatus(id, status, user.rm);
    await refreshData();
  };

  const removeItem = async (id) => {
    if (!user?.rm) {
      throw new Error('Usuario nao autenticado');
    }

    achadosService.deleteItem(id, user.rm);
    await refreshData();
  };

  return (
    <AppDataContext.Provider
      value={{
        reservas,
        itens,
        loading,
        addReserva,
        addItem,
        updateItemStatus,
        removeItem,
        refreshData,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export const useAppData = () => useContext(AppDataContext);
