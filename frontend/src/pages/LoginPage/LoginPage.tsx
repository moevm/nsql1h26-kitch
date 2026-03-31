import {type ReactElement, useState} from "react";
import { useNavigate } from "react-router-dom";
import {Alert, Container} from "@mui/material";
import { AxiosError } from 'axios';
import styles from "./LoginPage.module.scss"
import {CommonButton} from "../../UI/CommonButton/CommonButton.tsx";
import {CommonInputField} from "../../UI/CommonInputField/CommonInputField.tsx";
import {useAuth} from "../../hooks/useAuth.ts";

interface LoginFormData {
    email: string;
    password: string;
}

export function LoginPage(): ReactElement {
    const navigate = useNavigate();
    const {login, error, isLoading} = useAuth();
    const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" });
    const [validationErrors, setValidationErrors] = useState<Partial<LoginFormData>>({});

    const validateForm = (): boolean => {
        const errors: Partial<LoginFormData> = {};

        if (!formData.email.trim())                     errors.email = "Email обязателен";
        else if (!/\S+@\S+\.\S+/.test(formData.email))  errors.email = "Введите корректный email";

        if (!formData.password) errors.password = "Пароль обязателен";

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (field: keyof LoginFormData) => (value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (validationErrors[field]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const handleSubmit = () => {
        if (validateForm()) {
            login({
                email: formData.email.trim().toLowerCase(),
                password: formData.password
            });
        }
    };

    const getErrorMessage = () => {
        if (!error) return null;

        if (error instanceof AxiosError) {
            if (error.response?.data?.detail)   return error.response.data.detail;
            if (error.response?.data?.message)  return error.response.data.message;
            if (error.response?.data?.error)    return error.response.data.error;
            if (error.message)                  return error.message;
        }

        if (error.message) return error.message;
        return "Ошибка при входе. Проверьте ваш email и пароль";
    };

    return (
        <div>
            <Container className={styles.form}>
                <div className={styles.legend}>
                    <div className={styles.legendText}>Вход</div>
                </div>

                { error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {getErrorMessage()}
                    </Alert>
                )}

                <CommonInputField
                    label={"Email"}
                    placeholder={"Введите email"}
                    type={"email"}
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    disabled={isLoading}
                    error={!!validationErrors.email}
                    helperText={validationErrors.email}
                />

                <CommonInputField
                    label={"Пароль"}
                    placeholder={"Введите пароль"}
                    type={"password"}
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    disabled={isLoading}
                    error={!!validationErrors.password}
                    helperText={validationErrors.password}
                />

                <CommonButton
                    title={isLoading ? "Вход..." : "Войти"}
                    variant={"primary"}
                    onClick={handleSubmit}
                    disabled={isLoading}
                />

                <CommonButton
                    title={"Восставновить пароль"}
                    variant={"text"}
                    onClick={() => navigate("/password_recover")}
                    disabled={isLoading}
                />

                <CommonButton
                    title={"Регистрация"}
                    variant={"text"}
                    onClick={() => navigate("/register")}
                    disabled={isLoading}
                />

            </Container>
        </div>
    );
}