import { apiClient } from './client';
import type { WorkerCreate, WorkerUpdate, WorkerPublic } from '../types/worker';

export interface WorkerFilterParams {
    name_worker?: string;
    worker_position?: string;
    start_workday?: string;
    end_workday?: string;
    min_completed_tasks?: number;
    max_completed_tasks?: number;
    min_overdue_tasks?: number;
    max_overdue_tasks?: number;
    min_failed_tasks?: number;
    max_failed_tasks?: number;
    from_created?: string;
    to_created?: string;
    sort_by?:
        'created_at' |
        'name_worker' |
        'worker_position' |
        'count_completed_tasks' |
        'count_overdue_tasks' |
        'count_failed_tasks';
    sort?: 'ASC' | 'DESC';
    start?: number;
    limit?: number;
}

export const workersAPI = {
    getCount: async (allUsers: boolean = false): Promise<number> => {
        const response = await apiClient.get<number>('/workers/count', {
            params: { all_users: allUsers }
        });
        return response.data;
    },

    getAll: async (): Promise<WorkerPublic[]> => {
        const response = await apiClient.get<WorkerPublic[]>('/workers');
        return response.data;
    },

    getFiltered: async (params: WorkerFilterParams): Promise<WorkerPublic[]> => {
        const response = await apiClient.get<WorkerPublic[]>('/workers/filter', { params });
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