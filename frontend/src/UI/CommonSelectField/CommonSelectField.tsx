import type {ReactElement} from "react";
import styles from "./CommonSelectField.module.scss"

interface Option {
    value: string
    label: string
}

interface CommonSelectFieldProps {
    label: string;
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function CommonSelectField({
    label,
    value = "",
    options,
    onChange,
    disabled = false
}: CommonSelectFieldProps): ReactElement {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange?.(e.target.value);
    };

    return (
        <div className={styles.selectField}>
            <div className={styles.label}>{label}</div>
            <div className={styles.selectWrapper}>
                <select
                    className={styles.listSelect}
                    value={value}
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