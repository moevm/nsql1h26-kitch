import {type ReactElement} from "react";
import styles from "./CommonInputField.module.scss"

interface CommonInputFieldProps {
    label: string;
    value?: string;
    placeholder?: string;
    type?: "text" | "password" | "email" | "number";
    onChange?: (value: string) => void;
    multiline?: boolean;
    rows?: number;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
    min?: number;
    max?: number;
}

export function CommonInputField({
     label,
     value = "",
     placeholder = "",
     type = "text",
     onChange,
     multiline = false,
     rows = 3,
     disabled = false,
     error = false,
     helperText = "",
     min = 0,
     max
}: CommonInputFieldProps): ReactElement {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLTextAreaElement>) => {

        let newValue = e.target.value;

        if (type === "number" && newValue !== "") {
            const numValue = Number(newValue);
            if (!isNaN(numValue)) {
                if (min !== undefined && numValue < min) newValue = min.toString();
                if (max !== undefined && numValue > max) newValue = max.toString();
            }
        }

        onChange?.(newValue);
    };

    return (
        <div className={styles.inputField}>
            <div className={styles.label}>{label}</div>
            <div className={`${styles.inputContainer} ${error ? styles.inputContainerError : ""}`}>
                {multiline ? (
                    <textarea
                        value={value}
                        placeholder={placeholder}
                        onChange={handleChange}
                        disabled={disabled}
                        className={`${styles.value} ${styles.textarea}`}
                        rows={rows}
                    />
                ) : (
                    <input
                        type={type}
                        value={value}
                        placeholder={placeholder}
                        onChange={handleChange}
                        disabled={disabled}
                        className={styles.value}
                        min={min}
                        max={max}
                    />
                )}
            </div>
            {helperText && (
                <div className={`${styles.helperText} ${error ? styles.helperTextError : ""}`}>
                    {helperText}
                </div>
            )}
        </div>
    );
}