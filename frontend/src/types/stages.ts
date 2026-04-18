import type {Times} from "./times.ts";

export type TypeStatus =
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
    name: string;
    worker_id: string;
    status: TypeStatus;
    task_status: TypeTask;
    times: Times;
}
