import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';
import type { UserCreate, UserAuth } from '../types/user';
import {useEffect, useState} from "react";

export const useAuth = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState<string | null>(() => {
        const token = localStorage.getItem('token');
        if (token) {
            return authAPI.getUserRole();
        }
        return null;
    });
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return !!localStorage.getItem('token');
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = token ? authAPI.getUserRole() : null;

        const updateState = () => {
            setIsAuthenticated(true);
            setUserRole(role);
        };

        updateState();
    }, []);

    const loginMutation = useMutation({
        mutationFn: (data: UserAuth) => authAPI.login(data),
        onSuccess: (data) => {
            localStorage.setItem('token', data.token);
            const role = authAPI.getUserRole();
            setUserRole(role);
            setIsAuthenticated(true);

            if (role === 'client') {
                navigate('/products');
            }
            else {
                navigate('/another_page');
            }
        },
        onError: (error) => {
            console.error('Login error:', error);
        },
    });

    const registerMutation = useMutation({
        mutationFn: (data: UserCreate) => authAPI.register(data),
        onSuccess: () => {
            navigate('/login');
        },
        onError: (error) => {
            console.error('Register error:', error);
        },
    });

    const logoutMutation = useMutation({
        mutationFn: () => {
            authAPI.logout();
            return Promise.resolve();
        },
        onSuccess: () => {
            setUserRole(null);
            setIsAuthenticated(false);
            queryClient.clear();
            navigate('/login');
        },
    });

    return {
        isLoading: loginMutation.isPending || registerMutation.isPending,
        error: loginMutation.error || registerMutation.error,

        login: loginMutation.mutate,
        register: registerMutation.mutate,
        logout: logoutMutation.mutate,

        userRole: userRole,
        isAuthenticated: isAuthenticated,
        isClient: userRole === 'client',
        isWorker: userRole === 'worker',
        isAdmin: userRole === 'admin'
    };
};