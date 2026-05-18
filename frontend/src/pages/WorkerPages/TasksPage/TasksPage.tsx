import {type ReactElement, useState, useMemo, useCallback, Fragment} from "react";
import { Pagination } from "@mui/material";
import styles from "./TasksPage.module.scss";
import { TaskCard } from "../../../UI/CommonCards/TaskCard/TaskCard.tsx";
import {useFilteredTasks, useTasksCount} from "../../../hooks/useTasks.ts";
import type { TaskFilterParams } from "../../../api/tasks.ts";
import {TasksFilter} from "../../../components/TasksFIlter/TasksFIlter.tsx";
import {useAuth} from "../../../hooks/useAuth.ts";

const ITEMS_PER_PAGE = 3;

export function TasksPage(): ReactElement {
    const {userId} = useAuth();
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<TaskFilterParams>({});

    const {
        data: totalTasksCount,
        isLoading: isCountLoading,
        error: countError,
        refetch: refetchCount,
    } = useTasksCount(userId ? userId : "");

    const totalPages = useMemo(() => {
        if (!totalTasksCount) return 0;
        return Math.ceil(totalTasksCount / ITEMS_PER_PAGE);
    }, [totalTasksCount]);

    const filtersWithPagination: TaskFilterParams = useMemo(() => ({
        ...filters,
        start: (page - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
        sort_by: filters.sort_by || 'created_at',
        sort: filters.sort || 'DESC',
    }), [filters, page]);

    const {
        data: tasks,
        isLoading: isTasksLoading,
        error: tasksError
    } = useFilteredTasks(filtersWithPagination);

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleFilterChange = useCallback((newFilters: Partial<TaskFilterParams>) => {
        setFilters(newFilters);
        setPage(1);
        refetchCount();
    }, [refetchCount]);

    if (isCountLoading || isTasksLoading) {
        return <div className={styles.loadingState}>Загружаем задачи...</div>;
    }

    if (countError || tasksError) {
        return <div className={styles.errorState}>Ошибка загрузки</div>;
    }

    return (
        <div className={styles.tasksPageContainer}>
            <TasksFilter onFilterChange={handleFilterChange} initialFilters={filters} />

            {!tasks || tasks.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>Нет доступных задач</p>
                </div>
            ) : (
                <>
                    {tasks.length > 0 && (
                        <div className={styles.tasksGrid}>
                            <div className={styles.statsInfo}>
                                Всего {totalTasksCount} задач
                            </div>
                            {tasks.map((task) => (
                                <Fragment>
                                    <TaskCard
                                        key={`${task.order_id}-${task.stage_index}`}
                                        task={task}
                                    />
                                </Fragment>
                            ))}
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
        </div>
    );
}