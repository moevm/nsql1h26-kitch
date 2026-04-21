import {type ReactElement, useCallback, useMemo, useState, Fragment} from "react";
import {Pagination} from "@mui/material";
import styles from "./OrdersPage.module.scss"

import {ClientOrderCard} from "../../../UI/ClientOrderCard/ClientOrderCard.tsx";
import type {Order} from "../../../types/order.ts";
import {useFilteredOrders} from "../../../hooks/useOrders.ts";
import type {FilterParams} from "../../../api/orders.ts";
import {OrdersFilter} from "../../../components/OrdersFilter/OrdersFilter.tsx";

const ITEMS_PER_PAGE = 3;

export function OrdersPage(): ReactElement {
    const [filters, setFilters] = useState<Partial<FilterParams>>({});
    const [page, setPage] = useState(1);

    const { data: orders, isLoading, error } = useFilteredOrders(filters as FilterParams);

    const paginatedOrders = useMemo(() => {
        if (!orders) return [];

        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return orders.slice(start, end);
    }, [orders, page])

    const totalPages = useMemo(() => {
        if (!orders) return 0;
        return Math.ceil(orders.length / ITEMS_PER_PAGE);
    }, [orders]);

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleFilterChange = useCallback((newFilters: Partial<FilterParams>) => {
        setFilters(newFilters);
        setPage(1);
    }, []);

    if (isLoading) {
        return <div className={styles.loadingState}>Загружаем ваши заказы...</div>;
    }

    if (error) {
        console.log(error);
        return <div className={styles.errorState}>Ошибка загрузки: {error.message}</div>;
    }

    return (
        <div className={styles.ordersPageContainer}>
            <OrdersFilter onFilterChange={handleFilterChange} />

            {orders && orders.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>Заказы не найдены</p>
                </div>
            ) : (
                <>
                    <div className={styles.ordersGrid}>
                        <Fragment>
                            {paginatedOrders.map((order: Order) => (
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