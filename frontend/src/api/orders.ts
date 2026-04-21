import {apiClient} from "./client.ts";
import type {Order, OrderCreate} from "../types/order.ts";
import type {TypeDesign} from "../types/design.ts";
import type {TypeStage} from "../types/stages.ts";

export interface FilterParams {
    name_design: string;
    type: TypeDesign | '';
    material: string;
    stage: TypeStage | '';
    min_price: number;
    max_price: number;
    from_created: string;
    to_created: string;
    from_deadline: string;
    to_deadline: string;
    sort_by: string;
    sort: 'ASC' | 'DESC';
}

export const ordersAPI = {
    getAll: async (): Promise<Order[]> => {
        const response = await apiClient.get('/orders');
        return response.data;
    },

    getById: async (id: string): Promise<Order> => {
        const response = await apiClient.get(`/orders/${id}`);
        return response.data;
    },

    getFiltered: async (filters: FilterParams): Promise<Order[]> => {
        const params = new URLSearchParams();

        if (filters.name_design)            params.append('name_design', filters.name_design);
        if (filters.type)                   params.append('type', filters.type);
        if (filters.material)               params.append('material', filters.material);
        if (filters.stage)                  params.append('stage', filters.stage);
        if (filters.min_price > 0)          params.append('min_price', String(filters.min_price));
        if (filters.max_price < 1000000)    params.append('max_price', String(filters.max_price));
        if (filters.from_created)           params.append('from_created', filters.from_created);
        if (filters.to_created)             params.append('to_created', filters.to_created);
        if (filters.from_deadline)          params.append('from_deadline', filters.from_deadline);
        if (filters.to_deadline)            params.append('to_deadline', filters.to_deadline);
        if (filters.sort_by)                params.append('sort_by', filters.sort_by);
        if (filters.sort)                   params.append('sort', filters.sort);

        const response = await apiClient.get(`/orders/filter/?${params.toString()}`);
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