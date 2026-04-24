import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workersAPI, type WorkerFilterParams } from '../api/workers';
import type { WorkerCreate, WorkerUpdate } from '../types/worker';

export const useWorkers = () => {
    return useQuery({
        queryKey: ['workers'],
        queryFn: workersAPI.getAll
    });
};

export const useFilteredWorkers = (params: WorkerFilterParams) => {
    return useQuery({
        queryKey: ['workers', 'filtered', params],
        queryFn: () => workersAPI.getFiltered(params),
        enabled: true,
    });
};

export const useWorker = (id: string) => {
    return useQuery({
        queryKey: ['worker', id],
        queryFn: () => workersAPI.getById(id),
        enabled: !!id
    });
};

export const useCreateWorker = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: WorkerCreate) => workersAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workers'] });
        }
    });
};

export const useUpdateWorker = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: WorkerUpdate }) =>
            workersAPI.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['workers'] });
            queryClient.invalidateQueries({ queryKey: ['worker', variables.id] });
        }
    });
};

export const useDeleteWorker = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => workersAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workers'] });
        }
    });
};