import type {HeaderLinkProps} from "../../UI/HeaderLink/HeaderLink.tsx";

export const clientHeaderLinks: HeaderLinkProps[] = [
    { text: "Продукция", path: "/products" },
    { text: "Создать заказ", path: "/orders/create" },
    { text: "Заказы", path: "/orders" }
];

export const adminHeaderLinks: HeaderLinkProps[] = [
    { text: "Заказы", path: "admin/orders" },
    { text: "Финансы", path: "admin/finances" },
    { text: "Сотрудники", path: "admin/employees" }
];