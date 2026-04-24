import { type ReactElement, useCallback, useState } from 'react';
import styles from './WorkersFilter.module.scss';
import type { WorkerFilterParams } from '../../api/workers.ts';
import { CommonSelectField, type Option } from '../../UI/CommonSelectField/CommonSelectField.tsx';
import { CommonInputField } from '../../UI/CommonInputField/CommonInputField.tsx';
import { CommonButton } from '../../UI/CommonButton/CommonButton.tsx';

interface WorkersFilterProps {
    onFilterChange: (filters: Partial<WorkerFilterParams>) => void;
    initialFilters?: Partial<WorkerFilterParams>;
}

const sortOptions: Option[] = [
    { value: 1, label: 'По умолчанию (новые)' },
    { value: 2, label: 'Имя (А-Я)' },
    { value: 3, label: 'Имя (Я-А)' },
    { value: 4, label: 'Должность (А-Я)' },
    { value: 5, label: 'Должность (Я-А)' },
    { value: 6, label: 'Выполненные задачи (возр.)' },
    { value: 7, label: 'Выполненные задачи (убыв.)' },
    { value: 8, label: 'Просроченные задачи (возр.)' },
    { value: 9, label: 'Просроченные задачи (убыв.)' },
    { value: 10, label: 'Дата создания (старые)' },
    { value: 11, label: 'Дата создания (новые)' },
];

const getSortParams = (sortValue: number | null): { sort_by: WorkerFilterParams['sort_by']; sort: 'ASC' | 'DESC' } => {
    switch (sortValue) {
        case 2:
            return { sort_by: 'name_worker', sort: 'ASC' };
        case 3:
            return { sort_by: 'name_worker', sort: 'DESC' };
        case 4:
            return { sort_by: 'worker_position', sort: 'ASC' };
        case 5:
            return { sort_by: 'worker_position', sort: 'DESC' };
        case 6:
            return { sort_by: 'count_completed_tasks', sort: 'ASC' };
        case 7:
            return { sort_by: 'count_completed_tasks', sort: 'DESC' };
        case 8:
            return { sort_by: 'count_overdue_tasks', sort: 'ASC' };
        case 9:
            return { sort_by: 'count_overdue_tasks', sort: 'DESC' };
        case 10:
            return { sort_by: 'created_at', sort: 'ASC' };
        case 11:
            return { sort_by: 'created_at', sort: 'DESC' };
        default:
            return { sort_by: 'created_at', sort: 'DESC' };
    }
};

const getSortValueFromParams = (sortBy?: string, sort?: 'ASC' | 'DESC'): number | null => {
    if (sortBy === 'name_worker' && sort === 'ASC') return 2;
    if (sortBy === 'name_worker' && sort === 'DESC') return 3;
    if (sortBy === 'worker_position' && sort === 'ASC') return 4;
    if (sortBy === 'worker_position' && sort === 'DESC') return 5;
    if (sortBy === 'count_completed_tasks' && sort === 'ASC') return 6;
    if (sortBy === 'count_completed_tasks' && sort === 'DESC') return 7;
    if (sortBy === 'count_overdue_tasks' && sort === 'ASC') return 8;
    if (sortBy === 'count_overdue_tasks' && sort === 'DESC') return 9;
    if (sortBy === 'created_at' && sort === 'ASC') return 10;
    if (sortBy === 'created_at' && sort === 'DESC') return 11;
    return 1;
};

export function WorkersFilter({ onFilterChange, initialFilters }: WorkersFilterProps): ReactElement {
    const [searchName, setSearchName] = useState(initialFilters?.name_worker || '');
    const [position, setPosition] = useState(initialFilters?.worker_position || '');
    const [sortValue, setSortValue] = useState<number | null>(getSortValueFromParams(initialFilters?.sort_by, initialFilters?.sort));
    const [workdayStart, setWorkdayStart] = useState(initialFilters?.start_workday || '');
    const [workdayEnd, setWorkdayEnd] = useState(initialFilters?.end_workday || '');
    const [minCompleted, setMinCompleted] = useState(initialFilters?.min_completed_tasks?.toString() || '');
    const [maxCompleted, setMaxCompleted] = useState(initialFilters?.max_completed_tasks?.toString() || '');
    const [minOverdue, setMinOverdue] = useState(initialFilters?.min_overdue_tasks?.toString() || '');
    const [maxOverdue, setMaxOverdue] = useState(initialFilters?.max_overdue_tasks?.toString() || '');
    const [dateFrom, setDateFrom] = useState(initialFilters?.from_created || '');
    const [dateTo, setDateTo] = useState(initialFilters?.to_created || '');

    const handleApplyFilters = useCallback(() => {
        const { sort_by, sort } = getSortParams(sortValue);

        const filters: Partial<WorkerFilterParams> = {
            name_worker: searchName || undefined,
            worker_position: position || undefined,
            start_workday: workdayStart || undefined,
            end_workday: workdayEnd || undefined,
            min_completed_tasks: minCompleted ? Number(minCompleted) : undefined,
            max_completed_tasks: maxCompleted ? Number(maxCompleted) : undefined,
            min_overdue_tasks: minOverdue ? Number(minOverdue) : undefined,
            max_overdue_tasks: maxOverdue ? Number(maxOverdue) : undefined,
            from_created: dateFrom || undefined,
            to_created: dateTo || undefined,
            sort_by: sortValue === 1 ? undefined : sort_by,
            sort: sortValue === 1 ? undefined : sort,
        };
        onFilterChange(filters);
    }, [searchName, position, sortValue, workdayStart, workdayEnd, minCompleted, maxCompleted, minOverdue, maxOverdue, dateFrom, dateTo, onFilterChange]);

    const handleResetFilters = useCallback(() => {
        setSearchName('');
        setPosition('');
        setSortValue(1);
        setWorkdayStart('');
        setWorkdayEnd('');
        setMinCompleted('');
        setMaxCompleted('');
        setMinOverdue('');
        setMaxOverdue('');
        setDateFrom('');
        setDateTo('');
        onFilterChange({});
    }, [onFilterChange]);

    return (
        <div className={styles.filterContainer}>
            <div className={styles.filterBar}>
                <div className={styles.filterRow}>
                    <div className={styles.searchField}>
                        <CommonInputField
                            label="Поиск по имени"
                            value={searchName}
                            onChange={setSearchName}
                            placeholder="Введите имя сотрудника..."
                        />
                    </div>

                    <div className={styles.filterField}>
                        <CommonInputField
                            label="Должность"
                            value={position}
                            onChange={setPosition}
                            placeholder="Введите должность..."
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
                    <div className={styles.workdayRangeField}>
                        <div className={styles.label}>Рабочие часы</div>
                        <div className={styles.timeInputs}>
                            <CommonInputField
                                label=""
                                value={workdayStart}
                                onChange={setWorkdayStart}
                                placeholder="Начало (HH:MM)"
                            />
                            <span className={styles.separator}>—</span>
                            <CommonInputField
                                label=""
                                value={workdayEnd}
                                onChange={setWorkdayEnd}
                                placeholder="Конец (HH:MM)"
                            />
                        </div>
                    </div>

                    <div className={styles.taskRangeField}>
                        <div className={styles.label}>Выполненные задачи</div>
                        <div className={styles.rangeInputs}>
                            <CommonInputField
                                label=""
                                value={minCompleted}
                                onChange={setMinCompleted}
                                placeholder="от"
                                type="number"
                                min={0}
                            />
                            <span className={styles.separator}>—</span>
                            <CommonInputField
                                label=""
                                value={maxCompleted}
                                onChange={setMaxCompleted}
                                placeholder="до"
                                type="number"
                                min={0}
                            />
                        </div>
                    </div>

                    <div className={styles.taskRangeField}>
                        <div className={styles.label}>Просроченные задачи</div>
                        <div className={styles.rangeInputs}>
                            <CommonInputField
                                label=""
                                value={minOverdue}
                                onChange={setMinOverdue}
                                placeholder="от"
                                type="number"
                                min={0}
                            />
                            <span className={styles.separator}>—</span>
                            <CommonInputField
                                label=""
                                value={maxOverdue}
                                onChange={setMaxOverdue}
                                placeholder="до"
                                type="number"
                                min={0}
                            />
                        </div>
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
                            />
                            <span className={styles.separator}>—</span>
                            <CommonInputField
                                label=""
                                value={dateTo}
                                onChange={setDateTo}
                                placeholder="по (ГГГГ-ММ-ДД)"
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