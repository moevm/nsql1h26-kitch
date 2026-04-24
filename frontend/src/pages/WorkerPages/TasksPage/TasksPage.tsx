import {type ReactElement, useState, useMemo, useCallback} from "react";
import { Pagination } from "@mui/material";
import styles from "./TasksPage.module.scss";
import { TaskCard } from "../../../UI/CommonCards/TaskCard/TaskCard.tsx";
import {useFilteredTasks} from "../../../hooks/useTasks.ts";
import type { TaskFilterParams } from "../../../api/tasks.ts";
import {TasksFilter} from "../../../components/TasksFIlter/TasksFIlter.tsx";

const ITEMS_PER_PAGE = 3;

export function TasksPage(): ReactElement {
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<TaskFilterParams>({});

    const { data: tasks, isLoading, error } = useFilteredTasks(filters);

    const paginatedTasks = useMemo(() => {
        if (!tasks) return [];
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return tasks.slice(start, end);
    }, [tasks, page]);

    const totalPages = useMemo(() => {
        if (!tasks) return 0;
        return Math.ceil(tasks.length / ITEMS_PER_PAGE);
    }, [tasks]);

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleFilterChange = useCallback((newFilters: Partial<TaskFilterParams>) => {
        setFilters(newFilters);
        setPage(1);
    }, []);


    if (isLoading) {
        return <div className={styles.loadingState}>Загружаем ваши заказы...</div>;
    }

    if (error) {
        return <div className={styles.errorState}>Ошибка загрузки: {error.message}</div>;
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
                    <div className={styles.tasksGrid}>
                        {paginatedTasks.map((task) => (
                            <TaskCard
                                key={`${task.order_id}-${task.stage_index}`}
                                task={task}
                            />
                        ))}
                    </div>

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