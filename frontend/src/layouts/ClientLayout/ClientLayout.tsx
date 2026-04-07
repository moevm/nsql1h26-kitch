import {Fragment} from "react";
import {Outlet} from "react-router-dom";
import {Header} from "../../components/Header/Header.tsx";
import {clientHeaderLinks} from "../../components/Header/navLinks";
import {HeaderLink} from "../../UI/HeaderLink/HeaderLink.tsx";
import style from "./ClientLayout.module.scss"
import {useAuth} from "../../hooks/useAuth.ts";

function ClientLayoutHeaderLinks() {
    const {logout} = useAuth();

    return (
        <Fragment>
            {clientHeaderLinks.map((link) => (
                <HeaderLink text={link.text} path={link.path} />
            ))}
            <HeaderLink text={"Выйти"} path={"/login"} onClick={logout}/>
        </Fragment>
    );
}

export function ClientLayout() {
    return (
        <div className={style.page}>
            <Header headerTitle={"Kitchify"}>
                <ClientLayoutHeaderLinks />
            </Header>
            <div className={style.layoutBody}>
                <Outlet />
            </div>
      </div>
    );
}