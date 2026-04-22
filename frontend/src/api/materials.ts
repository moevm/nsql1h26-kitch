import { apiClient } from './client';
import type {Material} from "../types/material.ts";

export const materialsAPI = {
    getAll: async (): Promise<Material[]> => {
        const response = await apiClient.get<Material[]>('/materials');
        return response.data;
    },

    getById: async (id: string): Promise<Material> => {
        const response = await apiClient.get<Material>(`/materials/${id}`);
        return response.data;
    }
};