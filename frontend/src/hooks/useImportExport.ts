import { useMutation } from '@tanstack/react-query';
import { importExportAPI } from '../api/importExport';

export const useImport = () => {
    return useMutation({
        mutationFn: (file: File) => importExportAPI.importAllData(file),
    });
};

export const useExport = () => {
    return useMutation({
        mutationFn: () => importExportAPI.exportAllData(),
        onSuccess: (data) => {
            const url = window.URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'export.json');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        },
    });
};