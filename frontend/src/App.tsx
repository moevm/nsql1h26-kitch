import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {LoginPage} from "./pages/LoginPage/LoginPage.tsx";
import {RegisterPage} from "./pages/RegisterPage/RegisterPage.tsx";
import {ClientLayout} from "./layouts/ClientLayout/ClientLayout.tsx";
import {ProtectedRoute} from "./components/ProtectedRoute/ProtectedRoute.tsx";


function AppRoutes() {
    return (
        <Routes>
            <Route path="/"         element={<Navigate to="/login" replace />} />
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/logout"   element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/password_recover" element={<div>PASSWORD RECOVER</div>} />

            <Route element={
                <ProtectedRoute allowedRoles={['client']}>
                    <ClientLayout />
                </ProtectedRoute>
            }>
                <Route path="/products"         element={<div>PRODUCTS</div>}/>
                <Route path="/orders/create"    element={<div>CREATE ORDER</div>}/>
                <Route path="/orders"           element={<div>ORDERS</div>}/>
            </Route>
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    )
}

export default App