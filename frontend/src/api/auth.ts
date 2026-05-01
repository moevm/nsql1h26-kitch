import { apiClient } from './client';
import type { UserCreate, UserAuth, RegisterResponse, AuthResponse } from '../types/user';

export const authAPI = {
    register: async (data: UserCreate): Promise<RegisterResponse> => {
        const response = await apiClient.post<RegisterResponse>('/register', data);
        return response.data;
    },

    login: async (data: UserAuth): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth', data);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    getUserRole: (): string | null => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.role || null;
        } catch (error) {
            console.error('Failed to decode token:', error);
            return null;
        }
    },

    getUserId: (): string | null => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.sub || null;
        } catch (error) {
            console.error('Failed to decode token:', error);
            return null;
        }
    },

    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('token');
    }
};