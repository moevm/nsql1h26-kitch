import axios from 'axios';
import { QueryClient } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthEndpoint = error.config?.url === '/auth';

        if (error.response?.status === 401 && !isAuthEndpoint) {
            localStorage.removeItem('token');

            const queryClient = new QueryClient();
            queryClient.clear();

            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);