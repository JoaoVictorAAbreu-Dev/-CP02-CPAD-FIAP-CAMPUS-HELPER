import { Platform } from 'react-native';

const WEB_STORAGE_KEY = 'fiap_campus_achados';

let db = null;

if (Platform.OS !== 'web') {
  const SQLite = require('expo-sqlite');
  db = SQLite.openDatabaseSync('fiap_campus.db');
}

function normalizeRm(rm) {
  return String(rm || '').trim();
}

function readWebItems() {
  if (typeof localStorage === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(WEB_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erro ao ler itens salvos no navegador', error);
    return [];
  }
}

function writeWebItems(items) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(items));
}

export const initDatabase = () => {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined' && !localStorage.getItem(WEB_STORAGE_KEY)) {
      localStorage.setItem(WEB_STORAGE_KEY, JSON.stringify([]));
    }
    return;
  }

  db.execSync(`
    CREATE TABLE IF NOT EXISTS achados (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item TEXT NOT NULL,
      local TEXT NOT NULL,
      status TEXT NOT NULL,
      data TEXT NOT NULL,
      usuario_rm TEXT NOT NULL
    );
  `);
  console.log('Banco de dados inicializado com sucesso');
};

export const achadosService = {
  addItem: (item, local, status, data, rm) => {
    if (Platform.OS === 'web') {
      const items = readWebItems();
      const nextItem = {
        id: Date.now(),
        item,
        local,
        status,
        data,
        usuario_rm: normalizeRm(rm),
      };
      writeWebItems([nextItem, ...items]);
      return nextItem.id;
    }

    const result = db.runSync(
      'INSERT INTO achados (item, local, status, data, usuario_rm) VALUES (?, ?, ?, ?, ?)',
      [item, local, status, data, normalizeRm(rm)]
    );
    return result.lastInsertRowId;
  },

  getItems: (query = '', rm) => {
    const normalizedRm = normalizeRm(rm);

    if (!normalizedRm) {
      return [];
    }

    if (Platform.OS === 'web') {
      const normalizedQuery = query.trim().toLowerCase();
      return readWebItems()
        .filter((item) => item.usuario_rm === normalizedRm)
        .filter((item) => {
          if (!normalizedQuery) {
            return true;
          }

          return [item.item, item.local].some((value) =>
            String(value || '').toLowerCase().includes(normalizedQuery)
          );
        })
        .sort((a, b) => Number(b.id) - Number(a.id));
    }

    if (query) {
      return db.getAllSync(
        'SELECT * FROM achados WHERE usuario_rm = ? AND (item LIKE ? OR local LIKE ?) ORDER BY id DESC',
        [normalizedRm, `%${query}%`, `%${query}%`]
      );
    }

    return db.getAllSync('SELECT * FROM achados WHERE usuario_rm = ? ORDER BY id DESC', [normalizedRm]);
  },

  updateStatus: (id, newStatus, rm) => {
    const normalizedRm = normalizeRm(rm);

    if (Platform.OS === 'web') {
      const items = readWebItems().map((item) =>
        String(item.id) === String(id) && item.usuario_rm === normalizedRm
          ? { ...item, status: newStatus }
          : item
      );
      writeWebItems(items);
      return;
    }

    db.runSync('UPDATE achados SET status = ? WHERE id = ? AND usuario_rm = ?', [
      newStatus,
      id,
      normalizedRm,
    ]);
  },

  deleteItem: (id, rm) => {
    const normalizedRm = normalizeRm(rm);

    if (Platform.OS === 'web') {
      const items = readWebItems().filter(
        (item) => !(String(item.id) === String(id) && item.usuario_rm === normalizedRm)
      );
      writeWebItems(items);
      return;
    }

    db.runSync('DELETE FROM achados WHERE id = ? AND usuario_rm = ?', [id, normalizedRm]);
  },
};

export default db;
