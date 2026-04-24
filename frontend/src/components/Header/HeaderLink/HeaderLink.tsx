import type {ReactElement} from "react";
import style from "./HeaderLink.module.scss"
import {useLocation} from "react-router-dom";

export interface HeaderLinkProps {
    text: string;
    path: string;
    onClick?: () => void;
}

export function HeaderLink({text, path="/", onClick}: HeaderLinkProps): ReactElement {
    const location = useLocation();
    const isActive = location.pathname === path;

    const handleClick = () => {
        if (onClick) {
            onClick();
        }
        else {
            window.location.href = path;
        }
    }

    return (
        <div className={isActive ? style.linkActive : style.link} onClick={handleClick}>
            {text}
        </div>
    );
}