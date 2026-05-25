import {Fragment, type ReactElement, useCallback, useMemo, useState} from "react";
import type {FilterParams} from "../../../api/orders.ts";
import {useFilteredOrders} from "../../../hooks/useOrders.ts";
import type {Order} from "../../../types/order.ts";
import styles from "./AdminOrdersPage.module.scss"
import {ClientOrderCard} from "../../../UI/CommonCards/ClientOrderCard/ClientOrderCard.tsx";
import {AdminOrderCard} from "../../../UI/CommonCards/AdminOrderCard/AdminOrderCard.tsx";
import {Pagination} from "@mui/material";
import {OrdersFilter} from "../../../components/OrdersFilter/OrdersFilter.tsx";

const ITEMS_PER_PAGE = 3;

export function AdminOrdersPage(): ReactElement {
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<Partial<FilterParams>>({});

    const filtersWithPagination: FilterParams = useMemo(() => ({
        ...filters,
        start: (page - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
        sort_by: filters.sort_by || 'created_at',
        sort: filters.sort || 'DESC',
    }), [filters, page]);

    const {data: filteredResult, isLoading, error, refetch} = useFilteredOrders(filtersWithPagination);

    const orders = filteredResult?.items || [];
    const totalOrdersCount = filteredResult?.total || 0;

    const totalPages = useMemo(() => {
        if (!totalOrdersCount) return 0;
        return Math.ceil(totalOrdersCount / ITEMS_PER_PAGE);
    }, [totalOrdersCount]);

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFilterChange = useCallback((newFilters: Partial<FilterParams>) => {
        setFilters(newFilters);
        setPage(1);
    }, []);

    const isOrderActive = (order: Order): boolean => {
        if (!order.stages || order.stages.length === 0) return true;

        const lastStage = order.stages[order.stages.length - 1];
        const status = lastStage?.name_stage;
        const taskStatus = lastStage?.task_status;

        return status !== "Отменён"
            && status !== "Завершён"
            && taskStatus !== "Отменена"
            && taskStatus !== "Выполнена";
    };

    if (isLoading) {
        return <div className={styles.loadingState}>Загружаем заказы...</div>;
    }

    if (error) {
        return <div className={styles.errorState}>Ошибка загрузки заказов</div>;
    }

    return (
        <div className={styles.ordersPageContainer}>
            <OrdersFilter onFilterChange={handleFilterChange} initialFilters={filters} />

            {orders.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>Заказы не найдены</p>
                </div>
            ) : (
                <>
                    <div className={styles.ordersGrid}>
                        <div className={styles.statsInfo}>
                            Всего {totalOrdersCount} заказов
                        </div>
                        <Fragment>
                            {orders.map((order: Order) => (
                                isOrderActive(order) ? (
                                    <AdminOrderCard
                                        key={order.id}
                                        order={order}
                                        onWorkerChanged={refetch}
                                    />
                                ) : (
                                    <ClientOrderCard key={order.id} order={order} />
                                )
                            ))}
                        </Fragment>
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