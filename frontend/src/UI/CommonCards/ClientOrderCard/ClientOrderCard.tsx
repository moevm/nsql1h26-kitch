import type {ReactElement} from "react";
import styles from "./ClientOrderCard.module.scss"
import {CommonInfoField} from "../../CommonInfoField/CommonInfoField.tsx";
import {CommonButton} from "../../CommonButton/CommonButton.tsx";
import type {Order} from "../../../types/order.ts";
import {useNavigate} from "react-router-dom";
import {formatDate} from "../../FormatFunctions.ts";
import style from "../../../pages/ClientPages/CreateOrderPage/CreateOrderPage.module.scss";

const getOrderStatus = (stages: Order['stages']): { text: string; className: string } => {
    if (!stages || stages.length === 0) {
        return {
            text: "В процессе",
            className: styles.statusProcessing
        };
    }

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
        stage.task_status !== "Выполнена" &&
        stage.task_status !== "Закрыта" &&
        stage.name_stage !== "Завершён" &&
        stage.name_stage !== "Отменён"
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

    console.log(order.id, order.stages);

    const handleSubmit = () => {
        navigate(`/orders/${order.id}`, { state: { order } });
    };

    const getEstimatedCompletionDate = (): string => {
        if (!order.stages || order.stages.length === 0) return "—";

        const lastStage = order.stages[order.stages.length - 1];

        let targetStage = lastStage;
        if (lastStage?.name_stage === "Завершён" || lastStage?.name_stage === "Отменён") {
            const realStages = order.stages.filter(stage =>
                stage.name_stage !== "Завершён" && stage.name_stage !== "Отменён"
            );
            targetStage = realStages[realStages.length - 1];
        }

        const deadline = targetStage?.times?.deadline;
        if (!deadline) return "—";

        const deadlineDate = deadline instanceof Date ? deadline : new Date(deadline);
        if (isNaN(deadlineDate.getTime())) return "—";

        return formatDate(deadlineDate);
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

            <div className={styles.detailsGridItem}>
                <CommonInfoField label="Адрес" value={order.delivery.address} />
                <CommonInfoField label="Материал" value={order.material} />
                <CommonInfoField label="Комментарий" value={order.comment || "—"} />
            </div>

        </div>
    );
}