import type {ReactElement} from "react";
import styles from "./CommonButton.module.scss"

interface CommonButtonProps {
    title: string;
    onClick?: () => void;
    variant?: "primary" | "danger";
    className?: string;
}

export function CommonButton({
    title,
    onClick,
    variant = "primary",
    className
}: CommonButtonProps): ReactElement {

    const buttonClass = `${styles.button} ${
        variant === "danger" ? styles.danger : ""
    } ${className || ""}`;

    return (
        <button className={buttonClass} onClick={onClick}>
            <span className={styles.buttonText}>{title}</span>
        </button>
    );
}