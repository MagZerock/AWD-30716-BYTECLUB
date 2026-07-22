import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const BFF_BASE_URL = import.meta.env.VITE_BFF_URL || 'https://biconoirs-business.duckdns.org';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://biconoirs-class-op.duckdns.org/ops';

function createClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
  });

  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const userId = localStorage.getItem('user_id');
      if (userId) {
        config.headers['x-user-id'] = userId;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response: AxiosResponse) => {
      const data = response.data;
      if (data && typeof data === 'object') {
        if ('data' in data) {
          if (!('success' in data)) {
            data.success = true;
          }
        } else {
          response.data = { success: true, data };
        }
      } else {
        response.data = { success: true, data };
      }
      return response;
    },
    (error) => {
      if (error.response?.status === 401 && error.config?.headers?.Authorization) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (!error.response) {
        return Promise.reject(
          new Error('Error de conexion. Verifica tu internet o intenta mas tarde.')
        );
      }

      return Promise.reject(
        new Error(error.response?.data?.error || `Error del servidor (${error.response?.status})`)
      );
    }
  );

  return client;
}

export const apiBff = createClient(BFF_BASE_URL + '/api/v1');
export const apiOps = createClient(API_BASE_URL);
const apiClient = apiOps;

export default apiClient;
