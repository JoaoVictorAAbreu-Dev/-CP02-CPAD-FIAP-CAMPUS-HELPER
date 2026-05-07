import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppDataContext = createContext({});

export function AppDataProvider({ children }) {
  const [reservas, setReservas] = useState([]);
  const [itens, setItens] = useState([]); // Achados e Perdidos
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedReservas = await AsyncStorage.getItem('@fiap:reservas');
      const savedItens = await AsyncStorage.getItem('@fiap:itens');
      
      if (savedReservas) setReservas(JSON.parse(savedReservas));
      if (savedItens) setItens(JSON.parse(savedItens));
    } catch (e) {
      console.error('Erro ao carregar dados', e);
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
    setItens(newItens);
    await AsyncStorage.setItem('@fiap:itens', JSON.stringify(newItens));
  };

  const removeItem = async (id) => {
    const newItens = itens.filter(i => i.id !== id);
    setItens(newItens);
    await AsyncStorage.setItem('@fiap:itens', JSON.stringify(newItens));
  };

  return (
    <AppDataContext.Provider value={{ 
      reservas, 
      itens, 
      loading, 
      addReserva, 
      addItem, 
      removeItem 
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export const useAppData = () => useContext(AppDataContext);
