import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For Android Emulator: use 10.0.2.2 (alias for host machine's localhost)
// For physical device: use your computer's local IP (e.g., 192.168.1.100)
const DEFAULT_BASE_URL = 'http://10.0.2.2:5000';

let baseURL = DEFAULT_BASE_URL;

export const setBaseURL = (url) => {
  baseURL = url;
  api.defaults.baseURL = `${url}/api`;
};

export const getBaseURL = () => baseURL;

const api = axios.create({
  baseURL: `${DEFAULT_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Silent fail
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
