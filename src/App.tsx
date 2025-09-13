import { lazy, Suspense, useContext, useEffect, useState } from 'react'
import { BrowserRouter } from "react-router-dom";
import { observer } from 'mobx-react-lite';
import { useTelegramApp } from '@/utils/useTelegramApp';
import { useTgTaps } from '@/hooks/useTgTaps';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import LoadingIndicator from '@/components/LoadingIndicator';

const AppRouter = lazy(() => import("@/router/AppRouter"));

const App = observer(() => {
  const { user } = useContext(Context) as IStoreContext;
  const [loading, setLoading] = useState(true);
  const [authAttempted, setAuthAttempted] = useState(false);
  const {
    disableVerticalSwipes,
    lockOrientation,
    ready,
    isAvailable,
    setHeaderColor,
    setBackgroundColor
  } = useTelegramApp();
  
  // TgTaps интеграция
  const { telegramData, isLoading: tgtapsLoading, error: tgtapsError } = useTgTaps();


  useEffect(() => {
    if (isAvailable) {
      disableVerticalSwipes();
      setHeaderColor('#000000');
      setBackgroundColor('#000000');
      lockOrientation();

      ready();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAvailable, disableVerticalSwipes, lockOrientation, ready]);

  const tg = window?.Telegram?.WebApp;

  useEffect(() => {
    const authenticate = async () => {
      // Предотвращаем повторные попытки авторизации
      if (authAttempted || user.authAttempted) {
        setLoading(false);
        return;
      }

      setAuthAttempted(true);

      // Проверяем, есть ли данные от TgTaps
      if (telegramData?.initData) {
        console.log("TgTaps Init Data:", telegramData.initData);
        console.log("TgTaps Init Data type:", typeof telegramData.initData);
        console.log("TgTaps Init Data length:", telegramData.initData.length);
        try {
          // Выполняем аутентификацию через TgTaps
          await user.telegramLogin(telegramData.initData);
        } catch (error) {
          console.error("TgTaps authentication error:", error);
        }
        setLoading(false);
        return;
      }

      // Если TgTaps не отвечает, пробуем обычную Telegram аутентификацию
      const initData = tg?.initData;
      console.log("Telegram Init Data:", initData);

      if (initData) {
        try {
          // Выполняем аутентификацию через Telegram
          await user.telegramLogin(initData);
        } catch (error) {
          console.error("Telegram authentication error:", error);
        }
      }
      setLoading(false);
    };

    // Ждем завершения загрузки TgTaps или таймаута
    if (!tgtapsLoading && !authAttempted && !user.authAttempted) {
      authenticate();
    } else if (user.authAttempted) {
      setLoading(false);
    }
  }, [telegramData, tgtapsLoading, tg?.initData, authAttempted, user]);

  if (loading || tgtapsLoading) {
    return <LoadingIndicator />;
  }

  // Показываем ошибку TgTaps, если она есть
  if (tgtapsError) {
    console.warn("TgTaps error:", tgtapsError);
    // Продолжаем работу с обычной Telegram аутентификацией
  }


  return (
      <BrowserRouter>
            <Suspense fallback={<LoadingIndicator />}>
              <AppRouter />
            </Suspense>
      </BrowserRouter>
  )
});

export default App;
