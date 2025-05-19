// TokenStore.js
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'token';
const USER_INFO_KEY = 'userInfo';

export const TokenStore = {
  setToken: async (token) => {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  },

  getToken: async () => {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  setUserInfo: async (user) => {
    if (user) {
      await SecureStore.setItemAsync(USER_INFO_KEY, JSON.stringify(user));
    }
  },

  getUserInfo: async () => {
    const data = await SecureStore.getItemAsync(USER_INFO_KEY);
    return data ? JSON.parse(data) : null;
  },

  clearAll: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_INFO_KEY);
  },
};
