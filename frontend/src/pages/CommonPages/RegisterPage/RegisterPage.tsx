import {type ReactElement, useState} from "react";
import {Alert, Container} from "@mui/material";
import styles from "../LoginPage/LoginPage.module.scss";
import {CommonInputField} from "../../../UI/CommonInputField/CommonInputField.tsx";
import {CommonButton} from "../../../UI/CommonButton/CommonButton.tsx";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../../hooks/useAuth.ts";
import {AxiosError} from "axios";

interface RegisterFormData {
    username: string;
    password: string;
    email: string;
    phone?: string;
}

export function RegisterPage(): ReactElement {
    const navigate = useNavigate();
    const {register, error, isLoading} = useAuth();
    const [formData, setFormData] = useState<RegisterFormData>({
        username: "", email: "", password: "", phone: ""
    });
    const [validationErrors, setValidationErrors] = useState<Partial<RegisterFormData>>({});

    const validateForm = (): boolean => {
        const errors: Partial<RegisterFormData> = {};

        if (!formData.username.trim())          errors.username = "Имя пользователя обязательно";
        else if (formData.username.length < 2)  errors.username = "Имя пользователя должно содержать минимум 2 символа";

        if (!formData.email.trim())                     errors.email = "Email обязателен";
        else if (!/\S+@\S+\.\S+/.test(formData.email))  errors.email = "Введите корректный email";

        if (!formData.password)                 errors.password = "Пароль обязателен";
        else if (formData.password.length < 8)  errors.password = "Пароль должен содержать минимум 8 символов";

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (field: keyof RegisterFormData) => (value: string) => {
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
            const registerData = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                ...(formData.phone && { phone: formData.phone })
            };
            register(registerData);
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
        return "Ошибка при регистрации. Попробуйте позже";
    };

    return (
        <div>
            <Container className={styles.form}>
                <div className={styles.legend}>
                    <div className={styles.legendText}>Регистрация</div>
                </div>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {getErrorMessage()}
                    </Alert>
                )}

                <CommonInputField
                    label={"Имя пользователя *"}
                    placeholder={"Введите свое имя"}
                    type={"text"}
                    value={formData.username}
                    onChange={handleInputChange("username")}
                    disabled={isLoading}
                    error={!!validationErrors.username}
                    helperText={validationErrors.username}
                />

                <CommonInputField
                    label={"Номер телефона"}
                    placeholder={"Введите номер телефона"}
                    type={"text"}
                    value={formData.phone}
                    onChange={handleInputChange("phone")}
                    disabled={isLoading}
                    error={!!validationErrors.phone}
                    helperText={validationErrors.phone}
                />

                <CommonInputField
                    label={"Email *"}
                    placeholder={"Введите email"}
                    type={"email"}
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    disabled={isLoading}
                    error={!!validationErrors.email}
                    helperText={validationErrors.email}
                />

                <CommonInputField
                    label={"Пароль *"}
                    placeholder={"Введите пароль"}
                    type={"password"}
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    disabled={isLoading}
                    error={!!validationErrors.password}
                    helperText={validationErrors.password}
                />

                <CommonButton
                    title={isLoading ? "Регистрация..." : "Зарегистрироваться"}
                    variant={"primary"}
                    onClick={handleSubmit}
                    disabled={isLoading}
                />

                <CommonButton
                    title={"Войти"}
                    variant={"text"}
                    onClick={() => navigate("/login")}
                    disabled={isLoading}
                />

            </Container>
        </div>
    );
}