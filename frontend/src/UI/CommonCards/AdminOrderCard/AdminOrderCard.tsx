import {type ReactElement, useCallback, useEffect, useState} from "react";
import type {Order} from "../../../types/order.ts";
import {useNavigate} from "react-router-dom";
import styles from "./AdminOrderCard.module.scss";
import {CommonInfoField} from "../../CommonInfoField/CommonInfoField.tsx";
import {formatDate} from "../../FormatFunctions.ts";
import {CommonButton} from "../../CommonButton/CommonButton.tsx";
import {useWorkers} from "../../../hooks/useWorkers.ts";
import {CommonSelectField, type Option} from "../../CommonSelectField/CommonSelectField.tsx";
import type {WorkerPublic} from "../../../types/worker.ts";
import {useCancelOrder, useChangeStageWorker} from "../../../hooks/useOrders.ts";

const getLastCompletedStageEndDate = (order: Order): string => {
    if (!order.stages || order.stages.length === 0) return "-";

    const completedStages = order.stages.filter(stage =>
        stage.task_status === "Выполнена" &&
        stage.name_stage !== "Завершён" &&
        stage.name_stage !== "Отменён"
    );

    if (completedStages.length === 0) return "—";

    const lastCompleted = completedStages[completedStages.length - 1];
    if (lastCompleted?.times?.end) {
        return formatDate(lastCompleted.times.end);
    }
    return "-";
};

const getTimeUntilDeadline = (deadline: Date | string | null | undefined): string => {
    if (!deadline) return "—";
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffMs = deadlineDate.getTime() - now.getTime();

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) return `${diffDays} д ${diffHours} ч`;
    if (diffHours > 0) return `${diffHours} ч`;
    return "Менее часа";
};

export interface AdminOrderCardProps {
    order: Order;
    onWorkerChanged?: () => void;
}

export function AdminOrderCard({order, onWorkerChanged}: AdminOrderCardProps): ReactElement {
    const navigate = useNavigate();

    const cancelOrderMutation = useCancelOrder();
    const changeStageWorkerMutation = useChangeStageWorker();
    const { data: workers, isLoading } = useWorkers();
    const workersArray: WorkerPublic[] = workers || [];

    const activeStageIndex = order.stages?.findIndex(
        stage => stage.task_status !== 'Выполнена'
            && stage.task_status !== 'Отменена'
            && stage.task_status !== 'Закрыта'
    ) ?? -1;

    const activeStage = activeStageIndex !== -1 ? order.stages[activeStageIndex] : null;

    const workerOptions: Option[] = workersArray.map((worker, index) => ({
        value: index,
        label: worker.name
    }));

    const currentWorkerIndex = (() => {
        if (!activeStage?.worker_id) return null;
        const workerIndex = workersArray.findIndex(
            worker => worker.id === activeStage.worker_id
        );
        return workerIndex !== -1 ? workerIndex : null;
    })();

    const [selectedWorkerIndex, setSelectedWorkerIndex] = useState<number | null>(currentWorkerIndex);

    useEffect(() => {
        setSelectedWorkerIndex(currentWorkerIndex);
    }, [currentWorkerIndex]);

    const handleWorkerChange = useCallback((selectedIndex: string | number) => {
        const index = Number(selectedIndex);
        const selectedWorker = workersArray[index];
        const newWorkerId = selectedWorker ? selectedWorker.id : null;

        setSelectedWorkerIndex(index);

        if (activeStageIndex !== -1) {
            changeStageWorkerMutation.mutate(
                {orderId: order.id, stageIndex: activeStageIndex, workerId: newWorkerId},
                {
                    onSuccess: (data) => {
                        alert(`${data.message}`);
                        if (onWorkerChanged) {
                            onWorkerChanged();
                        }
                    },
                }
            );
        }
    }, [order.id, activeStageIndex, workersArray, changeStageWorkerMutation, onWorkerChanged]);

    const handleOpenProfile = () => {
        navigate(`/orders/${order.id}`, { state: { order } });
    };

    const handleCancel = () => {
        cancelOrderMutation.mutate(order.id, {
            onSuccess: (data) => {
                alert(`${data.message}`);
                window.location.reload();
            }
        });
    };

    const getCompletionDate = (): string => {
        const lastCompletedDate = getLastCompletedStageEndDate(order);
        if (lastCompletedDate !== "-") return lastCompletedDate;

        const realStages = order.stages?.filter(stage =>
            stage.name_stage !== "Завершён" && stage.name_stage !== "Отменён"
        ) || [];

        if (realStages.length === 0) return "-";

        const lastStage = realStages[realStages.length - 1];
        const deadline = lastStage?.times?.deadline;

        if (!deadline) return "-";
        const deadlineDate = deadline instanceof Date ? deadline : new Date(deadline);
        if (isNaN(deadlineDate.getTime())) return "-";

        return formatDate(deadlineDate);
    };

    const getTimeUntilStageDeadline = (): string => {
        if (!activeStage?.times?.deadline) return "-";
        return getTimeUntilDeadline(activeStage.times.deadline);
    };

    const getSpentTime = (): string => {
        if (!order.stages || order.stages.length === 0) return "0 ч";

        const totalSpent = order.stages.reduce((sum, stage) => {
            return sum + (stage.times?.spent || 0);
        }, 0);

        if (totalSpent === 0) return "0 ч";
        return `${totalSpent} ч`;
    };

    const getTaskStatus = (): string => {
        if (!activeStage) return "-";

        const status = activeStage.task_status;
        switch (status) {
            case "Доступна": return "Доступна";
            case "В процессе": return "В процессе";
            case "Выполнена": return "Выполнена";
            case "Просрочена": return "Просрочена";
            case "Отменена": return "Отменена";
            default: return status || "-";
        }
    };

    return (
        <div className={styles.cardContainer}>

            <div className={styles.orderIdGridItem}>
                <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                    <div className={styles.mainTitle}>{`Заказ №${order.id}`}</div>
                    <div className={styles.subTitle}>{`Дизайн: ${order.name_design} (${order.type})`}</div>
                </div>
            </div>

            <div className={styles.endDateGridItem}>
                <CommonInfoField
                    label={"Дата завершения"}
                    value={getCompletionDate()}
                />
            </div>

            <div className={styles.deadlineGridItem}>
                <CommonInfoField
                    label={"До дедлайна"}
                    value={getTimeUntilStageDeadline()}
                />
            </div>

            <div className={styles.spendTimeGridItem}>
                <CommonInfoField
                    label={"Затраченное время"}
                    value={getSpentTime()}
                />
            </div>

            <div className={styles.creationDateGridItem}>
                <CommonInfoField
                    label={"Создан"}
                    value={formatDate(order.created_at)}
                />
            </div>

            <div className={styles.totalPriceGridItem}>
                <CommonInfoField
                    label={"Цена"}
                    value={`${order.pricing.total_price.toLocaleString()} ₽`}
                />
            </div>

            <div className={styles.workerGridItem}>
                {isLoading ? (
                    <CommonInfoField
                        label={"Рабочий на заказе"}
                        value={"Загрузка..."}
                    />
                ) : (
                    <CommonSelectField
                        label={"Рабочий на заказе"}
                        value={selectedWorkerIndex}
                        options={workerOptions}
                        onChange={handleWorkerChange}
                        disabled={workerOptions.length === 0}
                    />
                )}
            </div>

            <div className={styles.infoButtonGridItem}>
                <CommonButton
                    title={"Подробно"}
                    onClick={handleOpenProfile}
                />
            </div>

            <div className={styles.stageGridItem}>
                <CommonInfoField
                    label={"Текущий этап"}
                    value={activeStage?.name_stage || "Нет активного этапа"}
                />
            </div>

            <div className={styles.statusGridItem}>
                <CommonInfoField
                    label={"Статус задачи"}
                    value={getTaskStatus()}
                />
            </div>

            <div className={styles.timeLineGridItem}></div>

            <div className={styles.cancelButtonGridItem}>
                <CommonButton
                    title={"Отменить заказ"}
                    onClick={handleCancel}
                    variant={"danger"}
                />
            </div>

        </div>
    )
}