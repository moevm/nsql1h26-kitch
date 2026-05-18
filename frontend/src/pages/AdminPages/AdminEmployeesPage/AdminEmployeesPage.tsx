import { type ReactElement, useState, useCallback, useMemo, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '@mui/material';
import {useFilteredWorkers, useWorkersCount} from '../../../hooks/useWorkers.ts';
import { CommonButton } from '../../../UI/CommonButton/CommonButton.tsx';
import { AddEmployeeModal } from './AddEmployeeModal.tsx';
import { WorkerCard } from '../../../UI/CommonCards/WorkerCard/WorkerCard.tsx';
import { WorkersFilter } from '../../../components/WorkersFilter/WorkersFilter.tsx';
import type { WorkerFilterParams } from '../../../api/workers.ts';
import styles from './AdminEmployeesPage.module.scss';
import type { WorkerPublic } from "../../../types/worker.ts";

const ITEMS_PER_PAGE = 2;

export function AdminEmployeesPage(): ReactElement {
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);
    const [filters, setFilters] = useState<WorkerFilterParams>({});
    const [page, setPage] = useState(1);

    const {
        data: totalWorkersCount,
        isLoading: isCountLoading,
        error: countError,
        refetch: refetchCount,
    } = useWorkersCount(false);

    const totalPages = useMemo(() => {
        if (!totalWorkersCount) return 0;
        return Math.ceil(totalWorkersCount / ITEMS_PER_PAGE);
    }, [totalWorkersCount]);

    const filtersWithPagination: WorkerFilterParams = useMemo(() => ({
        ...filters,
        start: (page - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
        sort_by: filters.sort_by || 'created_at',
        sort: filters.sort || 'DESC',
    }), [filters, page]);

    const {
        data: workers,
        isLoading: isWorkersLoading,
        error: workersError,
        refetch: refetchWorkers,
    } = useFilteredWorkers(filtersWithPagination);

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFilterChange = useCallback((newFilters: Partial<WorkerFilterParams>) => {
        setFilters(newFilters);
        setPage(1);
        refetchCount();
    }, [refetchCount]);

    const handleModalClose = () => {
        setModalOpen(false);
        refetchCount();
        refetchWorkers();
    };

    const handleProfileClick = (worker: WorkerPublic) => {
        navigate(`/admin/employees/${worker.id}`);
    };

    if (isCountLoading || isWorkersLoading) {
        return <div className={styles.loadingState}>Загрузка сотрудников...</div>;
    }

    if (countError || workersError) {
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
                <>
                    <></>
                    {workers && workers.length > 0 && (
                        <div className={styles.cardsContainer}>
                            <div className={styles.statsInfo}>
                                Всего {totalWorkersCount} работников
                            </div>
                            <Fragment>
                                {workers.map((worker) => (
                                    <WorkerCard
                                        key={worker.id}
                                        worker={worker}
                                        onProfileClick={handleProfileClick}
                                    />
                                ))}
                            </Fragment>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className={styles.paginationContainer}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                                shape="rounded"
                                showFirstButton
                                showLastButton
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        fontFamily: 'Inter, sans-serif',
                                    },
                                    '& .Mui-selected': {
                                        backgroundColor: '#1E1E1E !important',
                                        color: '#FFFFFF',
                                    },
                                }}
                            />
                        </div>
                    )}
                </>
            )}

            <AddEmployeeModal open={modalOpen} onClose={handleModalClose} />
        </div>
    );
}