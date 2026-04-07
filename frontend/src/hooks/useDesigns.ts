import {useQuery} from '@tanstack/react-query';
import type {Design, DesignType} from "../types/design.ts";
import {designsAPI} from "../api/designs.ts";

export const useDesigns = () => {
    return useQuery<Design[]>({
        queryKey: ['designs'],
        queryFn: designsAPI.getAll
    });
};

export const useDesign = (id: string) => {
    return useQuery<Design>({
        queryKey: ['design', id],
        queryFn: () => designsAPI.getById(id),
        enabled: !!id
    });
};

export const useDesignTypes = () => {
    return useQuery<DesignType[]>({
        queryKey: ['design-types'],
        queryFn: designsAPI.getTypes
    });
};