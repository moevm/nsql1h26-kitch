import {type ReactElement} from "react";
import style from "./Header.module.scss"
import logo from "../../assets/kitchify_logo.svg";
import {Avatar} from "@mui/material";

interface HeaderProps {
    headerTitle: string;
    children?: ReactElement;
}

export function Header({headerTitle, children}: HeaderProps): ReactElement {
    return (
        <div className={style.headerContainer}>
            <div className={style.logoWrapper}>
                <Avatar alt={headerTitle} src={logo} className={style.headerLogo} />
                <div className={style.headerTitle}>
                    {headerTitle}
                </div>
            </div>

            <div className={style.navContainer}>
                {children}
            </div>
        </div>
    );
}