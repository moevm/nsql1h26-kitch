import type {HeaderLinkProps} from "../../UI/HeaderLink/HeaderLink.tsx";

export const clientHeaderLinks: HeaderLinkProps[] = [
    { text: "Продукция", path: "/products" },
    { text: "Создать заказ", path: "/orders/create" },
    { text: "Заказы", path: "/orders" }
];

export const workerHeaderLinks: HeaderLinkProps[] = [
    { text: "Задачи на сегодня", path: "/worker/tasks" },
    { text: "Просроченные задачи", path: "/worker/tasks/overdue" },
    { text: "Завершенные задачи", path: "/worker/tasks/completed" }
];

export const adminHeaderLinks: HeaderLinkProps[] = [
    { text: "Заказы", path: "/admin/orders" },
    { text: "Финансы", path: "/admin/finances" },
    { text: "Сотрудники", path: "/admin/employees" }
];