import { useEffect, useState, useCallback } from 'react';

interface TgTapsUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  language_code: string;
  is_premium: boolean;
  allows_write_to_pm: boolean;
  photo_url: string;
}

interface TgTapsInitDataUnsafe {
  query_id: string;
  user: TgTapsUser;
  auth_date: string;
  signature: string;
  hash: string;
}

interface TgTapsData {
  initData: string;
  initDataUnsafe: TgTapsInitDataUnsafe;
}

export const useTgTaps = () => {
  const [telegramData, setTelegramData] = useState<TgTapsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestTelegramData = useCallback(() => {
    // Запрашиваем данные у TgTaps
    window.parent.postMessage({ type: "REQUEST_TELEGRAM_DATA" }, "*");
  }, []);

  const increasePoints = useCallback((points: number) => {
    // Увеличиваем/уменьшаем очки в UI TgTaps
    window.parent.postMessage(
      {
        type: 'INCREASE_POINTS',
        payload: points,
      },
      '*',
    );
  }, []);

  useEffect(() => {
    // Регистрируем слушатель для получения данных аккаунта
    const onTelegramDataReceived = (event: MessageEvent) => {
      if (event.data?.type === "TELEGRAM_DATA") {
        // Загружаем данные аккаунта
        const webAppData = event.data.payload;
        setTelegramData(webAppData);
        setIsLoading(false);
        setError(null);
      }
    };

    // Добавляем слушатель
    window.addEventListener("message", onTelegramDataReceived);
    
    // Запрашиваем у TgTaps отправить данные нашему слушателю
    requestTelegramData();

    // Таймаут для обработки случая, когда TgTaps не отвечает
    const timeout = setTimeout(() => {
      if (!telegramData) {
        setError('TgTaps не отвечает. Возможно, приложение не запущено в iframe TgTaps.');
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      window.removeEventListener("message", onTelegramDataReceived);
      clearTimeout(timeout);
    };
  }, [requestTelegramData, telegramData]);

  return {
    telegramData,
    isLoading,
    error,
    requestTelegramData,
    increasePoints,
  };
};
