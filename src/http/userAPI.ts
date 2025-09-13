import { $host } from "./index";
import { jwtDecode } from "jwt-decode";

export const telegramAuth = async (init_data: string) => {
    console.log("Sending to server:", { init_data });
    console.log("Init data type:", typeof init_data);
    console.log("Init data length:", init_data.length);
    
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