import type {ReactElement} from "react";
import {useAuth} from "../../hooks/useAuth.ts";
import {Navigate} from "react-router-dom";

interface ProtectedRouteProps {
    children: ReactElement;
    allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps): ReactElement {
    const {isAuthenticated, userRole} = useAuth();

    if (!isAuthenticated) {
        return <Navigate to={"/login"} />
    }

    if (allowedRoles && !allowedRoles.includes(userRole || "")) {
        return <Navigate to={"/login"} />
    }

    return children;
}