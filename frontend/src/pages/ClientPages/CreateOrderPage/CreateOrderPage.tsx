import {type ReactElement, useState} from "react";
import style from "./CreateOrderPage.module.scss"

// elements
import {CommonInputField} from "../../../UI/CommonInputField/CommonInputField.tsx";
import {CommonButton} from "../../../UI/CommonButton/CommonButton.tsx";
import {CommonInfoField} from "../../../UI/CommonInfoField/CommonInfoField.tsx";
import {CommonSelectField} from "../../../UI/CommonSelectField/CommonSelectField.tsx";

// hooks
import {useMaterials} from "../../../hooks/useMaterials.ts";
import {useDesigns} from "../../../hooks/useDesigns.ts";

//types
import {colors} from "../../../types/design.ts";

export function CreateOrderPage(): ReactElement {
    // text
    const [clientName, setClientName] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [address, setAddress] = useState<string>("");
    const [notes, setNotes] = useState<string>("");

    // design type
    const {data: designs, isLoading: designsLoading} = useDesigns();
    const [selectedDesignIndex, setSelectedDesignIndex] = useState<number | null>(null);
    const designOptions = designs?.map((design, index) => ({
        value: index,
        label: `${design.name} (${design.type})`
    })) ?? [];

    // color
    const [selectedColor, setSelectedColor] = useState<number | null>(null);
    const colorOptions = colors?.map((color, index) => ({
        value: index,
        label: color.name
    })) ?? [];

    // materials
    const { data: materials, isLoading: materialsLoading } = useMaterials();
    const [selectedMaterialIndex, setSelectedMaterialIndex] = useState<number | null>(null);
    const materialOptions = materials?.map((material, index) => ({
        value: index,
        label: material.name
    })) ?? [];

    // lift and delivery
    const [selectedLift, setSelectedLift] = useState<number | null>(null);
    const [floor, setFloor] = useState<string>("1");

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
                    value={clientName}
                    onChange={setClientName}
                />
            </div>

            <div className={style.phoneGridItem}>
                <CommonInputField
                    label={"Номер телефона"}
                    placeholder={"Введите ваш номер телефона"}
                    type={"text"}
                    value={phone}
                    onChange={setPhone}
                />
            </div>

            <div className={style.addressGridItem}>
                <CommonInputField
                    label={"Адрес доставки"}
                    placeholder={"Введите ваш адрес"}
                    type={"text"}
                    value={address}
                    onChange={setAddress}
                />
            </div>

            <div className={style.kitchenTypeGridItem}>
                <CommonSelectField
                    label="Дизайн кухни"
                    value={selectedDesignIndex ?? undefined}
                    options={designOptions}
                    onChange={setSelectedDesignIndex}
                    disabled={designsLoading}
                />
            </div>

            <div className={style.colorGridItem}>
                <CommonSelectField
                    label="Цвет"
                    value={selectedColor}
                    options={colorOptions}
                    onChange={setSelectedColor}
                    disabled={false}
                />
            </div>

            <div className={style.materialGridItem}>
                <CommonSelectField
                    label="Материал"
                    value={selectedMaterialIndex ?? undefined}
                    options={materialOptions}
                    onChange={setSelectedMaterialIndex}
                    disabled={materialsLoading}
                />
            </div>

            <div className={style.floorGridItem}>
                <CommonInputField
                    label={"Этаж"}
                    placeholder={"Ваш этаж"}
                    type={"number"}
                    value={floor}
                    onChange={setFloor}
                    max={100}
                    min={1}
                />
            </div>

            <div className={style.elevatorGridItem}>
                <CommonSelectField
                    label="Лифт"
                    value={selectedLift}
                    options={[
                        {value: 1, label: "Да"},
                        {value: 2, label: "Нет"}
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
                    value={notes}
                    onChange={setNotes}
                    multiline={true}
                    rows={6}
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
                    label={`Доставка ${floor} этаж`}
                    value={`${Number(floor) * 100}$`}
                />
            </div>

            <div className={style.payButtonGridItem}>
                <CommonButton title={"Оплатить"}/>
            </div>

        </div>
    );
}