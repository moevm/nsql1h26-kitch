import type {ReactElement} from "react";
import styles from "./CommonButton.module.scss"

interface CommonButtonProps {
    title: string;
    onClick?: () => void;
    disabled?: boolean;
    variant?: "primary" | "danger";
    className?: string;
}

export function CommonButton({
    title,
    onClick,
    disabled,
    variant = "primary",
    className
}: CommonButtonProps): ReactElement {

    const buttonClass = `${styles.button} ${
        variant === "danger" ? styles.danger : ""
    } ${className || ""}`;

    return (
        <button className={buttonClass} onClick={onClick} disabled={disabled}>
            <span className={styles.buttonText}>{title}</span>
        </button>
    );
}