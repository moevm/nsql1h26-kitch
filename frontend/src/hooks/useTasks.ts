import { useQuery } from '@tanstack/react-query';
import { tasksAPI } from '../api/tasks';

export const useTasks = () => {
    return useQuery({
        queryKey: ['tasks'],
        queryFn: tasksAPI.getAll,
    });
};

export const useTasksByWorker = (workerId: string) => {
    return useQuery({
        queryKey: ['tasks', 'worker', workerId],
        queryFn: () => tasksAPI.getByWorker(workerId),
        enabled: !!workerId,
    });
};