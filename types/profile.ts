export type ProfileRole = 'user' | 'admin';
export type LockStatus = 'none' | 'soft' | 'hard';

export interface Profile {
    id: string;
    email: string;
    role: ProfileRole;
    coin_balance: number;
    phone?: string;
    zalo?: string;
    lock_status: LockStatus;
    lock_updated_at?: string;
    created_at: string;
    listings?: { count: number }[];
}
