import type {ReactElement} from "react";
import styles from "./CommonSelectField.module.scss"

export interface Option {
    value: number
    label: string
}

interface CommonSelectFieldProps {
    label: string;
    value: number | null | undefined;
    options: Option[];
    onChange: (value: number) => void;
    disabled?: boolean;
}

export function CommonSelectField({
    label,
    value,
    options,
    onChange,
    disabled = false
}: CommonSelectFieldProps): ReactElement {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const stringValue = e.target.value;
        if (stringValue === "") return;

        const numberValue = Number(stringValue);
        if (!isNaN(numberValue)) {
            onChange(numberValue);
        }
    };

    return (
        <div className={styles.selectField}>
            <div className={styles.label}>{label}</div>
            <div className={styles.selectWrapper}>
                <select
                    className={styles.listSelect}
                    value={value !== undefined && value !== null ? value : ""}
                    onChange={handleChange}
                    disabled={disabled}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}