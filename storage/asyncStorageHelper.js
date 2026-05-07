import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  // Salvar um item (Documento)
  save: async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.error(`Erro ao salvar ${key}`, e);
    }
  },

  // Buscar um item
  get: async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error(`Erro ao buscar ${key}`, e);
      return null;
    }
  },

  // Remover um item
  remove: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error(`Erro ao remover ${key}`, e);
    }
  },

  // Lógica NoSQL: Atualizar um documento dentro de um objeto (Coleção)
  updateInCollection: async (collectionKey, docId, data) => {
    try {
      const collection = await storage.get(collectionKey) || {};
      collection[docId] = { ...collection[docId], ...data, id: docId };
      await storage.save(collectionKey, collection);
      return collection[docId];
    } catch (e) {
      console.error(`Erro ao atualizar coleção ${collectionKey}`, e);
    }
  },

  // Buscar coleção como array
  getCollectionAsArray: async (collectionKey) => {
    const collection = await storage.get(collectionKey) || {};
    return Object.values(collection);
  }
};
