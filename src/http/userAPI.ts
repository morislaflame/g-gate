import { $host } from "./index";
import { jwtDecode } from "jwt-decode";

export const telegramAuth = async (init_data: string) => {
    const { data } = await $host.post('auth/telegram/init', { init_data });
    localStorage.setItem('token', data.token);
    return {
        ...jwtDecode(data.token),
    };
};

// Функция для аутентификации через TgTaps
export const tgtapsAuth = async (initData: string) => {
    const { data } = await $host.post('auth/telegram/init', { init_data: initData });
    localStorage.setItem('token', data.token);
    return {
        ...jwtDecode(data.token),
    };
};