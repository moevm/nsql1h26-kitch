import type {DesignType, TypeDesign} from "./design.ts";
import type {Stages} from "./stages.ts";
import type {Pricing} from "./pricing.ts";
import type {Client} from "./client.ts";
import type {Size} from "./size.ts";
import type {Color} from "./color.ts";
import type {Delivery} from "./delivery.ts";

export interface Order {
    id: string;
    material_id: string;
    design_id: string;
    client: Client;
    item: string;
    delivery: Delivery;
    pricing: Pricing;
    stages: Stages[];
    comment: string;
    name_design: string;
    type: DesignType;
    material: string;
    size: Size;
    color: Color;
    need_material: number;
    blueprint: number;
}

export interface OrderCreate {
    phone: string;
    address: string;
    kitchen_type: TypeDesign;
    design_id: string;
    color: Color;
    material: string;
    floor: number;
    has_lift: boolean;
    comment?: string;
    type_price: number;
    material_price: number;
    delivery_price: number;
    comment_price: number;
}