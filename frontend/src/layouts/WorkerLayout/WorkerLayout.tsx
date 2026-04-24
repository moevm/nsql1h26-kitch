import {useAuth} from "../../hooks/useAuth.ts";
import {Fragment} from "react";
import {workerHeaderLinks} from "../../components/Header/navLinks.ts";
import {HeaderLink} from "../../components/Header/HeaderLink/HeaderLink.tsx";
import style from "./WorkerLayout.module.scss";
import {Header} from "../../components/Header/Header.tsx";
import {Outlet} from "react-router-dom";

function WorkerLayoutHeaderLinks() {
    const {logout} = useAuth();

    return (
        <Fragment>
            {workerHeaderLinks.map((link) => (
                <HeaderLink text={link.text} path={link.path} />
            ))}
            <HeaderLink text={"Выйти"} path={"/login"} onClick={logout}/>
        </Fragment>
    );
}

export function WorkerLayout() {
    return (
        <div className={style.page}>
            <Header headerTitle={"Kitchify | ИС Рабочий"}>
                <WorkerLayoutHeaderLinks />
            </Header>
            <div className={style.layoutBody}>
                <Outlet />
            </div>
        </div>
    );
}