import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {LoginPage} from "./pages/LoginPage/LoginPage.tsx";
import {RegisterPage} from "./pages/RegisterPage/RegisterPage.tsx";

function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/password_recover" element={<div>Password recover</div>} />
            </Routes>
        </BrowserRouter>
    )
}

export default App