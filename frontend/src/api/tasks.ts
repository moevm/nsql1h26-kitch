import { apiClient } from './client';
import type { Task } from '../types/tasks.ts';
import type {TypeDesign} from "../types/design.ts";
import type {TypeStage, TypeTask} from "../types/stages.ts";

export interface TaskFilterParams {
    name_design?: string;
    type_kitchen?: TypeDesign;
    material?: string;
    order_id?: string;
    design_id?: string;
    material_id?: string;
    name_stage?: TypeStage;
    stage_status?: TypeStage;
    task_status?: TypeTask;
    min_estimated_time?: number;
    max_estimated_time?: number;
    from_created?: string;
    to_created?: string;
    from_deadline?: string;
    to_deadline?: string;
    sort_by?: 'created_at' | 'material' | 'name_design' | 'name_stage' | 'task_status' | 'type_kitchen' | 'estimated_time' | 'deadline';
    sort?: 'ASC' | 'DESC';
    start?: number;
    limit?: number;
}

export interface TakeTaskRequest {
    worker_id: string;
}

export const tasksAPI = {
    getCount: async (workerId?: string): Promise<number> => {
        const params = workerId ? { worker_id: workerId } : {};
        const response = await apiClient.get<number>('/tasks/count', { params });
        return response.data;
    },

    getAll: async (): Promise<Task[]> => {
        const response = await apiClient.get<Task[]>('/tasks');
        return response.data;
    },

    getFiltered: async (params: TaskFilterParams): Promise<{ items: Task[]; total: number }> => {
        const response = await apiClient.get<{ items: Task[]; total: number }>('/tasks/filter', { params });
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