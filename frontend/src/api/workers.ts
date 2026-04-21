import { apiClient } from './client';
import type { WorkerCreate, WorkerUpdate, WorkerPublic } from '../types/worker';

export const workersAPI = {
    getAll: async (): Promise<WorkerPublic[]> => {
        const response = await apiClient.get<WorkerPublic[]>('/workers');
        return response.data;
    },

    getById: async (id: string): Promise<WorkerPublic> => {
        const response = await apiClient.get<WorkerPublic>(`/workers/${id}`);
        return response.data;
    },

    create: async (data: WorkerCreate): Promise<{ id: string; password: string }> => {
        const response = await apiClient.post('/workers/new', data);
        return response.data;
    },

    update: async (id: string, data: WorkerUpdate): Promise<{ id: string; message: string }> => {
        const response = await apiClient.patch(`/workers/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<{ id: string; message: string }> => {
        const response = await apiClient.delete(`/workers/${id}`);
        return response.data;
    }
};