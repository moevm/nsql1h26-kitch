import type {TypeStage, TypeTask} from "./stages.ts";
import type {TypeDesign} from "./design.ts";
import type {Color} from "./color.ts";
import type {Times} from "./times.ts";

export interface Task {
    order_id: string;
    stage_index: number;
    stage_name: TypeStage;
    status: TypeTask;
    name_design: string;
    type: TypeDesign;
    color: Color;
    material: string;
    times: Times;
    worker_id: string;
}