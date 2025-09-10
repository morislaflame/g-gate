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
    const pendingBetsRef = useRef<{multiplier: number, betAmount: number}[]>([]);

    const handleBetPlaced = (multiplier: number, betAmount: number) => {
        
        // Сохраняем данные ставки для последующего добавления в историю
        pendingBetsRef.current.push({ multiplier, betAmount });
        
        // Устанавливаем состояние анимации
        setIsAnimating(true);
        
        // Запускаем анимацию монетки
        coinAnimationRef.current?.startAnimation(multiplier);
        
        // Запускаем анимацию счетчика
        counterRef.current?.startAnimation(multiplier);
        
        // Запускаем анимацию изменения баланса
        const finalAmount = Math.round(betAmount * multiplier);
        
        // Небольшая задержка чтобы убедиться что компонент готов
        setTimeout(() => {
            balanceChangeRef.current?.startAnimation(betAmount, finalAmount);
        }, 10);
        
        // Проверяем завершение анимации через интервал
        const checkAnimationComplete = () => {
            const coinAnimating = coinAnimationRef.current?.isAnimating() || false;
            const counterAnimating = counterRef.current?.isAnimating() || false;
            
            
            if (!coinAnimating && !counterAnimating) {
                setIsAnimating(false);
                
                // Добавляем все ожидающие выигрыши в историю после завершения анимации Counter
                if (pendingBetsRef.current.length > 0) {
                    
                    // Добавляем все ожидающие ставки в историю
                    pendingBetsRef.current.forEach((bet, index) => {
                        console.log(`MainPage: Adding bet ${index + 1} to history:`, bet);
                        user.addWinToHistory(bet.betAmount, bet.multiplier);
                    });
                    
                    // Очищаем список ожидающих ставок
                    pendingBetsRef.current = [];
                }
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