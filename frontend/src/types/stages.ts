import type {Times} from "./times.ts";

export type TypeStage =
    | "Раскрой"
    | "Производство"
    | "Доставка"
    | "Монтаж"
    | "Завершён"
    | "Отменён";

export type TypeTask =
    | "Доступна"
    | "Закрыта"
    | "В процессе"
    | "Выполнена"
    | "Просрочена"
    | "Отменена";

export interface Stages {
    name: TypeStage;
    worker_id: string;
    status: TypeStage;
    task_status: TypeTask;
    times: Times;
}
