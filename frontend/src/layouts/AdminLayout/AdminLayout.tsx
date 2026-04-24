import {useAuth} from "../../hooks/useAuth.ts";
import {Fragment} from "react";
import {adminHeaderLinks} from "../../components/Header/navLinks.ts";
import {HeaderLink} from "../../components/Header/HeaderLink/HeaderLink.tsx";
import style from "./AdminLayout.module.scss";
import {Header} from "../../components/Header/Header.tsx";
import {Outlet} from "react-router-dom";

function AdminLayoutHeaderLinks() {
    const {logout} = useAuth();

    // TODO: add export function
    // TODO: add import function

    return (
        <Fragment>
            {adminHeaderLinks.map((link) => (
                <HeaderLink text={link.text} path={link.path} />
            ))}
            <HeaderLink text={"Экспорт"} path={"/"} onClick={() => {}}/>
            <HeaderLink text={"Импорт"} path={"/"} onClick={() => {}}/>
            <HeaderLink text={"Выйти"} path={"/login"} onClick={logout}/>
        </Fragment>
    );
}

export function AdminLayout() {
    return (
        <div className={style.page}>
            <Header headerTitle={"Kitchify | ИС Администратор"}>
                <AdminLayoutHeaderLinks />
            </Header>
            <div className={style.layoutBody}>
                <Outlet />
            </div>
        </div>
    );
}