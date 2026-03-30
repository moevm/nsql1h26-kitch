import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';
import type { UserCreate, UserAuth } from '../types/user';

export const useAuth = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const loginMutation = useMutation({
        mutationFn: (data: UserAuth) => authAPI.login(data),
        onSuccess: (data) => {
            localStorage.setItem('token', data.token);
            navigate('/main-page');                                                      // TODO: Разделить по ролям
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
    };
};