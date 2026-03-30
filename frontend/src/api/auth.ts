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
    }
};