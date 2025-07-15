// TokenStore.js
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'token';
const USER_INFO_KEY = 'userInfo';
const NOTIFICATION_KEY = 'notification_key';
const CLASS_INFO = 'class_info'

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

  setNotificationToken: async (token) => {
    if (token) {
      await SecureStore.setItemAsync(NOTIFICATION_KEY, token);
    }
  },

  getNotificationToken: async () => {
    const token = await SecureStore.getItemAsync(NOTIFICATION_KEY)
    return token ? token : null
  },

  setClassInfo: async (info) => {
    const data = JSON.stringify(info)
    await SecureStore.setItemAsync(CLASS_INFO, data)
  },

  getClassInfo: async () => {
    const data = await SecureStore.getItemAsync(CLASS_INFO)
    return data ? JSON.parse(data) : null
  },

  clearAll: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_INFO_KEY);
    await SecureStore.deleteItemAsync(NOTIFICATION_KEY);
    await SecureStore.deleteItemAsync(CLASS_INFO);
  },
};
