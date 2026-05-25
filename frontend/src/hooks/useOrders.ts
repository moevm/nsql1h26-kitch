import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {type FilterParams, ordersAPI} from "../api/orders.ts";
import type {OrderCreate} from "../types/order.ts";

export const useOrdersCount = () => {
    return useQuery({
        queryKey: ['orders', 'count'],
        queryFn: ordersAPI.getCount,
    });
};

export const useOrders = () => {
    return useQuery({
        queryKey: ['orders'],
        queryFn: ordersAPI.getAll,
    });
}

export const useOrder = (id: string) => {
    return useQuery({
        queryKey: ['orders', id],
        queryFn: () => ordersAPI.getById(id),
        enabled: !!id,
    });
}

export const useFilteredOrders = (filters: FilterParams) => {
    return useQuery({
        queryKey: ['orders', 'filter', JSON.stringify(filters)],
        queryFn: () => ordersAPI.getFiltered(filters),
        enabled: true,
    });
}

export const useCreateOrder = () => {
    return useMutation({
        mutationFn: (orderData: OrderCreate) => ordersAPI.create(orderData),
    });
};

export const useCancelOrder = () => {
    return useMutation({
        mutationFn: (id: string) => ordersAPI.cancel(id),
    });
};

export const useChangeStageWorker = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ orderId, stageIndex, workerId }: { orderId: string; stageIndex: number; workerId: string | null }) =>
            ordersAPI.changeStageWorker(orderId, stageIndex, workerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
};