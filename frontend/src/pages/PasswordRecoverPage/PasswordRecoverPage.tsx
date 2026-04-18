import {useState, type ReactElement} from "react";
import styles from "./PasswordRecoverPage.module.scss"
import {CommonInputField} from "../../UI/CommonInputField/CommonInputField.tsx";
import {CommonButton} from "../../UI/CommonButton/CommonButton.tsx";
import {useNavigate} from "react-router-dom";
import {Container} from "@mui/material";

export function PasswordRecoverPage(): ReactElement {
    const navigate = useNavigate();
    const [isCodeSent, setIsCodeSent] = useState(false);

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    const [code, setCode] = useState("");
    const [codeError, setCodeError] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const validateEmail = () => {
        if (!email.trim()) {
            setEmailError("Email обязателен");
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError("Введите корректный email");
            return false;
        }
        setEmailError("");
        return true;
    };

    const validateCode = () => {
        if (!code.trim()) {
            setCodeError("Код обязателен");
            return false;
        }
        if (code.length !== 6) {
            setCodeError("Код должен содержать 6 символов");
            return false;
        }
        setCodeError("");
        return true;
    };

    const validatePassword = () => {
        if (!password.trim()) {
            setPasswordError("Пароль обязателен");
            return false;
        }
        if (password.length < 6) {
            setPasswordError("Пароль должен содержать минимум 6 символов");
            return false;
        }
        setPasswordError("");
        return true;
    };

    const handleEmailChange = (value: string) => {
        setEmail(value);
        setEmailError("");
    };

    const handleCodeChange = (value: string) => {
        setCode(value);
        setCodeError("");
    };

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        setPasswordError("");
    };

    const handleSendEmail = () => {
        if (validateEmail()) {
            // TODO: code sending logic
            setIsCodeSent(true);
            console.log("SEND CODE to", email);
        }
    };

    const handleResetPassword = () => {
        const isCodeValid = validateCode();
        const isPasswordValid = validatePassword();

        if (isCodeValid && isPasswordValid) {
            // TODO: password resetting logic
            console.log("RESET PASSWORD for", email);
            navigate("/login");
        }
    };

    return (
        <div>
            <Container className={styles.form}>
                <div className={styles.legend}>
                    <div className={styles.legendText}>Восстановление пароля</div>
                </div>

                {!isCodeSent ? (
                        <>
                            <CommonInputField
                                label={"Email"}
                                placeholder={"Введите email"}
                                type={"email"}
                                value={email}
                                onChange={handleEmailChange}
                                error={!!emailError}
                                helperText={emailError}
                            />

                            <CommonButton
                                title={"Отправить код"}
                                variant={"primary"}
                                onClick={handleSendEmail}
                            />
                        </>
                    ) : (
                        <>
                            <CommonInputField
                                label={"Код подтверждения"}
                                placeholder={"Введите код подтверждения"}
                                type={"text"}
                                value={code}
                                onChange={handleCodeChange}
                                error={!!codeError}
                                helperText={codeError}
                            />

                            <CommonInputField
                                label={"Новый пароль"}
                                placeholder={"Введите новый пароль"}
                                type={"text"}
                                value={password}
                                onChange={handlePasswordChange}
                                error={!!passwordError}
                                helperText={passwordError}
                            />

                            <CommonButton
                                title={"Изменить пароль"}
                                variant={"primary"}
                                onClick={handleResetPassword}
                            />
                        </>
                    )
                }

                <CommonButton
                    title={"Войти"}
                    variant={"text"}
                    onClick={() => navigate("/login")}
                />

            </Container>
        </div>
    );
}