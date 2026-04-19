import {useMutation, useQuery} from "@tanstack/react-query";
import {ordersAPI} from "../api/orders.ts";
import type {OrderCreate} from "../types/order.ts";

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