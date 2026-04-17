import type {Color} from "./color.ts";
import type {Size} from "./size.ts";

export interface Design {
    id?: string;
    name: string;
    type: string;
    size: Size;
    material: string;
    material_id: string;
    design_price: number;
    material_price: number;
    color: Color;
    description: string;
    production_time: number;
    need_material: number;
    blueprint?: number;
    created_at?: string;
    updated_at?: string;
}

export interface DesignType {
    type: string;
    type_price: number;
    count: number;
}