import {Fragment, type ReactElement, useMemo, useState} from "react";
import {Pagination} from "@mui/material";
import styles from "./OrdersPage.module.scss"

import {ClientOrderCard} from "../../../UI/ClientOrderCard/ClientOrderCard.tsx";
import type {Order} from "../../../types/order.ts";
import {useOrders} from "../../../hooks/useOrders.ts";

const ITEMS_PER_PAGE = 3;

export function OrdersPage(): ReactElement {
    const { data: orders, isLoading, error } = useOrders();
    const [page, setPage] = useState(1);

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

    console.log(isLoading);
    console.log(error);

    if (orders) {
        return (
            <div className={styles.ordersPageContainer}>

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
            </div>
        );
    }
    else {
        if (isLoading) {
            return (<div>Загружаем ваши заказы...</div>);
        }

        if (error) {
            return (<div>Ошибка загрузки: {error.message}</div>);
        }

        return (<></>);
    }
}