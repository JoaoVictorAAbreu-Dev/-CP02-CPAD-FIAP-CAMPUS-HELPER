import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppDataContext = createContext({});

export function AppDataProvider({ children }) {
  const [reservas, setReservas] = useState([]);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const persistItens = async (nextItens) => {
    setItens(nextItens);
    await AsyncStorage.setItem('@fiap:itens', JSON.stringify(nextItens));
  };

  const loadData = async () => {
    try {
      const savedReservas = await AsyncStorage.getItem('@fiap:reservas');
      const savedItens = await AsyncStorage.getItem('@fiap:itens');

      if (savedReservas) setReservas(JSON.parse(savedReservas));
      if (savedItens) setItens(JSON.parse(savedItens));
    } catch (error) {
      console.error('Erro ao carregar dados', error);
    } finally {
      setLoading(false);
    }
  };

  const addReserva = async (reserva) => {
    const newReservas = [...reservas, { ...reserva, id: Date.now().toString() }];
    setReservas(newReservas);
    await AsyncStorage.setItem('@fiap:reservas', JSON.stringify(newReservas));
  };

  const addItem = async (item) => {
    const newItens = [...itens, { ...item, id: Date.now().toString(), status: 'perdido' }];
    await persistItens(newItens);
  };

  const updateItemStatus = async (id, status) => {
    const nextItens = itens.map((item) =>
      item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item
    );
    await persistItens(nextItens);
  };

  const removeItem = async (id) => {
    const newItens = itens.filter((item) => item.id !== id);
    await persistItens(newItens);
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
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export const useAppData = () => useContext(AppDataContext);
