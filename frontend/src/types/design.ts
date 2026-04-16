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

export const colors: Color[] = [
    { name: "Красный", red: 255, green: 0, blue: 0 },
    { name: "Зеленый", red: 0, green: 255, blue: 0 },
    { name: "Синий", red: 0, green: 0, blue: 255 }
]