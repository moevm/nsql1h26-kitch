import { apiClient } from './client';
import type {Design, DesignType} from "../types/design.ts";

export const designsAPI = {
    getAll: async (): Promise<Design[]> => {
        const response = await apiClient.get<Design[]>('/designs');
        return response.data;
    },

    getById: async (id: string): Promise<Design> => {
        const response = await apiClient.get<Design>(`/designs/${id}`);
        return response.data;
    },

    getTypes: async (): Promise<DesignType[]> => {
        const response = await apiClient.get<DesignType[]>('/designs/types');
        return response.data;
    }
};