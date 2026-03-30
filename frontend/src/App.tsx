import {BrowserRouter, Route, Routes} from "react-router-dom";
import {LoginPage} from "./pages/LoginPage/LoginPage.tsx";

function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<div>Register</div>} />
                <Route path="/password_recover" element={<div>Password recover</div>} />
            </Routes>
        </BrowserRouter>
    )
}

export default App