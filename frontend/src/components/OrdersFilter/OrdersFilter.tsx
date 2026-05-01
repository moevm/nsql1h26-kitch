import {type ReactElement, useCallback, useState} from 'react';
import styles from './OrdersFilter.module.scss';
import type { FilterParams } from '../../api/orders';
import {CommonSelectField, type Option} from "../../UI/CommonSelectField/CommonSelectField.tsx";
import type {TypeDesign} from "../../types/design.ts";
import type {TypeStage} from "../../types/stages.ts";
import {CommonInputField} from "../../UI/CommonInputField/CommonInputField.tsx";
import {CommonButton} from "../../UI/CommonButton/CommonButton.tsx";

interface OrdersFilterProps {
    onFilterChange: (filters: Partial<FilterParams>) => void;
    initialFilters?: Partial<FilterParams>;
}

interface ValidationErrors {
    dateFrom?: string;
    dateTo?: string;
    deadlineFrom?: string;
    deadlineTo?: string;
    priceMin?: string;
    priceMax?: string;
}

const sortOptions: Option[] = [
    { value: 1, label: 'По умолчанию' },
    { value: 2, label: 'Цена (по возрастанию)' },
    { value: 3, label: 'Цена (по убыванию)' },
    { value: 4, label: 'Дате и времени создания (новые)' },
    { value: 5, label: 'Дате и времени создания (старые)' },
    { value: 6, label: 'Дате и времени завершения (ближайшие)' },
    { value: 7, label: 'Дате и времени завершения (дальние)' },
];

const designTypeOptions: Option[] = [
    { value: 1, label: 'Все типы' },
    { value: 2, label: 'Линейная' },
    { value: 3, label: 'Г-образная' },
    { value: 4, label: 'П-образная' },
    { value: 5, label: 'Островная' },
    { value: 6, label: 'Двухлинейная' },
];

const stageOptions: Option[] = [
    { value: 1, label: 'Все этапы' },
    { value: 2, label: 'Раскрой' },
    { value: 3, label: 'Производство' },
    { value: 4, label: 'Доставка' },
    { value: 5, label: 'Монтаж' },
    { value: 6, label: 'Завершён' },
    { value: 7, label: 'Отменён' },
];

const getDesignTypeValueFromString = (type: string | undefined): number => {
    switch (type) {
        case 'Линейная': return 2;
        case 'Г-образная': return 3;
        case 'П-образная': return 4;
        case 'Островная': return 5;
        case 'Двухлинейная': return 6;
        default: return 1;
    }
};

const getStageValueFromString = (stage: string | undefined): number => {
    switch (stage) {
        case 'Раскрой': return 2;
        case 'Производство': return 3;
        case 'Доставка': return 4;
        case 'Монтаж': return 5;
        case 'Завершён': return 6;
        case 'Отменён': return 7;
        default: return 1;
    }
};

const getSortValueFromParams = (sortBy: string | undefined, sort: 'ASC' | 'DESC' | undefined): number => {
    if (sortBy === 'total_price' && sort === 'ASC') return 2;
    if (sortBy === 'total_price' && sort === 'DESC') return 3;
    if (sortBy === 'created_at' && sort === 'DESC') return 4;
    if (sortBy === 'created_at' && sort === 'ASC') return 5;
    if (sortBy === 'deadline' && sort === 'ASC') return 6;
    if (sortBy === 'deadline' && sort === 'DESC') return 7;
    return 1;
};

const formatDateTimeForInput = (dateTimeStr: string | undefined): string => {
    if (!dateTimeStr) return '';
    try {
        const date = new Date(dateTimeStr);
        if (isNaN(date.getTime())) return '';

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day}.${month}.${year} ${hours}:${minutes}`;
    } catch {
        return '';
    }
};

const convertToUTC = (dateTimeStr: string, isEndOfDay: boolean = false): string | undefined => {
    if (!dateTimeStr) return undefined;
    try {
        const parts = dateTimeStr.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
        if (!parts) return undefined;

        const [ , day, month, year, hours, minutes] = parts;
        const hour = parseInt(hours);
        const minute = parseInt(minutes);

        let localDate: Date;

        if (isEndOfDay && hour === 0 && minute === 0) {
            localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 23, 59, 59, 999);
        } else if (isEndOfDay) {
            localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour, minute, 59, 999);
        } else {
            localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour, minute, 0, 0);
        }

        if (isNaN(localDate.getTime())) return undefined;

        console.log(localDate.toISOString())

        return localDate.toISOString();
    } catch {
        return undefined;
    }
};

const validateDateTime = (value: string): boolean => {
    if (!value) return true;
    const regex = /^\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2}$/;
    if (!regex.test(value)) return false;

    const parts = value.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
    if (!parts) return false;

    const [, day, month, year, hours, minutes] = parts;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
    return !isNaN(date.getTime());
};

export function OrdersFilter({onFilterChange, initialFilters}: OrdersFilterProps): ReactElement {
    const [searchQuery, setSearchQuery] = useState(initialFilters?.name_design || "");
    const [searchMaterial, setSearchMaterial] = useState(initialFilters?.material || "");
    const [searchAddress, setSearchAddress] = useState(initialFilters?.address || "");
    const [searchComment, setSearchComment] = useState(initialFilters?.comment || "");
    const [sortBy, setSortBy] = useState<number | null>(getSortValueFromParams(initialFilters?.sort_by, initialFilters?.sort));
    const [designType, setDesignType] = useState<number | null>(getDesignTypeValueFromString(initialFilters?.type));
    const [stage, setStage] = useState<number | null>(getStageValueFromString(initialFilters?.stage));

    const [dateFrom, setDateFrom] = useState(formatDateTimeForInput(initialFilters?.from_created));
    const [dateTo, setDateTo] = useState(formatDateTimeForInput(initialFilters?.to_created));
    const [deadlineFrom, setDeadlineFrom] = useState(formatDateTimeForInput(initialFilters?.from_deadline));
    const [deadlineTo, setDeadlineTo] = useState(formatDateTimeForInput(initialFilters?.to_deadline));

    const [priceMin, setPriceMin] = useState(initialFilters?.min_price ? String(initialFilters.min_price) : "");
    const [priceMax, setPriceMax] = useState(initialFilters?.max_price ? String(initialFilters.max_price) : "");

    const [errors, setErrors] = useState<ValidationErrors>({});

    const getSortParams = (sortValue: number | null): { sort_by: string; sort: 'ASC' | 'DESC' } => {
        switch (sortValue) {
            case 2: return { sort_by: 'total_price', sort: 'ASC' };
            case 3: return { sort_by: 'total_price', sort: 'DESC' };
            case 4: return { sort_by: 'created_at', sort: 'DESC' };
            case 5: return { sort_by: 'created_at', sort: 'ASC' };
            default: return { sort_by: 'created_at', sort: 'DESC' };
        }
    };

    const getDesignTypeValue = (typeValue: number | null): TypeDesign | '' => {
        switch (typeValue) {
            case 2: return 'Линейная';
            case 3: return 'Г-образная';
            case 4: return 'П-образная';
            case 5: return 'Островная';
            case 6: return 'Двухлинейная';
            default: return '';
        }
    };

    const getStageValue = (stageValue: number | null): TypeStage | '' => {
        switch (stageValue) {
            case 2: return 'Раскрой';
            case 3: return 'Производство';
            case 4: return 'Доставка';
            case 5: return 'Монтаж';
            case 6: return 'Завершён';
            case 7: return 'Отменён';
            default: return '';
        }
    };

    const validateDateRanges = useCallback((): boolean => {
        const newErrors: ValidationErrors = {};

        if (dateFrom && !validateDateTime(dateFrom)) {
            newErrors.dateFrom = 'Неверный формат (ДД.ММ.ГГГГ ЧЧ:мм)';
        }
        if (dateTo && !validateDateTime(dateTo)) {
            newErrors.dateTo = 'Неверный формат (ДД.ММ.ГГГГ ЧЧ:мм)';
        }
        if (dateFrom && dateTo) {
            const fromDate = new Date(dateFrom.split('.').reverse().join('-').replace(' ', 'T'));
            const toDate = new Date(dateTo.split('.').reverse().join('-').replace(' ', 'T'));
            if (fromDate > toDate) {
                newErrors.dateTo = 'Дата "по" не может быть раньше даты "с"';
            }
        }

        if (deadlineFrom && !validateDateTime(deadlineFrom)) {
            newErrors.deadlineFrom = 'Неверный формат (ДД.ММ.ГГГГ ЧЧ:мм)';
        }
        if (deadlineTo && !validateDateTime(deadlineTo)) {
            newErrors.deadlineTo = 'Неверный формат (ДД.ММ.ГГГГ ЧЧ:мм)';
        }
        if (deadlineFrom && deadlineTo) {
            const fromDate = new Date(deadlineFrom.split('.').reverse().join('-').replace(' ', 'T'));
            const toDate = new Date(deadlineTo.split('.').reverse().join('-').replace(' ', 'T'));
            if (fromDate > toDate) {
                newErrors.deadlineTo = 'Дата "по" не может быть раньше даты "с"';
            }
        }

        if (priceMin && Number(priceMin) < 0) {
            newErrors.priceMin = 'Цена не может быть отрицательной';
        }
        if (priceMax && Number(priceMax) < 0) {
            newErrors.priceMax = 'Цена не может быть отрицательной';
        }
        if (priceMin && priceMax && Number(priceMin) > Number(priceMax)) {
            newErrors.priceMax = 'Максимальная цена не может быть меньше минимальной';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [dateFrom, dateTo, deadlineFrom, deadlineTo, priceMin, priceMax]);

    const handleApplyFilters = useCallback(() => {
        if (!validateDateRanges()) {
            return;
        }

        const { sort_by, sort } = getSortParams(sortBy);

        const filters: Partial<FilterParams> = {
            name_design: searchQuery || undefined,
            material: searchMaterial || undefined,
            address: searchAddress || undefined,
            comment: searchComment || undefined,
            type: getDesignTypeValue(designType) || undefined,
            stage: getStageValue(stage) || undefined,
            min_price: priceMin ? Number(priceMin) : undefined,
            max_price: priceMax ? Number(priceMax) : undefined,
            from_created: convertToUTC(dateFrom, false),
            to_created: convertToUTC(dateTo, true),
            from_deadline: convertToUTC(deadlineFrom, false),
            to_deadline: convertToUTC(deadlineTo, true),
            sort_by: sortBy === 1 ? undefined : sort_by,
            sort: sortBy === 1 ? undefined : sort,
        };

        onFilterChange(filters);
    }, [searchQuery, searchMaterial, searchAddress, searchComment, sortBy, designType, stage, dateFrom, dateTo, deadlineFrom, deadlineTo, priceMin, priceMax, onFilterChange, validateDateRanges]);

    const handleResetFilters = useCallback(() => {
        setSearchQuery('');
        setSearchMaterial('');
        setSearchAddress('');
        setSearchComment('');
        setSortBy(1);
        setDesignType(1);
        setStage(1);
        setDateFrom('');
        setDateTo('');
        setDeadlineFrom('');
        setDeadlineTo('');
        setPriceMin('');
        setPriceMax('');
        setErrors({});
        onFilterChange({});
    }, [onFilterChange]);

    const handleDateFromChange = (value: string) => {
        setDateFrom(value);
        if (errors.dateFrom) setErrors(prev => ({ ...prev, dateFrom: undefined }));
        if (errors.dateTo) setErrors(prev => ({ ...prev, dateTo: undefined }));
    };

    const handleDateToChange = (value: string) => {
        setDateTo(value);
        if (errors.dateFrom) setErrors(prev => ({ ...prev, dateFrom: undefined }));
        if (errors.dateTo) setErrors(prev => ({ ...prev, dateTo: undefined }));
    };

    const handleDeadlineFromChange = (value: string) => {
        setDeadlineFrom(value);
        if (errors.deadlineFrom) setErrors(prev => ({ ...prev, deadlineFrom: undefined }));
        if (errors.deadlineTo) setErrors(prev => ({ ...prev, deadlineTo: undefined }));
    };

    const handleDeadlineToChange = (value: string) => {
        setDeadlineTo(value);
        if (errors.deadlineFrom) setErrors(prev => ({ ...prev, deadlineFrom: undefined }));
        if (errors.deadlineTo) setErrors(prev => ({ ...prev, deadlineTo: undefined }));
    };

    const handlePriceMinChange = (value: string) => {
        setPriceMin(value);
        if (errors.priceMin) setErrors(prev => ({ ...prev, priceMin: undefined }));
        if (errors.priceMax) setErrors(prev => ({ ...prev, priceMax: undefined }));
    };

    const handlePriceMaxChange = (value: string) => {
        setPriceMax(value);
        if (errors.priceMin) setErrors(prev => ({ ...prev, priceMin: undefined }));
        if (errors.priceMax) setErrors(prev => ({ ...prev, priceMax: undefined }));
    };

    return (
        <div className={styles.filterContainer}>
            <div className={styles.filterBar}>
                <div className={styles.filterRow}>
                    <div className={styles.searchField}>
                        <CommonInputField
                            label="Поиск"
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Поиск по дизайну..."
                        />
                    </div>

                    <div className={styles.filterField}>
                        <CommonInputField
                            label="Материал"
                            value={searchMaterial}
                            onChange={setSearchMaterial}
                            placeholder="Материал..."
                        />
                    </div>

                    <div className={styles.filterField}>
                        <CommonInputField
                            label="Адрес"
                            value={searchAddress}
                            onChange={setSearchAddress}
                            placeholder="Адрес доставки..."
                        />
                    </div>

                    <div className={styles.filterField}>
                        <CommonInputField
                            label="Комментарий"
                            value={searchComment}
                            onChange={setSearchComment}
                            placeholder="Комментарий..."
                        />
                    </div>

                    <div className={styles.filterField}>
                        <CommonSelectField
                            label="Сортировка"
                            value={sortBy}
                            options={sortOptions}
                            onChange={setSortBy}
                        />
                    </div>

                    <div className={styles.filterField}>
                        <CommonSelectField
                            label="Тип дизайна"
                            value={designType}
                            options={designTypeOptions}
                            onChange={setDesignType}
                        />
                    </div>

                    <div className={styles.filterField}>
                        <CommonSelectField
                            label="Этап"
                            value={stage}
                            options={stageOptions}
                            onChange={setStage}
                        />
                    </div>
                </div>

                <div className={styles.filterRow}>
                    <div className={styles.dateRangeField}>
                        <div className={styles.label}>Дата создания</div>
                        <div className={styles.dateInputs}>
                            <CommonInputField
                                label="От"
                                value={dateFrom}
                                onChange={handleDateFromChange}
                                placeholder="ДД.ММ.ГГГГ ЧЧ:мм"
                                type="text"
                                error={!!errors.dateFrom}
                                helperText={errors.dateFrom || ""}
                            />
                            <CommonInputField
                                label="До"
                                value={dateTo}
                                onChange={handleDateToChange}
                                placeholder="ДД.ММ.ГГГГ ЧЧ:мм"
                                type="text"
                                error={!!errors.dateTo}
                                helperText={errors.dateTo || ""}
                            />
                        </div>
                    </div>

                    <div className={styles.dateRangeField}>
                        <div className={styles.label}>Дата завершения</div>
                        <div className={styles.dateInputs}>
                            <CommonInputField
                                label="От"
                                value={deadlineFrom}
                                onChange={handleDeadlineFromChange}
                                placeholder="ДД.ММ.ГГГГ ЧЧ:мм"
                                type="text"
                                error={!!errors.deadlineFrom}
                                helperText={errors.deadlineFrom || ""}
                            />
                            <CommonInputField
                                label="До"
                                value={deadlineTo}
                                onChange={handleDeadlineToChange}
                                placeholder="ДД.ММ.ГГГГ ЧЧ:мм"
                                type="text"
                                error={!!errors.deadlineTo}
                                helperText={errors.deadlineTo || ""}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.filterRow}>
                    <div className={styles.priceRangeField}>
                        <div className={styles.label}>Цена</div>
                        <div className={styles.priceInputs}>
                            <CommonInputField
                                label="От"
                                value={priceMin}
                                onChange={handlePriceMinChange}
                                placeholder="от"
                                type="number"
                                min={0}
                                error={!!errors.priceMin}
                                helperText={errors.priceMin || ""}
                            />
                            <CommonInputField
                                label="До"
                                value={priceMax}
                                onChange={handlePriceMaxChange}
                                placeholder="до"
                                type="number"
                                min={0}
                                error={!!errors.priceMax}
                                helperText={errors.priceMax || ""}
                            />
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <CommonButton
                            title="Применить"
                            onClick={handleApplyFilters}
                            variant="primary"
                        />
                        <CommonButton
                            title="Сбросить"
                            onClick={handleResetFilters}
                            variant="text"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}