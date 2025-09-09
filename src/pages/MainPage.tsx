import BetWindow from "@/components/BetWindow";
import WinHistoryFeed from "@/components/WinHistoryFeed";
import CoinAnimation, { type CoinAnimationRef } from "@/components/CoinAnimation";
import Counter, { type CounterRef } from "@/components/ui/Counter";
import { Context, type IStoreContext } from "@/store/StoreProvider";
import { useContext, useRef } from "react";

const MainPage = () => {
    const { user } = useContext(Context) as IStoreContext;
    const coinAnimationRef = useRef<CoinAnimationRef>(null);
    const counterRef = useRef<CounterRef>(null);

    const handleBetPlaced = (multiplier: number) => {
        // Запускаем анимацию монетки
        coinAnimationRef.current?.startAnimation(multiplier);
        
        // Запускаем анимацию счетчика
        counterRef.current?.startAnimation(multiplier);
    };

    return (
        <div className="flex flex-col justify-end h-full w-full p-5">
            <div className="flex-1 flex flex-col relative">
                <CoinAnimation />
                <Counter ref={counterRef} className="absolute top-0 right-0" />
            </div>
            <WinHistoryFeed />
            <BetWindow 
                userBalance={user.userBalance} 
                onBetPlaced={handleBetPlaced}
            />
        </div>
    )
}

export default MainPage;