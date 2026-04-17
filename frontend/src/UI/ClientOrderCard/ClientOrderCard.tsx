import type {ReactElement} from "react";
import styles from "./ClientOrderCard.module.scss"
import {CommonInfoField} from "../CommonInfoField/CommonInfoField.tsx";
import {CommonButton} from "../CommonButton/CommonButton.tsx";
import type {Order} from "../../types/order.ts";

export function ClientOrderCard(order: Order): ReactElement {

    const handleSubmit = () => {

    };

    return (
        <div className={styles.cardContainer}>

            <div className={styles.orderIdGridItem}>
                <div className={styles.orderTitle}>
                    <div className={styles.orderTitleText}>
                        {`Заказ №${order}`}
                    </div>
                </div>
            </div>

            <div className={styles.totalPriceGridItem}>
                <CommonInfoField
                    label={"Цена"}
                    value={"100000$"}
                />
            </div>

            <div className={styles.creationDateGridItem}>
                <CommonInfoField
                    label={"Создан"}
                    value={"11:40 01.01.2026"}
                />
            </div>

            <div className={styles.endDateGridItem}>
                <CommonInfoField
                    label={"Дата завершения"}
                    value={"~ 11:40 01.02.2026"}
                />
            </div>

            <div className={styles.statusGridItem}>
                <div className={styles.statusChip}>
                    <span className={styles.statusText}>В обработке</span>
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