import { apiClient } from './client';

export const importExportAPI = {
    importAllData: async (file: File): Promise<{ message: string }> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post<{ message: string }>('/import_all_data', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    exportAllData: async (): Promise<Blob> => {
        const response = await apiClient.get('/export_all_data', {
            responseType: 'blob',
        });
        return response.data;
    },
};