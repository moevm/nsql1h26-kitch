import {apiClient} from "./client.ts";
import type {Order, OrderCreate} from "../types/order.ts";

export const ordersAPI = {
    getAll: async (): Promise<Order[]> => {
        const response = await apiClient.get('/orders');
        return response.data;
    },

    getById: async (id: string): Promise<Order> => {
        const response = await apiClient.get(`/orders/${id}`);
        return response.data;
    },

    create: async (orderData: OrderCreate): Promise<{ id: string; message: string }> => {
        const response = await apiClient.post('/orders/new', orderData);
        return response.data;
    },

    cancel: async (id: string): Promise<{ order_id: string; message: string }> => {
        const response = await apiClient.patch(`/orders/${id}/cancel`);
        return response.data;
    }
}