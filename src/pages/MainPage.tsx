import BetWindow from "@/components/BetWindow";
import WinHistoryFeed from "@/components/WinHistoryFeed";
import CoinAnimation, { type CoinAnimationRef } from "@/components/CoinAnimation";
import Counter, { type CounterRef } from "@/components/ui/Counter";
// import SpeedToggle from "@/components/ui/SpeedToggle";
import { AnimationSpeedProvider } from "@/contexts/AnimationSpeedContext";
import { Context, type IStoreContext } from "@/store/StoreProvider";
import { useContext, useRef } from "react";

const MainPage = () => {
    const { user } = useContext(Context) as IStoreContext;
    const coinAnimationRef = useRef<CoinAnimationRef>(null);
    const counterRef = useRef<CounterRef>(null);

    const handleBetPlaced = (multiplier: number) => {
        console.log('MainPage: handleBetPlaced вызвана с множителем:', multiplier);
        console.log('MainPage: coinAnimationRef.current:', coinAnimationRef.current);
        
        // Запускаем анимацию монетки
        coinAnimationRef.current?.startAnimation(multiplier);
        
        // Запускаем анимацию счетчика
        counterRef.current?.startAnimation(multiplier);
    };

    return (
        <AnimationSpeedProvider>
            <div className="flex flex-col justify-end h-full w-full p-5">
                <div className="flex flex-col relative rounded-xl">
                    <CoinAnimation ref={coinAnimationRef} />
                    <Counter ref={counterRef} className="absolute top-4 right-4" />
                    
                    <WinHistoryFeed />
                </div>
                {/* <SpeedToggle className="absolute bottom-0 left-0" /> */}
                <BetWindow 
                    userBalance={user.userBalance} 
                    onBetPlaced={handleBetPlaced}
                />
            </div>
        </AnimationSpeedProvider>
    )
}

export default MainPage;