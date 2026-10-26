import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  /* IMPORTANTE PARA A BANCA: 
     Use o IPv4 da sua máquina na rede Wi-Fi local.
  */
  baseURL: 'http://192.168.1.3:3000',
  timeout: 15000,
});

// Interceptor: Anexa automaticamente o Token JWT salvo no celular em toda requisição
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@rotuscan_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;