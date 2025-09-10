import BetWindow from "@/components/BetWindow";
import WinHistoryFeed from "@/components/WinHistoryFeed";
import CoinAnimation, { type CoinAnimationRef } from "@/components/CoinAnimation";
import Counter, { type CounterRef } from "@/components/ui/Counter";
import BalanceChange, { type BalanceChangeRef } from "@/components/BalanceChange";
// import SpeedToggle from "@/components/ui/SpeedToggle";
import { AnimationSpeedProvider } from "@/contexts/AnimationSpeedContext";
import { Context, type IStoreContext } from "@/store/StoreProvider";
import { useContext, useRef, useState } from "react";

const MainPage = () => {
    const { user } = useContext(Context) as IStoreContext;
    const coinAnimationRef = useRef<CoinAnimationRef>(null);
    const counterRef = useRef<CounterRef>(null);
    const balanceChangeRef = useRef<BalanceChangeRef>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleBetPlaced = (multiplier: number, betAmount: number) => {
        console.log('MainPage: handleBetPlaced вызвана с множителем:', multiplier, 'ставка:', betAmount);
        console.log('MainPage: coinAnimationRef.current:', coinAnimationRef.current);
        
        // Устанавливаем состояние анимации
        setIsAnimating(true);
        
        // Запускаем анимацию монетки
        coinAnimationRef.current?.startAnimation(multiplier);
        
        // Запускаем анимацию счетчика
        counterRef.current?.startAnimation(multiplier);
        
        // Запускаем анимацию изменения баланса
        const finalAmount = Math.round(betAmount * multiplier);
        console.log('MainPage: Расчет финальной суммы', { betAmount, multiplier, finalAmount });
        
        // Небольшая задержка чтобы убедиться что компонент готов
        setTimeout(() => {
            balanceChangeRef.current?.startAnimation(betAmount, finalAmount);
        }, 10);
        
        // Проверяем завершение анимации через интервал
        const checkAnimationComplete = () => {
            if (coinAnimationRef.current && !coinAnimationRef.current.isAnimating()) {
                setIsAnimating(false);
            } else {
                setTimeout(checkAnimationComplete, 100); // Проверяем каждые 100мс
            }
        };
        
        // Начинаем проверку через небольшую задержку
        setTimeout(checkAnimationComplete, 100);
    };

    return (
        <AnimationSpeedProvider>
            <div className="flex flex-col justify-end h-full w-full p-5">
                <div className="flex flex-col relative rounded-xl">
                    <CoinAnimation ref={coinAnimationRef} />
                    <div className="flex items-center justify-between gap-2 w-full absolute top-0 left-0 p-4">
                        
                        <BalanceChange ref={balanceChangeRef} />
                        <Counter ref={counterRef}  />
                    </div>
                    <WinHistoryFeed />
                </div>
                {/* <SpeedToggle className="absolute bottom-0 left-0" /> */}
                <BetWindow 
                    userBalance={user.userBalance} 
                    onBetPlaced={handleBetPlaced}
                    isAnimating={isAnimating}
                />
            </div>
        </AnimationSpeedProvider>
    )
}

export default MainPage;