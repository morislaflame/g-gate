import {makeAutoObservable, runInAction } from "mobx";
import { fetchMyInfo, telegramAuth, check } from "@/http/userAPI";
import { type UserInfo, type WinHistory } from "@/types/types";
import { generateRandomMultiplier, createWinHistoryEntry } from "@/utils/mutiplierUtils";

export default class UserStore {
    _user: UserInfo | null = null;
    _isAuth = false;
    _users: UserInfo[] = [];
    _loading = false;
    isTooManyRequests = false;
    isServerError = false;
    serverErrorMessage = '';
    _winHistory: WinHistory[] = []; // История выигрышей

    constructor() {
        makeAutoObservable(this);
        this.initializeMockWinHistory(); // Инициализируем моковые данные
    }

    // Инициализация моковых данных истории выигрышей
    initializeMockWinHistory() {
        const mockHistory: WinHistory[] = [
            createWinHistoryEntry(100, 2.3),
            createWinHistoryEntry(500, 0.8),
            createWinHistoryEntry(1000, 1.5),
            createWinHistoryEntry(200, 2.8),
            createWinHistoryEntry(300, 0.6),
            createWinHistoryEntry(1500, 1.2),
            createWinHistoryEntry(800, 2.1),
            createWinHistoryEntry(400, 0.9),
            createWinHistoryEntry(600, 1.8),
            createWinHistoryEntry(1200, 2.5),
        ];
        
        // Сортируем по времени (новые сверху)
        this._winHistory = mockHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    // Метод для генерации временного множителя (без добавления в историю)
    generateTempMultiplier(): number {
        const multiplier = generateRandomMultiplier();
        return multiplier;
    }

    // Метод для добавления нового выигрыша в историю
    addWinToHistory(betAmount: number, multiplier: number) {
        const newWin = createWinHistoryEntry(betAmount, multiplier);
        
        
        runInAction(() => {
            // Добавляем в начало массива
            this._winHistory.unshift(newWin);
            
            // Обновляем баланс пользователя
            if (this._user) {
                // Сначала списываем ставку
                this._user.balance -= betAmount;
                // Затем добавляем выигрыш
                this._user.balance += newWin.winAmount;
            }
        });
        
        return newWin;
    }

    // Метод для получения последних N выигрышей
    getRecentWins(count: number = 10): WinHistory[] {
        const result = this._winHistory.slice(0, count);
        return result;
    }

    setIsAuth(bool: boolean) {
        this._isAuth = bool;
    }

    setUser(user: UserInfo | null) {
        this._user = user;
    }

    setUsers(users: UserInfo[]) {
        this._users = users;
    }

    setLoading(loading: boolean) {
        this._loading = loading;
    }

    setTooManyRequests(flag: boolean) {
        this.isTooManyRequests = flag;
    }

    setServerError(flag: boolean, message: string = '') {
        this.isServerError = flag;
        this.serverErrorMessage = message;
    }

    async logout() {
        try {
            this.setIsAuth(false);
            this.setUser(null);
        } catch (error) {
            console.error("Error during logout:", error);
        }
    }

    async telegramLogin(initData: string) {
        try {
            const data = await telegramAuth(initData);
            runInAction(() => {
                this.setUser(data as UserInfo);
                this.setIsAuth(true);
                this.setServerError(false);
            });
        } catch (error) {
            console.error("Error during Telegram authentication:", error);
            this.setServerError(true, 'Server is not responding. Please try again later.');
        }
    }
    
    async checkAuth() {
        try {
            const data = await check();
            runInAction(() => {
                this.setUser(data as UserInfo);
                this.setIsAuth(true);
                this.setServerError(false);
            });
        } catch (error) {
            console.error("Error during auth check:", error);
            runInAction(() => {
                this.setIsAuth(false);
                this.setUser(null);
                this.setServerError(true, 'Server is not responding. Please try again later.');
            });
        }
    }

    async fetchMyInfo() {
        try {
            const data = await fetchMyInfo();
            runInAction(() => {
                this.setUser(data as UserInfo);
            });
            
        } catch (error) {
            console.error("Error during fetching my info:", error);
        }
    }

    get users() {
        return this._users;
    }

    get isAuth() {
        return this._isAuth
    }

    get user() {
        return this._user
    }

    get loading() {
        return this._loading;
    }

    get winHistory() {
        return this._winHistory;
    }

    // Добавляем моковый баланс для демонстрации
    get userBalance() {
        return this._user?.balance || 10000; // Моковый баланс
    }
}
