import type {HeaderLinkProps} from "../../UI/HeaderLink/HeaderLink.tsx";

export const clientHeaderLinks: HeaderLinkProps[] = [
    { text: "Продукция", path: "/products" },
    { text: "Создать заказ", path: "/orders/create" },
    { text: "Заказы", path: "/orders" }
];