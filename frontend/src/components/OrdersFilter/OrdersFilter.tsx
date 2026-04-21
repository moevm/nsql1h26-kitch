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

const sortOptions: Option[] = [
    { value: 1, label: 'По умолчанию' },
    { value: 2, label: 'Цена (по возрастанию)' },
    { value: 3, label: 'Цена (по убыванию)' },
    { value: 4, label: 'Дате создания (новые)' },
    { value: 5, label: 'Дате создания (старые)' },
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

export function OrdersFilter({onFilterChange}: OrdersFilterProps): ReactElement {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<number | null>(1);
    const [designType, setDesignType] = useState<number | null>(1);
    const [stage, setStage] = useState<number | null>(1);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');

    const getSortParams = (sortValue: number | null): { sort_by: string; sort: 'ASC' | 'DESC' } => {
        switch (sortValue) {
            case 2:
                return { sort_by: 'total_price', sort: 'ASC' };
            case 3:
                return { sort_by: 'total_price', sort: 'DESC' };
            case 4:
                return { sort_by: 'created_at', sort: 'DESC' };
            case 5:
                return { sort_by: 'created_at', sort: 'ASC' };
            default:
                return { sort_by: 'created_at', sort: 'DESC' };
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

    const handleApplyFilters = useCallback(() => {
        const { sort_by, sort } = getSortParams(sortBy);

        const filters: Partial<FilterParams> = {
            name_design: searchQuery || undefined,
            type: getDesignTypeValue(designType) || undefined,
            stage: getStageValue(stage) || undefined,
            min_price: priceMin ? Number(priceMin) : undefined,
            max_price: priceMax ? Number(priceMax) : undefined,
            from_created: dateFrom || undefined,
            to_created: dateTo || undefined,
            sort_by: sortBy === 1 ? undefined : sort_by,
            sort: sortBy === 1 ? undefined : sort,
        };
        onFilterChange(filters);
    }, [searchQuery, sortBy, designType, stage, dateFrom, dateTo, priceMin, priceMax, onFilterChange]);

    const handleResetFilters = useCallback(() => {
        setSearchQuery('');
        setSortBy(1);
        setDesignType(1);
        setStage(1);
        setDateFrom('');
        setDateTo('');
        setPriceMin('');
        setPriceMax('');
        onFilterChange({});
    }, [onFilterChange]);

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
                                label=""
                                value={dateFrom}
                                onChange={setDateFrom}
                                placeholder="с (ГГГГ-ММ-ДД)"
                                type="text"
                            />
                            <CommonInputField
                                label=""
                                value={dateTo}
                                onChange={setDateTo}
                                placeholder="по (ГГГГ-ММ-ДД)"
                                type="text"
                            />
                        </div>
                    </div>

                    <div className={styles.priceRangeField}>
                        <div className={styles.label}>Цена</div>
                        <div className={styles.priceInputs}>
                            <CommonInputField
                                label=""
                                value={priceMin}
                                onChange={setPriceMin}
                                placeholder="от"
                                type="number"
                                min={0}
                            />
                            <CommonInputField
                                label=""
                                value={priceMax}
                                onChange={setPriceMax}
                                placeholder="до"
                                type="number"
                                min={0}
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