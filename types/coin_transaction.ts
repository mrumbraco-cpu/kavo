export type CoinTransactionType = 'topup' | 'reward' | 'unlock';

export interface CoinTransaction {
    id: string;
    user_id: string;
    amount: number;
    type: CoinTransactionType;
    reference: string;
    created_at: string;
}
