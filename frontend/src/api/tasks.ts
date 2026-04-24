import { apiClient } from './client';
import type { Task } from '../types/tasks.ts';

export interface TakeTaskRequest {
    worker_id: string;
}

export const tasksAPI = {
    getAll: async (): Promise<Task[]> => {
        const response = await apiClient.get<Task[]>('/tasks');
        return response.data;
    },

    getByWorker: async (workerId: string): Promise<Task[]> => {
        const response = await apiClient.get<Task[]>(`/tasks/worker/${workerId}`);
        return response.data;
    },

    takeTask: async (orderId: string, stageIndex: number, workerId: string): Promise<{
        order_id: string;
        stage_index: number;
        message: string;
    }> => {
        const response = await apiClient.patch(`/tasks/${orderId}/${stageIndex}/take`, {
            worker_id: workerId,
        });
        return response.data;
    },

    completeTask: async (orderId: string, stageIndex: number): Promise<{
        order_id: string;
        stage_index: number;
        message: string;
    }> => {
        const response = await apiClient.patch(`/tasks/${orderId}/${stageIndex}/complete`);
        return response.data;
    },
};