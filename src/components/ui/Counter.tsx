import { getCounterAnimationDuration } from '@/utils/counterDuration';
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

interface CounterProps {
    className?: string;
}

export interface CounterRef {
    startAnimation: (targetMultiplier: number) => void;
}

const Counter = forwardRef<CounterRef, CounterProps>(({ className = '' }, ref) => {
    const [currentValue, setCurrentValue] = useState<number>(0);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const [targetValue, setTargetValue] = useState<number>(0);
    const animationRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);

    const [isQuickAnimation, setIsQuickAnimation] = useState<boolean>(false);

    // Функция для запуска анимации
    const startCounterAnimation = (targetMultiplier: number) => {
        if (isAnimating) return;
        
        setTargetValue(targetMultiplier);
        setCurrentValue(0);
        setIsAnimating(true);
        startTimeRef.current = performance.now();
    };

    const startQuickAnimation = () => {
        setIsQuickAnimation(true);
    };
    
    const stopQuickAnimation = () => {
        setIsQuickAnimation(false);
    };

    // Экспортируем метод для запуска анимации
    useImperativeHandle(ref, () => ({
        startAnimation: startCounterAnimation
    }));

    // Анимация счетчика
    useEffect(() => {
        if (!isAnimating) return;

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTimeRef.current;
            
            const duration = getCounterAnimationDuration(targetValue, isQuickAnimation ? 1000 : 3000);
            
            if (elapsed < duration) {
                // Используем easeOutCubic для плавного замедления
                const progress = elapsed / duration;
                const easeOutCubic = 1 - Math.pow(1 - progress, 3);
                
                const newValue = targetValue * easeOutCubic;
                setCurrentValue(newValue);
                
                animationRef.current = requestAnimationFrame(animate);
            } else {
                // Завершаем анимацию
                setCurrentValue(targetValue);
                setIsAnimating(false);
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isAnimating, targetValue]);

    // Форматирование значения
    const formatValue = (value: number): string => {
        return value.toFixed(2);
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className="text-center">
                <div 
                    className={`text-4xl font-bold transition-colors duration-300 text-white`}
                    // style={{
                    //     textShadow: '0 0 10px currentColor',
                    //     filter: 'drop-shadow(0 0 5px currentColor)'
                    // }}
                >
                    {formatValue(currentValue)}x
                </div>
                <div className="flex gap-2 mt-2">   
                <button className="text-sm text-gray-400 border border-gray-400 rounded-md px-2 py-1" onClick={startQuickAnimation}>fast</button>
                <button className="text-sm text-gray-400 border border-gray-400 rounded-md px-2 py-1" onClick={stopQuickAnimation}>slow</button>
                </div>
            </div>
        </div>
    );
});

Counter.displayName = 'Counter';

export default Counter;