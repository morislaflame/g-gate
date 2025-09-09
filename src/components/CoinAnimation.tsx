import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { observer } from 'mobx-react-lite';
// import { Context, type IStoreContext } from '@/store/StoreProvider';
// import { useContext } from 'react';
import BackImage from '@/assets/Back.png';
import CoinImage from '@/assets/Coin.png';

interface CoinAnimationProps {
    className?: string;
}

export interface CoinAnimationRef {
    startAnimation: (multiplier: number) => void;
}

const CoinAnimation = observer(forwardRef<CoinAnimationRef, CoinAnimationProps>(({ className = '' }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    // const { user } = useContext(Context) as IStoreContext;
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentMultiplier, setCurrentMultiplier] = useState<number | null>(null);
    
    // Состояние анимации
    const animationState = useRef({
        backgroundOffset: 0,
        coinX: -100, // Начинаем за левым краем
        coinY: 0,
        coinRotation: 0,
        coinScale: 1,
        animationProgress: 0,
        isCoinVisible: false,
        backgroundSpeed: 0.5, // Скорость движения фона
    });

    // Загружаем изображения
    const [backImage, setBackImage] = useState<HTMLImageElement | null>(null);
    const [coinImage, setCoinImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        // Загружаем изображения
        const loadBackImage = new Image();
        loadBackImage.onload = () => setBackImage(loadBackImage);
        loadBackImage.src = BackImage;

        const loadCoinImage = new Image();
        loadCoinImage.onload = () => setCoinImage(loadCoinImage);
        loadCoinImage.src = CoinImage;
    }, []);

    // Функция для запуска анимации
    const startCoinAnimation = (multiplier: number) => {
        if (isAnimating) return;
        
        setCurrentMultiplier(multiplier);
        setIsAnimating(true);
        
        // Сбрасываем состояние анимации
        animationState.current = {
            backgroundOffset: 0,
            coinX: -100,
            coinY: 0,
            coinRotation: 0,
            coinScale: 1,
            animationProgress: 0,
            isCoinVisible: true,
            backgroundSpeed: 0.5,
        };
    };

    // Экспортируем метод для запуска анимации
    useImperativeHandle(ref, () => ({
        startAnimation: startCoinAnimation
    }));

    // Функция отрисовки
    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas || !backImage || !coinImage) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = canvas;
        
        // Очищаем канвас
        ctx.clearRect(0, 0, width, height);

        // Рисуем фон (циклично)
        // Используем оригинальные размеры изображения
        const originalBgWidth = backImage.width; // 499
        const originalBgHeight = backImage.height; // 364
        
        // Рассчитываем количество повторений фона по ширине
        const bgRepeats = Math.ceil(width / originalBgWidth) + 2;
        
        for (let i = -1; i < bgRepeats; i++) {
            const x = (i * originalBgWidth) - (animationState.current.backgroundOffset % originalBgWidth);
            // Рисуем изображение в оригинальном размере
            ctx.drawImage(backImage, x, 0, originalBgWidth, originalBgHeight);
        }

        // Анимация монетки
        if (animationState.current.isCoinVisible && currentMultiplier) {
            const progress = animationState.current.animationProgress;
            
            // Рассчитываем расстояние качения в зависимости от мультипликатора
            // Чем больше мультипликатор, тем дальше катится монетка
            const maxDistance = width + 200; // Максимальное расстояние
            const multiplierFactor = Math.min(currentMultiplier / 3.0, 1); // Нормализуем до 0-1
            const targetDistance = maxDistance * (0.3 + multiplierFactor * 0.7); // От 30% до 100% от максимального расстояния
            
            // Позиция монетки
            animationState.current.coinX = -100 + (targetDistance * progress);
            
            // Вращение монетки (зависит от пройденного расстояния)
            animationState.current.coinRotation = progress * targetDistance * 0.1;
            
            // Небольшое покачивание по Y
            animationState.current.coinY = Math.sin(progress * Math.PI * 4) * 5;
            
            // Масштаб (небольшое изменение размера во время качения)
            animationState.current.coinScale = 1 + Math.sin(progress * Math.PI * 8) * 0.1;

            // Рисуем монетку только если она еще видна на экране
            if (animationState.current.coinX > -coinImage.width && animationState.current.coinX < width + coinImage.width) {
                ctx.save();
                ctx.translate(
                    animationState.current.coinX + coinImage.width / 2,
                    height / 2 + animationState.current.coinY
                );
                ctx.rotate(animationState.current.coinRotation);
                ctx.scale(animationState.current.coinScale, animationState.current.coinScale);
                ctx.drawImage(
                    coinImage,
                    -coinImage.width / 2,
                    -coinImage.height / 2,
                    coinImage.width,
                    coinImage.height
                );
                ctx.restore();
            }

            // Проверяем, закончилась ли анимация - монетка полностью уехала за правый край
            if (animationState.current.coinX > width + coinImage.width) {
                animationState.current.isCoinVisible = false;
                setIsAnimating(false);
                setCurrentMultiplier(null);
            }
        }

        // Обновляем прогресс анимации
        if (animationState.current.isCoinVisible) {
            animationState.current.animationProgress += 0.02; // Увеличиваем скорость анимации
            if (animationState.current.animationProgress >= 1) {
                animationState.current.animationProgress = 1;
                // Принудительно завершаем анимацию, если прогресс достиг 100%
                if (animationState.current.isCoinVisible) {
                    animationState.current.isCoinVisible = false;
                    setIsAnimating(false);
                    setCurrentMultiplier(null);
                }
            }
        }

        // Обновляем смещение фона
        animationState.current.backgroundOffset += animationState.current.backgroundSpeed;
    };

    // Основной цикл анимации
    useEffect(() => {
        const animate = () => {
            draw();
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [backImage, coinImage, isAnimating, currentMultiplier]);

    // Обработка изменения размера окна
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            
            // Устанавливаем размер канваса в CSS пикселях
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
            
            // Устанавливаем размер буфера канваса в физических пикселях
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            
            // Масштабируем контекст для поддержки Retina дисплеев
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(dpr, dpr);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className={`relative w-full flex-1 ${className}`}>
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ 
                    background: 'transparent',
                    display: 'block'
                }}
            />
        </div>
    );
}));

export default CoinAnimation;