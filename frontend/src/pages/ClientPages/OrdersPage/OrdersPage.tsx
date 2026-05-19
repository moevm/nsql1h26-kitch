import {type ReactElement, useCallback, useMemo, useState, Fragment} from "react";
import {Pagination} from "@mui/material";
import styles from "./OrdersPage.module.scss"

import {ClientOrderCard} from "../../../UI/CommonCards/ClientOrderCard/ClientOrderCard.tsx";
import type {Order} from "../../../types/order.ts";
import {useFilteredOrders} from "../../../hooks/useOrders.ts";
import type {FilterParams} from "../../../api/orders.ts";
import {OrdersFilter} from "../../../components/OrdersFilter/OrdersFilter.tsx";

const ITEMS_PER_PAGE = 3;

export function OrdersPage(): ReactElement {
    const [filters, setFilters] = useState<Partial<FilterParams>>({});
    const [page, setPage] = useState(1);

    const filtersWithPagination: FilterParams = useMemo(() => ({
        ...filters,
        start: (page - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
        sort_by: filters.sort_by || 'created_at',
        sort: filters.sort || 'DESC',
    }), [filters, page]);

    const {
        data: filteredResult,
        isLoading,
        error,
        refetch,
    } = useFilteredOrders(filtersWithPagination);

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
        refetch();
    }, [refetch]);

    if (isLoading) {
        return <div className={styles.loadingState}>Загружаем ваши заказы...</div>;
    }

    if (error) {
        return <div className={styles.errorState}>Ошибка загрузки</div>;
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
                                <ClientOrderCard key={order.id} order={order} />
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