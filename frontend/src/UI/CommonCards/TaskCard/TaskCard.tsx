import type {ReactElement} from "react";
import type {Task} from "../../../types/tasks.ts";
import styles from "./TaskCard.module.scss"
import {CommonInfoField} from "../../CommonInfoField/CommonInfoField.tsx";
import {CommonButton} from "../../CommonButton/CommonButton.tsx";
import {useNavigate} from "react-router-dom";
import {useOrder} from "../../../hooks/useOrders.ts";
import {useAuth} from "../../../hooks/useAuth.ts";
import {useTakeTask} from "../../../hooks/useTasks.ts";
import {formatDate} from "../../FormatFunctions.ts";

interface TaskCardProps {
    task: Task;
}

const getStatusConfig = (status: Task['status']): { text: string; className: string } => {
    switch (status) {
        case "Доступна":
            return { text: "Новая", className: styles.statusAvailable };
        case "В процессе":
            return { text: "В процессе", className: styles.statusProcessing };
        case "Выполнена":
            return { text: "Завершена", className: styles.statusCompleted };
        case "Просрочена":
            return { text: "Просрочена", className: styles.statusOverdue };
        case "Отменена":
            return { text: "Отменена", className: styles.statusCancelled };
        case "Закрыта":
            return { text: "Закрыта", className: styles.statusClosed };
        default:
            return { text: status, className: styles.statusProcessing };
    }
};

export function TaskCard({task}: TaskCardProps): ReactElement {
    const navigate = useNavigate();
    const { text: statusText, className: statusClassName } = getStatusConfig(task.status);
    const {data: order} = useOrder(task.order_id);
    const { userId } = useAuth();
    const takeTask = useTakeTask();

    const handleOrderClick = () => {
        navigate(`/orders/${task.order_id}`, { state: { order } });
    };

    const handleTakeTask = () => {
        if (!userId) {
            alert('Не удалось определить ID пользователя. Пожалуйста, выйдите и зайдите снова.');
            console.error("No worker ID found");
            return;
        }

        takeTask.mutate(
            {
                orderId: task.order_id,
                stageIndex: task.stage_index,
                workerId: userId
            },
            {
                onSuccess: (data) => {
                    alert(`✅ Задача успешно взята в работу: ${data.message}`);
                },
                onError: (error: any) => {
                    console.error("Take task error full:", error);
                    let errorMessage = 'Ошибка при взятии задачи';
                    if (error?.response?.data) {
                        const data = error.response.data;
                        if (typeof data === 'string') errorMessage = data;
                        else if (data.detail) errorMessage = data.detail;
                        else if (data.message) errorMessage = data.message;
                        else if (data.error) errorMessage = data.error;
                    } else if (error?.message) {
                        errorMessage = error.message;
                    }
                    alert(`❌ Ошибка: ${errorMessage}`);
                }
            }
        );
    };

    const handleCompleteTask = () => {
        console.log("Complete task", task.order_id, task.stage_index);
    };

    const isTaskAvailable = task.status === "Доступна";
    const isTaskInProgress = task.status === "В процессе";

    const shouldShowTakeButton = isTaskAvailable;
    const shouldShowCompleteButton = isTaskInProgress;

    const getTimeUntilDeadline = (): string => {
        if (!task.times.deadline) return "—";
        const deadline = new Date(task.times.deadline);
        const now = new Date();
        const diffMs = deadline.getTime() - now.getTime();

        if (diffMs <= 0) return "Просрочено";

        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (diffDays > 0) return `${diffDays} д ${diffHours} ч`;
        if (diffHours > 0) return `${diffHours} ч`;
        return "Менее часа";
    };

    return (
        <div className={styles.cardContainer}>

            <div className={styles.orderIdGridItem}>
                <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                    <div className={styles.mainTitle}>{`Заказ №${task.order_id} (${task.stage_index})`}</div>
                </div>
            </div>

            <div className={styles.stageNameGridItem}>
                <CommonInfoField
                    label={"Текущий этап"}
                    value={task.stage_name}
                />
            </div>

            <div className={styles.deadlineTimeGridItem}>
                <CommonInfoField
                    label={"До дедлайна"}
                    value={getTimeUntilDeadline()}
                />
            </div>

            <div className={styles.estTimeGridItem}>
                <CommonInfoField
                    label={"Расчетное время"}
                    value={`${task.times.est_time} ч`}
                />
            </div>

            <div className={styles.statusGridItem}>
                <div className={`${styles.statusChip} ${statusClassName}`}>
                    <span className={styles.statusText}>{statusText}</span>
                </div>
            </div>

            <div className={styles.designGridItem}>
                <CommonInfoField
                    label={"Дизайн"}
                    value={`${task.name_design} (${task.type})`}
                />
            </div>

            <div className={styles.materialGridItem}>
                <CommonInfoField
                    label={"Материал"}
                    value={task.material}
                />
            </div>

            <div className={styles.createdAtGridItem}>
                <CommonInfoField
                    label={"Создана"}
                    value={task.created_at ? formatDate(task.created_at) : "—"}
                />
            </div>

            <div className={styles.updatedAtGridItem}>
                <CommonInfoField
                    label={"Изменён"}
                    value={task.updated_at ? formatDate(task.updated_at) : "—"}
                />
            </div>

            <div className={styles.firstButtonGridItem}>
                <CommonButton
                    title={"Заказ"}
                    variant="primary"
                    onClick={handleOrderClick}
                />
            </div>

            <div className={styles.secondButtonGridItem}>
                {shouldShowTakeButton && (
                    <CommonButton
                        title={takeTask.isPending ? "Взятие..." : "Взять"}
                        variant="primary"
                        onClick={handleTakeTask}
                        disabled={takeTask.isPending}
                    />
                )}
                {shouldShowCompleteButton && (
                    <CommonButton
                        title={"Завершить"}
                        variant="primary"
                        onClick={handleCompleteTask}
                    />
                )}
            </div>

        </div>
    );
}