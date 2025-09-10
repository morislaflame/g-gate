import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useAnimationSpeed } from '@/hooks/useAnimationSpeed';
import GGCoinImage from '@/assets/GG-coin.png';

interface BalanceChangeProps {
    className?: string;
}

export interface BalanceChangeRef {
    startAnimation: (betAmount: number, finalAmount: number) => void;
}

const BalanceChange = observer(forwardRef<BalanceChangeRef, BalanceChangeProps>(({ className = '' }, ref) => {
    const [isVisible, setIsVisible] = useState(true); // Изначально видимый
    const [displayAmount, setDisplayAmount] = useState(0);
    const [initialBet, setInitialBet] = useState(0);
    const [finalAmount, setFinalAmount] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const animationRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);
    const animationState = useRef<{
        betAmount: number;
        finalAmount: number;
        multiplier: number;
    }>({ betAmount: 0, finalAmount: 0, multiplier: 0 });
    
    const { getDuration } = useAnimationSpeed();

    const startAnimation = (betAmount: number, finalAmount: number) => {
        
        setInitialBet(betAmount);
        setFinalAmount(finalAmount);
        setDisplayAmount(0); // Начинаем с 0
        setIsVisible(true);
        setIsAnimating(true);
        startTimeRef.current = performance.now();
        
        // Сохраняем значения для анимации в ref, чтобы избежать проблем с асинхронным обновлением состояния
        animationState.current = {
            betAmount,
            finalAmount,
            multiplier: finalAmount / betAmount
        };
        
        // Запускаем анимацию
        animationRef.current = requestAnimationFrame(animate);
    };

    const animate = (currentTime: number) => {
        const elapsed = currentTime - startTimeRef.current;
        const duration = getDuration(animationState.current.multiplier); // Используем множитель из ref
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function для плавной анимации (как в Counter)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        // Анимируем от 0 до полной суммы (ставка * множитель)
        const currentAmount = Math.round(animationState.current.finalAmount * easeOut);
        setDisplayAmount(currentAmount);
        
        
        if (progress < 1) {
            animationRef.current = requestAnimationFrame(animate);
        } else {
            setIsAnimating(false);
            setDisplayAmount(animationState.current.finalAmount);
        }
    };

    // Экспортируем методы
    useImperativeHandle(ref, () => ({
        startAnimation
    }));

    // Cleanup анимации
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    // Возвращаем компонент в изначальное состояние через 3 секунды после завершения анимации
    useEffect(() => {
        if (!isAnimating && isVisible && initialBet > 0) {
            const timer = setTimeout(() => {
                // Сбрасываем состояние в изначальное
                setInitialBet(0);
                setFinalAmount(0);
                setDisplayAmount(0);
            }, 2000);
            
            return () => clearTimeout(timer);
        }
    }, [isAnimating, isVisible, initialBet]);

    if (!isVisible) return null;

    const isWinning = finalAmount > initialBet;
    const isLoss = finalAmount < initialBet;

    // Определяем цвет блока
    let blockColor = 'bg-button-price'; // По умолчанию серый
    if (isAnimating) {
        // Во время анимации: красный если текущая сумма меньше ставки, зеленый если больше
        blockColor = displayAmount < initialBet ? 'bg-balance-change-secondary' : 'bg-balance-change-primary';
    } else if (initialBet > 0) {
        // После анимации: зеленый если выигрыш, красный если проигрыш, серый если ничья
        if (isWinning) blockColor = 'bg-balance-change-primary';
        else if (isLoss) blockColor = 'bg-balance-change-secondary';
        else blockColor = 'bg-button-price';
    } else {
        // Изначальное состояние: серый
        blockColor = 'bg-button-price';
    }

    // Определяем текст
    let text = '';
    if (isAnimating) {
        // Во время анимации показываем текущую сумму
        text = `Выигрыш: ${displayAmount.toLocaleString()}`;
    } else if (initialBet > 0) {
        // После анимации показываем финальный результат (разность)
        const netResult = finalAmount - initialBet;
        if (netResult > 0) {
            text = `Вы выиграли: +${netResult.toLocaleString()}`;
        } else if (netResult < 0) {
            text = `Вы проиграли: ${netResult.toLocaleString()}`;
        } else {
            text = `Выигрыш: ${netResult.toLocaleString()}`;
        }
    } else {
        // Изначальное состояние
        text = 'Моя ставка: 0';
    }

    return (
        <div className={`px-[10px] py-[6px] rounded-[12px] text-white text-sm font-medium transition-all duration-300  ${blockColor} ${className}`}>
            <div className="flex items-center gap-1">
                <span>{text}</span>
                <img src={GGCoinImage} alt="GG Coin" className="w-4 h-4" />
            </div>
        </div>
    );
}));

export default BalanceChange;
