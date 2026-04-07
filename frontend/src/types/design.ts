export interface Size {
    height: number;
    width: number;
    length: number;
}

export interface Color {
    red: number;
    green: number;
    blue: number;
    name: string
}

export interface DesignType {
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

export interface Design {
    type: string;
    type_price: number;
    count: number;
}