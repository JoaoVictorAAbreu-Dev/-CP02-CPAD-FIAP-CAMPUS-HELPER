import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { achadosService, initDatabase } from '../utils/db';

const AppDataContext = createContext({});

const storageKeys = {
  reservas: (rm) => `@fiap:reservas:${String(rm).trim()}`,
  planner: (rm) => `@fiap:planner:${String(rm).trim()}`,
  tickets: (rm) => `@fiap:tickets:${String(rm).trim()}`,
  favorites: (rm) => `@fiap:favorites:${String(rm).trim()}`,
  preferences: (rm) => `@fiap:preferences:${String(rm).trim()}`,
};

const defaultPreferences = {
  focusMode: false,
  reminderWindow: '30 min',
  preferredStudySlot: 'Noite',
  quickCheckin: true,
};

async function readJson(key, fallback) {
  const rawValue = await AsyncStorage.getItem(key);
  return rawValue ? JSON.parse(rawValue) : fallback;
}

async function writeJson(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export function AppDataProvider({ children }) {
  const { user } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [itens, setItens] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [favoriteRooms, setFavoriteRooms] = useState([]);
  const [preferences, setPreferences] = useState(defaultPreferences);
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
            setTasks([]);
            setTickets([]);
            setFavoriteRooms([]);
            setPreferences(defaultPreferences);
          }
          return;
        }

        const [nextReservas, nextTasks, nextTickets, nextFavoriteRooms, nextPreferences] = await Promise.all([
          readJson(storageKeys.reservas(user.rm), []),
          readJson(storageKeys.planner(user.rm), []),
          readJson(storageKeys.tickets(user.rm), []),
          readJson(storageKeys.favorites(user.rm), []),
          readJson(storageKeys.preferences(user.rm), defaultPreferences),
        ]);

        const nextItens = achadosService.getItems('', user.rm);

        if (!active) {
          return;
        }

        setReservas(nextReservas);
        setItens(nextItens);
        setTasks(nextTasks);
        setTickets(nextTickets);
        setFavoriteRooms(nextFavoriteRooms);
        setPreferences({ ...defaultPreferences, ...nextPreferences });
      } catch (error) {
        console.error('Erro ao carregar dados', error);
        if (active) {
          setReservas([]);
          setItens([]);
          setTasks([]);
          setTickets([]);
          setFavoriteRooms([]);
          setPreferences(defaultPreferences);
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
      setTasks([]);
      setTickets([]);
      setFavoriteRooms([]);
      setPreferences(defaultPreferences);
      return;
    }

    const [nextReservas, nextTasks, nextTickets, nextFavoriteRooms, nextPreferences] = await Promise.all([
      readJson(storageKeys.reservas(user.rm), []),
      readJson(storageKeys.planner(user.rm), []),
      readJson(storageKeys.tickets(user.rm), []),
      readJson(storageKeys.favorites(user.rm), []),
      readJson(storageKeys.preferences(user.rm), defaultPreferences),
    ]);

    setReservas(nextReservas);
    setItens(achadosService.getItems('', user.rm));
    setTasks(nextTasks);
    setTickets(nextTickets);
    setFavoriteRooms(nextFavoriteRooms);
    setPreferences({ ...defaultPreferences, ...nextPreferences });
  };

  const addReserva = async (reserva) => {
    if (!user?.rm) {
      throw new Error('Usuario nao autenticado');
    }

    const newReservas = [...reservas, { ...reserva, id: Date.now().toString(), ownerRm: user.rm }];
    setReservas(newReservas);
    await writeJson(storageKeys.reservas(user.rm), newReservas);
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

  const addTask = async (task) => {
    if (!user?.rm) {
      throw new Error('Usuario nao autenticado');
    }

    const newTasks = [
      {
        ...task,
        id: Date.now().toString(),
        done: false,
        createdAt: new Date().toISOString(),
      },
      ...tasks,
    ];

    setTasks(newTasks);
    await writeJson(storageKeys.planner(user.rm), newTasks);
  };

  const toggleTaskStatus = async (id) => {
    if (!user?.rm) {
      throw new Error('Usuario nao autenticado');
    }

    const nextTasks = tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            done: !task.done,
            completedAt: !task.done ? new Date().toISOString() : null,
          }
        : task
    );

    setTasks(nextTasks);
    await writeJson(storageKeys.planner(user.rm), nextTasks);
  };

  const removeTask = async (id) => {
    if (!user?.rm) {
      throw new Error('Usuario nao autenticado');
    }

    const nextTasks = tasks.filter((task) => task.id !== id);
    setTasks(nextTasks);
    await writeJson(storageKeys.planner(user.rm), nextTasks);
  };

  const addTicket = async (ticket) => {
    if (!user?.rm) {
      throw new Error('Usuario nao autenticado');
    }

    const newTickets = [
      {
        ...ticket,
        id: Date.now().toString(),
        status: 'aberto',
        createdAt: new Date().toISOString(),
      },
      ...tickets,
    ];

    setTickets(newTickets);
    await writeJson(storageKeys.tickets(user.rm), newTickets);
  };

  const advanceTicketStatus = async (id) => {
    if (!user?.rm) {
      throw new Error('Usuario nao autenticado');
    }

    const order = ['aberto', 'em_andamento', 'aguardando', 'resolvido'];
    const nextTickets = tickets.map((ticket) => {
      if (ticket.id !== id) {
        return ticket;
      }

      const currentIndex = order.indexOf(ticket.status);
      const nextStatus = order[Math.min(currentIndex + 1, order.length - 1)];
      return { ...ticket, status: nextStatus };
    });

    setTickets(nextTickets);
    await writeJson(storageKeys.tickets(user.rm), nextTickets);
  };

  const toggleFavoriteRoom = async (roomId) => {
    if (!user?.rm) {
      throw new Error('Usuario nao autenticado');
    }

    const nextFavorites = favoriteRooms.includes(roomId)
      ? favoriteRooms.filter((item) => item !== roomId)
      : [...favoriteRooms, roomId];

    setFavoriteRooms(nextFavorites);
    await writeJson(storageKeys.favorites(user.rm), nextFavorites);
  };

  const updatePreferences = async (updates) => {
    if (!user?.rm) {
      throw new Error('Usuario nao autenticado');
    }

    const nextPreferences = { ...preferences, ...updates };
    setPreferences(nextPreferences);
    await writeJson(storageKeys.preferences(user.rm), nextPreferences);
  };

  return (
    <AppDataContext.Provider
      value={{
        reservas,
        itens,
        tasks,
        tickets,
        favoriteRooms,
        preferences,
        loading,
        addReserva,
        addItem,
        updateItemStatus,
        removeItem,
        addTask,
        toggleTaskStatus,
        removeTask,
        addTicket,
        advanceTicketStatus,
        toggleFavoriteRoom,
        updatePreferences,
        refreshData,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export const useAppData = () => useContext(AppDataContext);
