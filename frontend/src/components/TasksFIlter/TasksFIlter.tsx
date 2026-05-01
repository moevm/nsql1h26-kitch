import { type ReactElement, useCallback, useState } from 'react';
import styles from './TasksFIlter.module.scss';
import type { TaskFilterParams } from '../../api/tasks.ts';
import { CommonSelectField, type Option } from '../../UI/CommonSelectField/CommonSelectField.tsx';
import { CommonInputField } from '../../UI/CommonInputField/CommonInputField.tsx';
import { CommonButton } from '../../UI/CommonButton/CommonButton.tsx';
import type { TypeStage, TypeTask } from '../../types/stages.ts';

interface TasksFilterProps {
    onFilterChange: (filters: Partial<TaskFilterParams>) => void;
    initialFilters?: Partial<TaskFilterParams>;
}

const statusOptions: Option[] = [
    { value: 0, label: 'Все статусы' },
    { value: 1, label: 'Доступна' },
    { value: 2, label: 'В процессе' },
    { value: 3, label: 'Выполнена' },
    { value: 4, label: 'Просрочена' },
    { value: 5, label: 'Отменена' },
];

const stageOptions: Option[] = [
    { value: 0, label: 'Все этапы' },
    { value: 1, label: 'Раскрой' },
    { value: 2, label: 'Производство' },
    { value: 3, label: 'Доставка' },
    { value: 4, label: 'Монтаж' },
];

const sortOptions: Option[] = [
    { value: 1, label: 'По умолчанию (новые)' },
    { value: 2, label: 'Дата создания (старые)' },
    { value: 3, label: 'Дедлайн (сначала ближайшие)' },
    { value: 4, label: 'Дедлайн (сначала дальние)' },
    { value: 5, label: 'Дизайн (А-Я)' },
    { value: 6, label: 'Дизайн (Я-А)' },
    { value: 7, label: 'Материал (А-Я)' },
    { value: 8, label: 'Материал (Я-А)' },
    { value: 9, label: 'Расчетное время (возр.)' },
    { value: 10, label: 'Расчетное время (убыв.)' },
];

const getStatusValue = (status?: TypeTask): number => {
    switch (status) {
        case 'Доступна': return 1;
        case 'В процессе': return 2;
        case 'Выполнена': return 3;
        case 'Просрочена': return 4;
        case 'Отменена': return 5;
        default: return 0;
    }
};

const getStatusFromValue = (value: number): TypeTask | undefined => {
    switch (value) {
        case 1: return 'Доступна';
        case 2: return 'В процессе';
        case 3: return 'Выполнена';
        case 4: return 'Просрочена';
        case 5: return 'Отменена';
        default: return undefined;
    }
};

const getStageValue = (stage?: TypeStage): number => {
    switch (stage) {
        case 'Раскрой': return 1;
        case 'Производство': return 2;
        case 'Доставка': return 3;
        case 'Монтаж': return 4;
        default: return 0;
    }
};

const getStageFromValue = (value: number): TypeStage | undefined => {
    switch (value) {
        case 1: return 'Раскрой';
        case 2: return 'Производство';
        case 3: return 'Доставка';
        case 4: return 'Монтаж';
        default: return undefined;
    }
};

const getSortParams = (sortValue: number | null): { sort_by: TaskFilterParams['sort_by']; sort: 'ASC' | 'DESC' } => {
    switch (sortValue) {
        case 2:
            return { sort_by: 'created_at', sort: 'ASC' };
        case 3:
            return { sort_by: 'deadline', sort: 'ASC' };
        case 4:
            return { sort_by: 'deadline', sort: 'DESC' };
        case 5:
            return { sort_by: 'name_design', sort: 'ASC' };
        case 6:
            return { sort_by: 'name_design', sort: 'DESC' };
        case 7:
            return { sort_by: 'material', sort: 'ASC' };
        case 8:
            return { sort_by: 'material', sort: 'DESC' };
        case 9:
            return { sort_by: 'estimated_time', sort: 'ASC' };
        case 10:
            return { sort_by: 'estimated_time', sort: 'DESC' };
        default:
            return { sort_by: 'created_at', sort: 'DESC' };
    }
};

const getSortValueFromParams = (sortBy?: string, sort?: 'ASC' | 'DESC'): number | null => {
    if (sortBy === 'created_at' && sort === 'ASC') return 2;
    if (sortBy === 'deadline' && sort === 'ASC') return 3;
    if (sortBy === 'deadline' && sort === 'DESC') return 4;
    if (sortBy === 'name_design' && sort === 'ASC') return 5;
    if (sortBy === 'name_design' && sort === 'DESC') return 6;
    if (sortBy === 'material' && sort === 'ASC') return 7;
    if (sortBy === 'material' && sort === 'DESC') return 8;
    if (sortBy === 'estimated_time' && sort === 'ASC') return 9;
    if (sortBy === 'estimated_time' && sort === 'DESC') return 10;
    return 1;
};

export function TasksFilter({ onFilterChange, initialFilters }: TasksFilterProps): ReactElement {
    const [searchQuery, setSearchQuery] = useState(initialFilters?.name_design || '');
    const [material, setMaterial] = useState(initialFilters?.material || '');   // добавлено
    const [statusValue, setStatusValue] = useState<number | null>(getStatusValue(initialFilters?.task_status));
    const [stageValue, setStageValue] = useState<number | null>(getStageValue(initialFilters?.name_stage));
    const [sortValue, setSortValue] = useState<number | null>(getSortValueFromParams(initialFilters?.sort_by, initialFilters?.sort));
    const [minTime, setMinTime] = useState(initialFilters?.min_estimated_time?.toString() || '');
    const [maxTime, setMaxTime] = useState(initialFilters?.max_estimated_time?.toString() || '');

    const handleApplyFilters = useCallback(() => {
        const { sort_by, sort } = getSortParams(sortValue);

        const filters: Partial<TaskFilterParams> = {
            name_design: searchQuery || undefined,
            material: material || undefined,        // добавлено
            task_status: getStatusFromValue(statusValue ?? 0),
            name_stage: getStageFromValue(stageValue ?? 0),
            min_estimated_time: minTime ? Number(minTime) : undefined,
            max_estimated_time: maxTime ? Number(maxTime) : undefined,
            sort_by: sortValue === 1 ? undefined : sort_by,
            sort: sortValue === 1 ? undefined : sort,
        };
        onFilterChange(filters);
    }, [searchQuery, material, statusValue, stageValue, sortValue, minTime, maxTime, onFilterChange]);

    const handleResetFilters = useCallback(() => {
        setSearchQuery('');
        setMaterial('');          // добавлено
        setStatusValue(0);
        setStageValue(0);
        setSortValue(1);
        setMinTime('');
        setMaxTime('');
        onFilterChange({});
    }, [onFilterChange]);

    return (
        <div className={styles.filterContainer}>
            <div className={styles.filterBar}>
                <div className={styles.filterRow}>
                    <div className={styles.searchField}>
                        <CommonInputField
                            label="Поиск по дизайну"
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Введите название дизайна..."
                        />
                    </div>

                    {/* Добавлен фильтр по материалу */}
                    <div className={styles.filterField}>
                        <CommonInputField
                            label="Материал"
                            value={material}
                            onChange={setMaterial}
                            placeholder="Введите материал..."
                        />
                    </div>

                    <div className={styles.filterField}>
                        <CommonSelectField
                            label="Статус"
                            value={statusValue}
                            options={statusOptions}
                            onChange={setStatusValue}
                        />
                    </div>

                    <div className={styles.filterField}>
                        <CommonSelectField
                            label="Этап"
                            value={stageValue}
                            options={stageOptions}
                            onChange={setStageValue}
                        />
                    </div>

                    <div className={styles.filterField}>
                        <CommonSelectField
                            label="Сортировка"
                            value={sortValue}
                            options={sortOptions}
                            onChange={setSortValue}
                        />
                    </div>
                </div>

                <div className={styles.filterRow}>
                    <div className={styles.timeRangeField}>
                        <div className={styles.label}>Расчетное время (часы)</div>
                        <div className={styles.rangeInputs}>
                            <CommonInputField
                                label=""
                                value={minTime}
                                onChange={setMinTime}
                                placeholder="от"
                                type="number"
                                min={0}
                            />
                            <span className={styles.separator}>—</span>
                            <CommonInputField
                                label=""
                                value={maxTime}
                                onChange={setMaxTime}
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