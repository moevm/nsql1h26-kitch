import type { ReactElement } from "react";
import styles from "./WorkerCard.module.scss";
import type {WorkerPublic} from "../../types/worker.ts";
import {CommonInfoField} from "../CommonInfoField/CommonInfoField.tsx";
import {CommonButton} from "../CommonButton/CommonButton.tsx";
import {useTasksByWorker} from "../../hooks/useTasks.ts";

interface WorkerCardProps {
    worker: WorkerPublic;
    onProfileClick?: (worker: WorkerPublic) => void;
}

export function WorkerCard({worker, onProfileClick}: WorkerCardProps): ReactElement {
    const { data: tasks, isLoading } = useTasksByWorker(worker.id);

    const completedTasks = tasks?.filter(task => task.status === "Выполнена").length || 0;

    const overdueTasks = tasks?.filter(task => task.status === "Просрочена").length || 0;

    const workingHours =
        worker.work_day_start && worker.work_day_end
            ? `${worker.work_day_start}-${worker.work_day_end}`
            : "—";

    return (
        <div className={styles.card}>

            <div className={styles.field}>
                <CommonInfoField
                    label="Имя сотрудника"
                    value={worker.name}
                />
            </div>

            <div className={styles.field}>
                <CommonInfoField
                    label="Рабочие часы"
                    value={workingHours}
                />
            </div>

            <div className={styles.field}>
                <CommonInfoField
                    label="Должность"
                    value={worker.current_position || worker.positions[0] || "—"}
                />
            </div>

            <div className={styles.field}>
                <CommonInfoField
                    label="Выполненые задачи"
                    value={isLoading ? "..." : completedTasks}
                />
            </div>

            <div className={styles.field}>
                <CommonInfoField
                    label="Просроченные задачи"
                    value={isLoading ? "..." : overdueTasks}
                />
            </div>

            <div className={styles.buttonWrapper}>
                <CommonButton
                    title="Профиль"
                    variant="primary"
                    onClick={() => onProfileClick?.(worker)}
                />
            </div>
        </div>
    );
}