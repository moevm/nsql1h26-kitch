import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {LoginPage} from "./pages/LoginPage/LoginPage.tsx";
import {RegisterPage} from "./pages/RegisterPage/RegisterPage.tsx";
import {ProtectedRoute} from "./components/ProtectedRoute/ProtectedRoute.tsx";

import {ClientLayout} from "./layouts/ClientLayout/ClientLayout.tsx";

import {AdminLayout} from "./layouts/AdminLayout/AdminLayout.tsx";


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

            <Route element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                </ProtectedRoute>
            }>
                <Route path="admin/orders"         element={<div>ADMIN ORDERS</div>}/>
                <Route path="/admin/finances"    element={<div>ADMIN FINANCES</div>}/>
                <Route path="admin/employees"           element={<div>ADMIN EMPLOYEES</div>}/>
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