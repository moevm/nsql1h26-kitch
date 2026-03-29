import type {ReactElement} from "react";
import styles from "./CommonClickableText.module.scss"

interface CommonClickableTextProps {
    title: string;
    onClick?: () => void;
}

export function CommonClickableText({
    title: title,
    onClick: onClick
}: CommonClickableTextProps): ReactElement {

    return (
        <div className={styles.clickableText} onClick={onClick}>
            <span className={styles.innerClickableText}>{title}</span>
        </div>
    );
}