import {type ReactElement, useState} from "react";
import style from "./CreateOrderPage.module.scss"
import {CommonInputField} from "../../../UI/CommonInputField/CommonInputField.tsx";
import {CommonButton} from "../../../UI/CommonButton/CommonButton.tsx";
import {CommonInfoField} from "../../../UI/CommonInfoField/CommonInfoField.tsx";
import {CommonSelectField} from "../../../UI/CommonSelectField/CommonSelectField.tsx";


export function CreateOrderPage(): ReactElement {
    const [selectedLift, setSelectedLift] = useState("");

    return (
        <div className={style.cardContainer}>

            <div className={style.headerGridItem}>
                <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                    <div className={style.mainTitle}>Информация по заказу</div>
                    <div className={style.subTitle}>Укажите нам свои предпочтения</div>
                </div>
            </div>

            <div className={style.clientNameGridItem}>
                <CommonInputField
                    label={"Имя заказчика"}
                    placeholder={"Введите ваше имя"}
                    type={"text"}
                    value={""}
                />
            </div>

            <div className={style.phoneGridItem}>
                <CommonInputField
                    label={"Номер телефона"}
                    placeholder={"Введите ваш номер телефона"}
                    type={"text"}
                    value={""}
                />
            </div>

            <div className={style.addressGridItem}>
                <CommonInputField
                    label={"Адрес доставки"}
                    placeholder={"Введите ваш адрес"}
                    type={"text"}
                    value={""}
                />
            </div>

            <div className={style.kitchenTypeGridItem}>
                <CommonSelectField
                    label="Тип кухни"
                    value={selectedLift}
                    options={[
                        { value: "yes", label: "Да" },
                        { value: "no", label: "Нет" }
                    ]}
                    onChange={setSelectedLift}
                    disabled={false}
                />
            </div>

            <div className={style.colorGridItem}>
                <CommonSelectField
                    label="Цвет"
                    value={selectedLift}
                    options={[
                        { value: "yes", label: "Да" },
                        { value: "no", label: "Нет" }
                    ]}
                    onChange={setSelectedLift}
                    disabled={false}
                />
            </div>

            <div className={style.materialGridItem}>
                <CommonSelectField
                    label="Материал"
                    value={selectedLift}
                    options={[
                        { value: "yes", label: "Да" },
                        { value: "no", label: "Нет" }
                    ]}
                    onChange={setSelectedLift}
                    disabled={false}
                />
            </div>

            <div className={style.floorGridItem}>
                <CommonInputField
                    label={"Этаж"}
                    placeholder={"Ваш этаж"}
                    type={"text"}
                    value={""}
                />
            </div>

            <div className={style.elevatorGridItem}>
                <CommonSelectField
                    label="Лифт"
                    value={selectedLift}
                    options={[
                        { value: "yes", label: "Да" },
                        { value: "no", label: "Нет" }
                    ]}
                    onChange={setSelectedLift}
                    disabled={false}
                />
            </div>

            <div className={style.notesGridItem}>
                <CommonInputField
                    label={"Дополнительные пожелания"}
                    placeholder={"Расскажите о ваших пожеланиях"}
                    type={"text"}
                    value={""}
                />
            </div>

            <div className={style.priceGridItem}>
                <CommonInfoField
                    label={"Линейная №10"}
                    value={"100000$"}
                />
            </div>

            <div className={style.priceGridItem}>
                <CommonInfoField
                    label={"Массив дерева"}
                    value={"50000$"}
                />
            </div>

            <div className={style.priceGridItem}>
                <CommonInfoField
                    label={"Доставка 5 этаж"}
                    value={"500$"}
                />
            </div>

            <div className={style.payButtonGridItem}>
                <CommonButton title={"Оплатить"}/>
            </div>

        </div>
    );
}