import {type ReactElement, useState} from "react";
import { useNavigate } from "react-router-dom";
import {Alert, Container} from "@mui/material";
import { AxiosError } from 'axios';
import styles from "./LoginPage.module.scss"
import {CommonButton} from "../../UI/CommonButton/CommonButton.tsx";
import {CommonInputField} from "../../UI/CommonInputField/CommonInputField.tsx";
import {CommonClickableText} from "../../UI/CommonClickableText/CommonClickableText.tsx";
import {useAuth} from "../../hooks/useAuth.ts";

export function LoginPage(): ReactElement {
    const navigate = useNavigate();
    const {login, error, isLoading} = useAuth();
    const [formData, setFormData] = useState({ email: "", password: "" });

    const handleInputChange = (field: keyof typeof formData) => (value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = () => {
        login(formData);
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
                />

                <CommonInputField
                    label={"Пароль"}
                    placeholder={"Введите пароль"}
                    type={"password"}
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    disabled={isLoading}
                />

                <CommonButton
                    title={isLoading ? "Вход..." : "Войти"}
                    variant={"primary"}
                    onClick={handleSubmit}
                    disabled={isLoading}
                />

                <CommonClickableText
                    title={"Восставновить пароль"}
                    onClick={() => navigate("/password_recover")}
                />

                <CommonClickableText
                    title={"Регистрация"}
                    onClick={() => navigate("/register")}
                />

            </Container>
        </div>
    );
}