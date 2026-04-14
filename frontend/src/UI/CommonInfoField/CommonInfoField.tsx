import type {ReactElement} from "react";
import styles from "./CommonInfoField.module.scss";

interface CommonInfoFieldProps {
    label: string;
    value: string | number;
}

export function CommonInfoField({
    label,
    value
}:CommonInfoFieldProps): ReactElement {
    return (
        <div className={styles.infoField}>
            <div className={styles.label}>{label}</div>
            <div className={styles.valueContainer}>
                <div className={styles.value}>{value}</div>
            </div>
        </div>
    );
}