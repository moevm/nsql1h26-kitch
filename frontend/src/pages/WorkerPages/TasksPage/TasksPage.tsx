import { type ReactElement, useState, useMemo } from "react";
import { Pagination } from "@mui/material";
import styles from "./TasksPage.module.scss";
import { TaskCard } from "../../../UI/CommonCards/TaskCard/TaskCard.tsx";
import { useTasks } from "../../../hooks/useTasks.ts";

const ITEMS_PER_PAGE = 3;

export function TasksPage(): ReactElement {
    const [page, setPage] = useState(1);
    const { data: tasks, isLoading, error } = useTasks();

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
    };

    if (isLoading) {
        return <div className={styles.loadingState}>Загружаем ваши заказы...</div>;
    }

    if (error) {
        return <div className={styles.errorState}>Ошибка загрузки: {error.message}</div>;
    }

    return (
        <div className={styles.tasksPageContainer}>

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