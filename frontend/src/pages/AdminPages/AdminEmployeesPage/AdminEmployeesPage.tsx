import { type ReactElement, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilteredWorkers } from '../../../hooks/useWorkers.ts';
import { CommonButton } from '../../../UI/CommonButton/CommonButton.tsx';
import { AddEmployeeModal } from './AddEmployeeModal.tsx';
import { WorkerCard } from '../../../UI/WorkerCard/WorkerCard.tsx';
import { WorkersFilter } from '../../../components/WorkersFilter/WorkersFilter.tsx';
import type { WorkerFilterParams } from '../../../api/workers.ts';
import styles from './AdminEmployeesPage.module.scss';
import type {WorkerPublic} from "../../../types/worker.ts";

export function AdminEmployeesPage(): ReactElement {
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);
    const [filters, setFilters] = useState<WorkerFilterParams>({});

    const { data: workers, isLoading, error, refetch } = useFilteredWorkers(filters);

    const handleFilterChange = useCallback((newFilters: Partial<WorkerFilterParams>) => {
        setFilters(newFilters);
    }, []);

    const handleModalClose = () => {
        setModalOpen(false);
        refetch();
    };

    const handleProfileClick = (worker: WorkerPublic) => {
        navigate(`/admin/employees/${worker.id}`);
    };

    if (isLoading) {
        return <div className={styles.loadingState}>Загрузка сотрудников...</div>;
    }

    if (error) {
        return <div className={styles.errorState}>Ошибка загрузки списка сотрудников</div>;
    }

    return (
        <div className={styles.container}>
            <WorkersFilter
                onFilterChange={handleFilterChange}
                initialFilters={filters}
            />

            <div className={styles.addButtonWrapper}>
                <CommonButton
                    title="Добавить сотрудника"
                    onClick={() => setModalOpen(true)}
                    className={styles.addButton}
                />
            </div>

            {workers && workers.length === 0 ? (
                <div className={styles.empty}>
                    {Object.keys(filters).length > 0
                        ? 'Нет сотрудников, соответствующих фильтрам'
                        : 'Нет сотрудников. Добавьте первого.'}
                </div>
            ) : (
                <div className={styles.cardsContainer}>
                    {workers?.map((worker) => (
                        <WorkerCard
                            key={worker.id}
                            worker={worker}
                            onProfileClick={handleProfileClick}
                        />
                    ))}
                </div>
            )}

            <AddEmployeeModal open={modalOpen} onClose={handleModalClose} />
        </div>
    );
}