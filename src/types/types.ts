export interface UserInfo {
    id: number;
    username: string;
    balance: number;
    telegramId: number;
}

export interface WinHistory {
    id: string;
    multiplier: number;
    timestamp: Date;
    betAmount: number;
    winAmount: number;
}