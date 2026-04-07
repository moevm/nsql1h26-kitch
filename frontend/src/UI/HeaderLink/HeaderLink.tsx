import type {ReactElement} from "react";
import style from "./HeaderLink.module.scss"
import {useLocation} from "react-router-dom";

interface HeaderLinkProps {
    text: string;
    path: string;
}

export function HeaderLink({text, path="/"}: HeaderLinkProps): ReactElement {
    const location = useLocation();
    const isActive = location.pathname === path;

    const handleClick = () => {
        window.location.href = path;
    }

    return (
        <div className={isActive ? style.linkActive : style.link} onClick={handleClick}>
            {text}
        </div>
    );
}