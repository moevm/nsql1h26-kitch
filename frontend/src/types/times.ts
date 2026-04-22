export interface Times {
    deadline?: string | Date | null;
    start?: string | Date | null;
    end?: string | Date | null;
    est_time: number;
    spent: number;
    expired_time: number;
}