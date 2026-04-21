import type {ReactElement} from "react";
import styles from "./ClientOrderCard.module.scss"
import {CommonInfoField} from "../CommonInfoField/CommonInfoField.tsx";
import {CommonButton} from "../CommonButton/CommonButton.tsx";
import type {Order} from "../../types/order.ts";
import {useNavigate} from "react-router-dom";
import {formatDate} from "../FormatFunctions.ts";
import style from "../../pages/ClientPages/CreateOrderPage/CreateOrderPage.module.scss";

const getOrderStatus = (stages: Order['stages']): { text: string; className: string } => {
    console.log(stages);

    const lastStage = stages[stages.length - 1];
    if (lastStage?.name_stage === "Отменён") {
        return {
            text: "Отменён",
            className: styles.statusCancelled
        };
    }

    if (lastStage?.name_stage === "Завершён") {
        return {
            text: "Завершён",
            className: styles.statusCompleted
        };
    }

    const currentStage = stages.find(stage =>
        stage.task_status === "В процессе" || stage.task_status === "Доступна"
    );

    return {
        text: currentStage?.name_stage || "В процессе",
        className: styles.statusProcessing
    };
};

interface ClientOrderCardProps {
    order: Order;
}

export function ClientOrderCard({order}: ClientOrderCardProps): ReactElement {
    const navigate = useNavigate();
    const { text: statusText, className: statusClassName } = getOrderStatus(order.stages);

    const handleSubmit = () => {
        navigate(`/orders/${order.id}`, { state: { order } });
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
                <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                    <div className={style.mainTitle}>{`Заказ №${order.id}`}</div>
                    <div className={style.subTitle}>{`Дизайн: ${order.name_design} (${order.type})`}</div>
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