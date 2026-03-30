import {type ReactElement, useState} from "react";
import { useNavigate } from "react-router-dom";
import {Container} from "@mui/material";
import styles from "./LoginPage.module.scss"
import {CommonButton} from "../../UI/CommonButton/CommonButton.tsx";
import {CommonInputField} from "../../UI/CommonInputField/CommonInputField.tsx";
import {CommonClickableText} from "../../UI/CommonClickableText/CommonClickableText.tsx";

export function LoginPage(): ReactElement {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });

    const handleInputChange = (field: keyof typeof formData) => (value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = () => {
        console.log("Form data:", formData);
    };

    return (
        <div>
            <Container className={styles.form}>
                <div className={styles.legend}>
                    <div className={styles.legendText}>Вход</div>
                </div>
                <CommonInputField
                    label={"Email"}
                    placeholder={"Введите email"}
                    type={"email"}
                    value={formData.email}
                    onChange={handleInputChange("email")}
                />
                <CommonInputField
                    label={"Пароль"}
                    placeholder={"Введите пароль"}
                    type={"password"}
                    value={formData.password}
                    onChange={handleInputChange("password")}
                />
                <CommonButton
                    title={"Войти"}
                    variant={"primary"}
                    onClick={handleSubmit}
                />
                <CommonClickableText
                    title={"Восставновить пароль"}
                    onClick={
                        () => {
                            navigate("/password_recover")
                        }
                    }
                />
                <CommonClickableText
                    title={"Регистрация"}
                    onClick={
                        () => {
                            navigate("/register")
                        }
                    }
                />
            </Container>
        </div>
    );
}