import type {ReactElement} from "react";
import style from "./OrderDatailsPage.module.scss"
import type {Order} from "../../types/order.ts";
import {useLocation, useNavigate} from "react-router-dom";
import {CommonInfoField} from "../../UI/CommonInfoField/CommonInfoField.tsx";
import {useDesign} from "../../hooks/useDesigns.ts";
import defaultImage from "../../assets/image_sample.png";
import {CommonButton} from "../../UI/CommonButton/CommonButton.tsx";
import {formatDate} from "../../UI/FormatFunctions.ts";

export function OrderDetailsPage(): ReactElement {
    const location = useLocation();
    const navigate = useNavigate();

    const order: Order = (location.state as { order: Order })?.order;
    const {data: design, isLoading, error} = useDesign(order?.design_id);

    const handleBack = () => {
        navigate(-1);
    };

    if (isLoading) {
        return (<div>Загружаем ваш заказ...</div>);
    }

    if (error) {
        return (<div>Ошибка загрузки: {error.message}</div>);
    }

    return (
        <div className={style.cardContainer}>

            <div className={style.headerGridItem}>
                <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                    <div className={style.mainTitle}>Информация по заказу</div>
                    <div className={style.subTitle}>№ {order.id || "-"}</div>
                </div>
            </div>

            <div className={style.clientNameGridItem}>
                <CommonInfoField
                    label={"Имя заказчика"}
                    value={order?.client.username || "-"}
                />
            </div>

            <div className={style.phoneGridItem}>
                <CommonInfoField
                    label={"Номер телефона"}
                    value={order?.client.phone || "-"}
                />
            </div>

            <div className={style.addressGridItem}>
                <CommonInfoField
                    label={"Адрес заказа"}
                    value={order?.delivery.address || "-"}
                />
            </div>

            <div className={style.floorGridItem}>
                <CommonInfoField
                    label={"Этаж"}
                    value={`${order?.delivery.floor || "-"} этаж, ${order?.delivery.has_lift ? "лифт" : "без лифта"}`}
                />
            </div>

            <div className={style.kitchenTypeGridItem}>
                <CommonInfoField
                    label={"Дизайн, Тип, Цвет"}
                    value={`${design?.name || "-"} (${design?.type || "-"}, ${order?.color.name || "-"})`}
                />
            </div>

            <div className={style.materialGridItem}>
                <CommonInfoField
                    label={"Материал"}
                    value={order?.material || "-"}
                />
            </div>

            <div className={style.notesGridItem}>
                <CommonInfoField
                    label={"Дополнительные пожелание"}
                    value={order?.comment || "-"}
                />
            </div>

            <div className={style.imageGridItem}>
                <img src={defaultImage} className={style.cardImage} />
            </div>

            <div className={style.pricingGridItem}>
                <CommonInfoField
                    label={`Общая стоимость: ${order.pricing.total_price.toLocaleString() || "-"} ₽`}
                    value={`
                        ${design?.name || "-"}: ${order.pricing.type_price.toLocaleString()} ₽; 
                        ${order?.material || "-"}: ${order.pricing.material_price.toLocaleString()} ₽; 
                        ${order?.delivery.floor || "-"} этаж, ${order?.delivery.has_lift ? "лифт" : "без лифта"}: ${order.pricing.delivery_price.toLocaleString()} ₽
                    `}
                />
            </div>

            <div className={style.stagesGridItem}>
                <CommonInfoField
                    label={"В обработке"}
                    value={formatDate(order.created_at)}
                />
            </div>

            <div className={style.stagesGridItem}>
                <CommonInfoField
                    label={"Раскрой"}
                    value={"-"}
                />
            </div>

            <div className={style.stagesGridItem}>
                <CommonInfoField
                    label={"Производство"}
                    value={"-"}
                />
            </div>

            <div className={style.stagesGridItem}>
                <CommonInfoField
                    label={"Доставка"}
                    value={"-"}
                />
            </div>

            <div className={style.stagesGridItem}>
                <CommonInfoField
                    label={"Монтаж"}
                    value={"-"}
                />
            </div>

            <div className={style.buttonGridItem}>
                <CommonButton
                    title={"Обратно"}
                    variant={"primary"}
                    onClick={handleBack}
                />
            </div>

        </div>
    );
}