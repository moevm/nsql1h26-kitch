import type {Times} from "./times.ts";

export interface Stages {
    name: string;
    worker_id: string;
    status: string;
    task_status: string;
    times: Times;
}
