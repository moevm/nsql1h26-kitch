export interface UserCreate {
    username: string;
    email: string;
    phone?: string;
    password: string;
}

export interface UserAuth {
    email: string;
    password: string;
}

export interface RegisterResponse {
    id: string;
}

export interface AuthResponse {
    token: string;
}