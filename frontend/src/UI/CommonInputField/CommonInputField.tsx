import {type ReactElement} from "react";
import styles from "./CommonInputField.module.scss"

interface CommonInputFieldProps {
    label: string;
    value?: string;
    placeholder?: string;
    type?: "text" | "password" | "email";
    onChange?: (value: string) => void;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
}

export function CommonInputField({
     label,
     value = "",
     placeholder = "",
     type = "text",
     onChange,
     disabled = false,
     error = false,
     helperText = ""
}: CommonInputFieldProps): ReactElement {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
    };

    return (
        <div className={styles.inputField}>
            <div className={styles.label}>{label}</div>
            <div className={`${styles.inputContainer} ${error ? styles.inputContainerError : ""}`}>
                <input
                    type={type}
                    value={value}
                    placeholder={placeholder}
                    onChange={handleChange}
                    disabled={disabled}
                    className={styles.value}
                />
            </div>
            {helperText && (
                <div className={`${styles.helperText} ${error ? styles.helperTextError : ""}`}>
                    {helperText}
                </div>
            )}
        </div>
    );
}