import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {type TaskFilterParams, tasksAPI} from '../api/tasks';

export const useTasksCount = (workerId?: string) => {
    return useQuery({
        queryKey: ['tasks', 'count', { workerId }],
        queryFn: () => tasksAPI.getCount(workerId),
    });
};

export const useTasks = () => {
    return useQuery({
        queryKey: ['tasks'],
        queryFn: tasksAPI.getAll,
    });
};

export const useFilteredTasks = (params: TaskFilterParams) => {
    return useQuery({
        queryKey: ['tasks', 'filtered', params],
        queryFn: () => tasksAPI.getFiltered(params),
        enabled: true,
    });
};


export const useTasksByWorker = (workerId: string) => {
    return useQuery({
        queryKey: ['tasks', 'worker', workerId],
        queryFn: () => tasksAPI.getByWorker(workerId),
        enabled: !!workerId,
    });
};

export const useTakeTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({orderId, stageIndex, workerId}: {
            orderId: string;
            stageIndex: number;
            workerId: string;
        }) => tasksAPI.takeTask(orderId, stageIndex, workerId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['tasks', 'worker', variables.workerId] });
        },
        onError: (error) => {
            console.error('Error taking task:', error);
        },
    });
};

export const useCompleteTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({orderId, stageIndex}: {
            orderId: string;
            stageIndex: number;
            workerId: string;
        }) => tasksAPI.completeTask(orderId, stageIndex),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['tasks', 'worker', variables.workerId] });
        },
        onError: (error) => {
            console.error('Error completing task:', error);
        },
    });
};