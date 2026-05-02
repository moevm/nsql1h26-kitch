import {type ReactElement, useMemo, useState} from "react";
import style from "./CreateOrderPage.module.scss"

import {Alert} from "@mui/material";

import {CommonInputField} from "../../../UI/CommonInputField/CommonInputField.tsx";
import {CommonButton} from "../../../UI/CommonButton/CommonButton.tsx";
import {CommonInfoField} from "../../../UI/CommonInfoField/CommonInfoField.tsx";
import {CommonSelectField} from "../../../UI/CommonSelectField/CommonSelectField.tsx";

import {useMaterials} from "../../../hooks/useMaterials.ts";
import {useDesigns} from "../../../hooks/useDesigns.ts";
import {useCreateOrder} from "../../../hooks/useOrders.ts";
import {useNavigate} from "react-router-dom";

import {colors} from "../../../types/color.ts";
import {AxiosError} from "axios";
import type {TypeDesign} from "../../../types/design.ts";
import type {OrderCreate} from "../../../types/order.ts";

interface FormErrors {
    username?: string;
    phone?: string;
    address?: string;
    design?: string;
    color?: string;
    material?: string;
    floor?: string;
    lift?: string;
}

export function CreateOrderPage(): ReactElement {
    const navigate = useNavigate();
    const createOrder = useCreateOrder()

    const [username, setUsername] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [address, setAddress] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const [validationErrors, setValidationErrors] = useState<FormErrors>({});

    const {data: designs, isLoading: designsLoading} = useDesigns();
    const [selectedDesignIndex, setSelectedDesignIndex] = useState<number | null>(0);
    const selectedDesign = selectedDesignIndex !== null ? designs?.[selectedDesignIndex] : null;
    const designOptions = designs?.map((design, index) => ({
        value: index,
        label: `${design.name} (${design.type})`
    })) ?? [];

    const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(0);
    const selectedColor = selectedColorIndex !== null ? colors[selectedColorIndex] : null;
    const colorOptions = colors?.map((color, index) => ({
        value: index,
        label: color.name
    })) ?? [];

    const { data: materials, isLoading: materialsLoading } = useMaterials();
    const [selectedMaterialIndex, setSelectedMaterialIndex] = useState<number | null>(0);
    const selectedMaterial = selectedMaterialIndex !== null ? materials?.[selectedMaterialIndex] : null;
    const materialOptions = materials?.map((material, index) => ({
        value: index,
        label: material.name
    })) ?? [];

    const [hasLift, setHasLift] = useState<boolean | null>(true);
    const [floor, setFloor] = useState<string>("1");

    const typePrice = useMemo(() => {
        return selectedDesign?.design_price ?? 0;
    }, [selectedDesign]);

    const materialPrice = useMemo(() => {
        if (!selectedMaterial || !selectedDesign) return 0;
        return Math.round(selectedMaterial.cost * (selectedDesign.need_material || 1));
    }, [selectedDesign, selectedMaterial]);

    const deliveryPrice = useMemo(() => {
        const floorPrice = 100;
        const liftDiscount = hasLift ? 0.5 : 1;
        return (1000 + (parseInt(floor) || 1) * floorPrice) * liftDiscount;
    }, [floor, hasLift]);

    const totalPrice = typePrice + materialPrice + deliveryPrice;

    const validatePhone = (phone: string) => {
        const digits = phone.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 12;
    };

    const validateForm = (): boolean => {
        const errors: FormErrors = {};

        if (!username.trim()) errors.username = "Укажите имя заказчика";
        if (!phone.trim()) errors.phone = "Укажите номер телефона";
        else if (!validatePhone(phone)) errors.phone = "Введите корректный номер (10–12 цифр)";
        if (!address.trim()) errors.address = "Укажите адрес доставки";
        if (selectedDesignIndex === null) errors.design = "Выберите дизайн";
        if (selectedColorIndex === null) errors.color = "Выберите цвет";
        if (selectedMaterialIndex === null) errors.material = "Выберите материал";
        if (hasLift === null) errors.lift = "Укажите наличие лифта";

        const floorNum = parseInt(floor);
        if (isNaN(floorNum) || floorNum < 1 || floorNum > 100) {
            errors.floor = "Этаж должен быть целым числом от 1 до 100";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const clearFieldError = (field: keyof FormErrors) => {
        if (validationErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleUsernameChange = (value: string)=> {
        setUsername(value);
        clearFieldError('username');
    }

    const handlePhoneChange = (value: string) => {
        setPhone(value);
        clearFieldError('phone');
    }

    const handleAddressChange = (value: string) => {
        setAddress(value);
        clearFieldError('address');
    }

    const handleDesignChange = (value: number) => {
        setSelectedDesignIndex(value);
        clearFieldError('design');
    };

    const handleColorChange = (value: number) => {
        setSelectedColorIndex(value);
        clearFieldError('color');
    };

    const handleMaterialChange = (value: number) => {
        setSelectedMaterialIndex(value);
        clearFieldError('material');
    };

    const handleLiftChange = (value: number) => {
        setHasLift(value === 1 ? true : false);
        clearFieldError('lift');
    };

    const handleFloorChange = (value: string) => {
        setFloor(value);
        clearFieldError('floor');
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        if (!selectedDesign || !selectedMaterial || !selectedColor) return;

        const orderData: OrderCreate = {
            phone: phone,
            address: address,
            kitchen_type: selectedDesign.type as TypeDesign,
            design_id: selectedDesign.id!,
            color: {
                red: selectedColor.red,
                green: selectedColor.green,
                blue: selectedColor.blue,
                name: selectedColor.name
            },
            material: selectedMaterial.name,
            floor: parseInt(floor),
            has_lift: hasLift!,
            comment: notes || undefined,
            type_price: typePrice,
            material_price: materialPrice,
            delivery_price: deliveryPrice,
            comment_price: 0,
        };

        try {
            await createOrder.mutateAsync(orderData);
            alert("Заказ успешно создан!");
            navigate("/orders");
        } catch (error) {
            console.error("Ошибка при создании заказа:", error);
        }
    };

    const getErrorMessage = () => {
        if (!createOrder.error) return null;

        if (createOrder.error instanceof AxiosError) {
            if (createOrder.error.response?.data?.detail) return createOrder.error.response.data.detail;
            if (createOrder.error.response?.data?.message) return createOrder.error.response.data.message;
            if (createOrder.error.message) return createOrder.error.message;
        }

        if (createOrder.error.message) return createOrder.error.message;
        return "Ошибка при создании заказа. Попробуйте позже.";
    };

    return (
        <div className={style.cardContainer}>

            <div className={style.headerGridItem}>
                <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                    <div className={style.mainTitle}>Информация по заказу</div>
                    <div className={style.subTitle}>Укажите нам свои предпочтения</div>
                </div>
            </div>

            {createOrder.error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {getErrorMessage()}
                </Alert>
            )}

            <div className={`${style.clientNameGridItem} ${style.gridItemWithError}`}>
                <CommonInputField
                    label={"Имя заказчика"}
                    placeholder={"Введите ваше имя"}
                    type={"text"}
                    value={username}
                    onChange={handleUsernameChange}
                    disabled={createOrder.isPending}
                    error={!!validationErrors.username}
                    helperText={validationErrors.username || ""}
                />
            </div>

            <div className={`${style.phoneGridItem} ${style.gridItemWithError}`}>
                <CommonInputField
                    label={"Номер телефона"}
                    placeholder={"Введите ваш номер телефона"}
                    type={"text"}
                    value={phone}
                    onChange={handlePhoneChange}
                    disabled={createOrder.isPending}
                    error={!!validationErrors.phone}
                    helperText={validationErrors.phone || ""}
                />
            </div>

            <div className={`${style.addressGridItem} ${style.gridItemWithError}`}>
                <CommonInputField
                    label={"Адрес доставки"}
                    placeholder={"Введите ваш адрес"}
                    type={"text"}
                    value={address}
                    onChange={handleAddressChange}
                    disabled={createOrder.isPending}
                    error={!!validationErrors.address}
                    helperText={validationErrors.address || ""}
                />
            </div>

            <div className={style.kitchenTypeGridItem}>
                <CommonSelectField
                    label="Дизайн кухни"
                    value={selectedDesignIndex}
                    options={designOptions}
                    onChange={handleDesignChange}
                    disabled={designsLoading || createOrder.isPending}
                />
            </div>

            <div className={style.colorGridItem}>
                <CommonSelectField
                    label="Цвет"
                    value={selectedColorIndex}
                    options={colorOptions}
                    onChange={handleColorChange}
                    disabled={createOrder.isPending}
                />
            </div>

            <div className={style.materialGridItem}>
                <CommonSelectField
                    label="Материал"
                    value={selectedMaterialIndex}
                    options={materialOptions}
                    onChange={handleMaterialChange}
                    disabled={materialsLoading || createOrder.isPending}
                />
            </div>

            <div className={style.floorGridItem}>
                <CommonInputField
                    label={"Этаж"}
                    placeholder={"Ваш этаж"}
                    type={"number"}
                    value={floor}
                    onChange={handleFloorChange}
                    min={1}
                    max={100}
                    disabled={createOrder.isPending}
                    error={!!validationErrors.floor}
                    helperText={validationErrors.floor || ""}
                />
            </div>

            <div className={style.elevatorGridItem}>
                <CommonSelectField
                    label="Наличие лифта"
                    value={hasLift === true ? 1 : hasLift === false ? 2 : undefined}
                    options={[
                        { value: 1, label: "Да" },
                        { value: 2, label: "Нет" }
                    ]}
                    onChange={handleLiftChange}
                    disabled={createOrder.isPending}
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
                    rows={4}
                    disabled={createOrder.isPending}
                />
            </div>

            <div className={style.priceGridItem}>
                <CommonInfoField
                    label={selectedDesign ? selectedDesign.name : "Дизайн"}
                    value={`${typePrice.toLocaleString()} ₽`}
                />
            </div>

            <div className={style.priceGridItem}>
                <CommonInfoField
                    label={selectedMaterial ? selectedMaterial.name : "Материал"}
                    value={`${materialPrice.toLocaleString()} ₽`}
                />
            </div>

            <div className={style.priceGridItem}>
                <CommonInfoField
                    label={`Доставка ${floor} этаж`}
                    value={`${deliveryPrice.toLocaleString()} ₽`}
                />
            </div>

            <div className={style.payButtonGridItem}>
                <CommonButton
                    title={`Оплатить ${totalPrice} ₽`}
                    variant={"primary"}
                    onClick={handleSubmit}
                />
            </div>

        </div>
    );
}