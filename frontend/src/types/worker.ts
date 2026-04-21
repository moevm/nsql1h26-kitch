export interface WorkerCreate {
    name: string;
    email: string;
    date_of_birth: string; // ISO date
    position: string;
    start_experience: number;
    work_day_start: string; // HH:MM
    work_day_end: string;   // HH:MM
}

export interface WorkerUpdate {
    name?: string;
    email?: string;
    date_of_birth?: string;
    position?: string;
    work_day_start?: string;
    work_day_end?: string;
    comment?: string;
}

export interface WorkerPublic {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    positions: string[];
    current_position: string | null;
    experience_years: number;
    work_day_start: string | null;
    work_day_end: string | null;
    comment: string | null;
    date_of_birth: string | null;
    date_of_employment: string | null;
    date_of_remove: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}