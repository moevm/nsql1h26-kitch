import {useQuery} from "@tanstack/react-query";
import {materialsAPI} from "../api/materials.ts";
import type {Material} from "../types/material.ts";

export const useMaterials = () => {
    return useQuery<Material[]>({
        queryKey: ['designs'],
        queryFn: materialsAPI.getAll
    });
};

export const useMaterial = (id: string) => {
    return useQuery<Material>({
        queryKey: ['design', id],
        queryFn: () => materialsAPI.getById(id),
        enabled: !!id
    });
};