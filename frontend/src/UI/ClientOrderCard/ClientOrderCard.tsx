import type {ReactElement} from "react";
import styles from "./ClientOrderCard.module.scss"
import {CommonInfoField} from "../CommonInfoField/CommonInfoField.tsx";
import {CommonButton} from "../CommonButton/CommonButton.tsx";
import type {Order} from "../../types/order.ts";

const getOrderStatus = (stages: Order['stages']): { text: string; className: string } => {
    const isCanceled = stages.some(stage => stage.status === "Отменён");
    if (isCanceled) {
        return {
            text: "Отменён",
            className: styles.statusCancelled
        };
    }

    const allCompleted = stages.every(stage => stage.status === "Завершён");
    if (allCompleted) {
        return {
            text: "Завершён",
            className: styles.statusCompleted
        };
    }

    const currentStage = stages.find(stage =>
        stage.task_status === "В процессе" ||
        stage.task_status === "Доступна"
    );

    return {
        text: currentStage?.status || "В обработке",
        className: styles.statusProcessing
    };
};

interface ClientOrderCardProps {
    order: Order;
}

export function ClientOrderCard({order}: ClientOrderCardProps): ReactElement {
    const { text: statusText, className: statusClassName } = getOrderStatus(order.stages);

    const handleSubmit = () => {
        console.log("Order details:", order.id);
    };

    const formatDate = (date?: string | Date | null): string => {
        if (!date) return "—";
        const d = new Date(date);
        return d.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEstimatedCompletionDate = (): string => {
        if (!order.created_at) return "—";
        const date = new Date(order.created_at);
        date.setDate(date.getDate() + 30);
        return formatDate(date);
    };

    return (
        <div className={styles.cardContainer}>

            <div className={styles.orderIdGridItem}>
                <div className={styles.orderTitle}>
                    <div className={styles.orderTitleText}>
                        {`Заказ №${(order.id).slice(-10).toUpperCase()}`}
                    </div>
                </div>
            </div>

            <div className={styles.totalPriceGridItem}>
                <CommonInfoField
                    label={"Цена"}
                    value={`${order.pricing.total_price.toLocaleString()} ₽`}
                />
            </div>

            <div className={styles.creationDateGridItem}>
                <CommonInfoField
                    label={"Создан"}
                    value={formatDate(order.created_at)}
                />
            </div>

            <div className={styles.endDateGridItem}>
                <CommonInfoField
                    label={"Дата завершения"}
                    value={getEstimatedCompletionDate()}
                />
            </div>

            <div className={styles.statusGridItem}>
                <div className={`${styles.statusChip} ${statusClassName}`}>
                    <span className={styles.statusText}>{statusText}</span>
                </div>
            </div>

            <div className={styles.infoButtonGridItem}>
                <CommonButton
                    title={"Подробно"}
                    onClick={handleSubmit}
                />
            </div>

        </div>
    );
}