import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useAnimationSpeed } from '@/contexts/AnimationSpeedContext';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import BackImage from '@/assets/Back.png';
import CoinImage from '@/assets/Coin.png';

interface CoinAnimationProps {
    className?: string;
}

export interface CoinAnimationRef {
    startAnimation: (multiplier: number) => void;
    setBackgroundHeight: (height: number | null) => void;
}

const CoinAnimation = observer(forwardRef<CoinAnimationRef, CoinAnimationProps>(({ className = '' }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentMultiplier, setCurrentMultiplier] = useState<number | null>(null);
    const [backgroundHeight, setBackgroundHeight] = useState<number | null>(null); // Высота изображения фона (null = автоматически по высоте канваса)
    
    const { getDuration } = useAnimationSpeed();
    const { hapticImpact, hapticNotification } = useHapticFeedback();
    
    // Состояние анимации
    const animationState = useRef({
        backgroundOffset: 0,
        coinX: -200, // Начинаем за левым краем
        coinY: 0,
        coinRotation: 0,
        coinScale: 1,
        animationProgress: 0,
        isCoinVisible: false,
        isBackgroundMoving: false, // Фон движется только во время анимации монетки
        backgroundSpeed: 0.8, // Скорость движения фона (меньше чем у монетки)
        hasReachedCenter: false, // Флаг для haptic feedback при достижении центра
        lastHapticTime: 0, // Время последней вибрации в средней фазе
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
        
        console.log('Запуск анимации монетки с множителем:', multiplier);
        console.log('Фон начинает двигаться');
        
        // Haptic feedback при запуске анимации
        hapticImpact('medium');
        
        setCurrentMultiplier(multiplier);
        setIsAnimating(true);
        
        // Сбрасываем состояние анимации
        animationState.current = {
            backgroundOffset: 0,
            coinX: -200, // Начинаем дальше за левым краем
            coinY: 0,
            coinRotation: 0,
            coinScale: 1,
            animationProgress: 0,
            isCoinVisible: true,
            isBackgroundMoving: true, // Запускаем движение фона
            backgroundSpeed: 0.7, // Скорость фона меньше чем у монетки
            hasReachedCenter: false, // Сбрасываем флаг достижения центра
            lastHapticTime: 0, // Сбрасываем время последней вибрации
        };
    };

    // Экспортируем методы для управления анимацией
    useImperativeHandle(ref, () => ({
        startAnimation: startCoinAnimation,
        setBackgroundHeight: setBackgroundHeight
    }));

    // Функция отрисовки
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !backImage || !coinImage) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Получаем актуальные размеры канваса
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        
        // Очищаем канвас
        ctx.clearRect(0, 0, width, height);

        // Рисуем фон (циклично)
        // Масштабируем фон по заданной высоте или по высоте канваса, сохраняя пропорции
        const originalBgWidth = backImage.width; // 499
        const originalBgHeight = backImage.height; // 364
        
        // Используем заданную высоту или высоту канваса
        const targetHeight = backgroundHeight || height;
        
        // Рассчитываем масштаб по целевой высоте изображения
        const scale = targetHeight / originalBgHeight;
        const scaledBgWidth = originalBgWidth * scale;
        const scaledBgHeight = targetHeight;
        
        // Рассчитываем количество повторений фона по ширине
        const bgRepeats = Math.ceil(width / scaledBgWidth) + 2;
        
        
        for (let i = -1; i < bgRepeats; i++) {
            const x = (i * scaledBgWidth) - (animationState.current.backgroundOffset % scaledBgWidth);
            // Рисуем изображение масштабированным по заданной высоте
            ctx.drawImage(backImage, x, 0, scaledBgWidth, scaledBgHeight);
        }

        // Анимация монетки
        if (animationState.current.isCoinVisible && currentMultiplier) {
            const progress = animationState.current.animationProgress;
            
            // Три фазы анимации
            const centerX = width / 2;
            const startX = -200;
            const endX = width + 200;
            
            // Фазы анимации (в процентах от общего времени)
            const enterPhase = 0.15; // 15% времени - выезд на центр
            const spinPhase = 0.7;   // 70% времени - вращение в центре
            
            // Отладочная информация
            if (progress < 0.1) {
                let phase = 'enter';
                if (progress > enterPhase + spinPhase) phase = 'exit';
                else if (progress > enterPhase) phase = 'spin';
                
                const baseCoinScale = Math.min(width / 358, height / 412);
                const finalCoinScale = baseCoinScale * animationState.current.coinScale;
                
                console.log('Анимация монетки:', { 
                    progress: progress.toFixed(3), 
                    phase, 
                    coinX: animationState.current.coinX.toFixed(1), 
                    coinY: animationState.current.coinY.toFixed(1),
                    multiplier: currentMultiplier,
                    canvasSize: { width, height },
                    baseCoinScale: baseCoinScale.toFixed(3),
                    finalCoinScale: finalCoinScale.toFixed(3)
                });
            }
            
            let coinX, coinRotation, coinY, coinScale;
            
            // Постоянная скорость вращения (радиан в секунду)
            const rotationSpeed = 13; // 8 радиан в секунду = примерно 1.27 оборота в секунду
            const totalDuration = getDuration(currentMultiplier);
            const elapsedTime = progress * totalDuration; // Время в миллисекундах
            const baseRotation = (elapsedTime / 1000) * rotationSpeed; // Конвертируем в секунды
            
            // Постоянная скорость движения (пикселей в секунду)
            const movementSpeed = 800; // пикселей в секунду
            const elapsedSeconds = (progress * totalDuration) / 1000;
            
            if (progress <= enterPhase) {
                // Фаза 1: Резкий выезд на центр с постоянной скоростью
                const distance = elapsedSeconds * movementSpeed;
                const maxDistance = centerX - startX;
                const phaseProgress = Math.min(distance / maxDistance, 1);
                const easeOut = 1 - Math.pow(1 - phaseProgress, 3); // Ease out cubic
                coinX = startX + (centerX - startX) * easeOut;
                coinRotation = baseRotation;
                coinY = Math.sin(phaseProgress * Math.PI * 2) * 3;
                coinScale = 1 + Math.sin(phaseProgress * Math.PI * 4) * 0.1;
                
                // Периодические вибрации каждые 0.2 секунды в начальной фазе
                const currentTime = elapsedSeconds;
                if (currentTime - animationState.current.lastHapticTime >= 0.2) {
                    hapticImpact('light');
                    animationState.current.lastHapticTime = currentTime;
                }
                
                // Haptic feedback когда монетка достигает центра
                // if (phaseProgress > 0.9 && !animationState.current.hasReachedCenter) {
                //     hapticImpact('light');
                //     animationState.current.hasReachedCenter = true;
                // }
                
            } else if (progress <= enterPhase + spinPhase) {
                // Средняя фаза: монетка в центре с покачиванием вперед-назад
                const spinElapsedTime = elapsedSeconds - (enterPhase * totalDuration / 1000);
                const horizontalWobble = Math.sin(spinElapsedTime * 2.5) * 20; // Покачивание вперед-назад на 8 пикселей
                coinX = centerX + horizontalWobble;
                coinRotation = baseRotation;
                coinY = Math.sin(spinElapsedTime * 8) * 2; // Вертикальное покачивание
                coinScale = 1 + Math.sin(spinElapsedTime * 16) * 0.01; // Масштабирование
                
                // Периодические вибрации каждые 0.5 секунды в средней фазе
                const currentTime = elapsedSeconds;
                if (currentTime - animationState.current.lastHapticTime >= 0.2) {
                    hapticImpact('light');
                    animationState.current.lastHapticTime = currentTime;
                }
                
            } else {
                // Фаза 3: Резкий уезд из текущего положения с постоянной скоростью
                const exitStartTime = (enterPhase + spinPhase) * totalDuration / 1000;
                const exitElapsedTime = elapsedSeconds - exitStartTime;
                
                // Получаем позицию, откуда начинаем уезжать (последняя позиция в средней фазе)
                const lastSpinTime = (enterPhase + spinPhase) * totalDuration / 1000 - (enterPhase * totalDuration / 1000);
                const lastHorizontalWobble = Math.sin(lastSpinTime * 2.5) * 8;
                const exitStartX = centerX + lastHorizontalWobble;
                
                const distance = exitElapsedTime * movementSpeed;
                const maxDistance = endX - exitStartX;
                const phaseProgress = Math.min(distance / maxDistance, 1);
                const easeIn = Math.pow(phaseProgress, 3); // Ease in cubic
                coinX = exitStartX + (endX - exitStartX) * easeIn;
                coinRotation = baseRotation;
                coinY = Math.sin(phaseProgress * Math.PI * 2) * 3;
                coinScale = 1 + Math.sin(phaseProgress * Math.PI * 4) * 0.1;
            }
            
            // Обновляем состояние
            animationState.current.coinX = coinX;
            animationState.current.coinRotation = coinRotation;
            animationState.current.coinY = coinY;
            animationState.current.coinScale = coinScale;

            const baseCoinScale = Math.min(width / 358, height / 412); 
            const finalCoinScale = baseCoinScale * animationState.current.coinScale;
            const scaledCoinWidth = coinImage.width * finalCoinScale;
            
            if (animationState.current.coinX > -scaledCoinWidth * 2 && animationState.current.coinX < width + scaledCoinWidth) {
                // Рисуем тень монетки (отбрасывается на горизонтальную поверхность)
                ctx.save();
                ctx.translate(
                    animationState.current.coinX - 35, // Смещение тени влево
                    height / 2 + animationState.current.coinY + 95 + 8 // Смещение тени вниз
                );
                // Применяем те же эффекты масштабирования и покачивания, что и у монетки
                ctx.scale(finalCoinScale, finalCoinScale);
                ctx.globalAlpha = 0.25; // Прозрачность тени
                ctx.fillStyle = 'rgba(0, 0, 0, 0.74)'; // Цвет тени
                ctx.beginPath();
                // Тень тоже покачивается и масштабируется вместе с монеткой
                const shadowScaleX = 1.1 * animationState.current.coinScale; // Горизонтальный масштаб тени
                const shadowScaleY = 0.1 * animationState.current.coinScale; // Вертикальный масштаб тени
                ctx.ellipse(
                    0, 0, 
                    coinImage.width / 2 * shadowScaleX * 0.8, // Тень масштабируется вместе с монеткой
                    coinImage.height / 2 * shadowScaleY, // Тень масштабируется вместе с монеткой
                    0, 0, 2 * Math.PI
                );
                ctx.fill();
                ctx.restore();

                // Рисуем саму монетку
                ctx.save();
                ctx.translate(
                    animationState.current.coinX, 
                    height / 2 + animationState.current.coinY + 50 
                );
                ctx.rotate(animationState.current.coinRotation);
                ctx.scale(finalCoinScale, finalCoinScale);
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
            if (animationState.current.coinX > width + scaledCoinWidth || progress >= 1) {
                console.log('Анимация завершена - монетка уехала за край или достигнут конец прогресса');
                
                // Haptic feedback при завершении анимации
                hapticNotification('success');
                
                animationState.current.isCoinVisible = false;
                animationState.current.isBackgroundMoving = false; // Останавливаем движение фона
                setIsAnimating(false);
                setCurrentMultiplier(null);
            }
        }

        // Обновляем прогресс анимации с учетом скорости из контекста
        if (animationState.current.isCoinVisible && currentMultiplier) {
            const totalDuration = getDuration(currentMultiplier);
            const frameDuration = 16; // ~60 FPS
            const progressIncrement = frameDuration / totalDuration;
            
            animationState.current.animationProgress += progressIncrement;
            if (animationState.current.animationProgress >= 1) {
                animationState.current.animationProgress = 1;
                // Принудительно завершаем анимацию, если прогресс достиг 100%
                
                // Haptic feedback при принудительном завершении анимации
                hapticNotification('success');
                
                animationState.current.isCoinVisible = false;
                animationState.current.isBackgroundMoving = false; // Останавливаем движение фона
                setIsAnimating(false);
                setCurrentMultiplier(null);
            }
        }

        // Обновляем смещение фона только если фон должен двигаться
        if (animationState.current.isBackgroundMoving) {
            animationState.current.backgroundOffset += animationState.current.backgroundSpeed;
        }
    }, [backImage, coinImage, currentMultiplier, getDuration, backgroundHeight, hapticImpact, hapticNotification]);

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
    }, [draw]);

    // Пропорции канваса (соотношение сторон)
    const CANVAS_ASPECT_RATIO = 358 / 412; // ≈ 0.869

    // Обработка изменения размера окна
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const dpr = window.devicePixelRatio || 1;
            
            // Получаем размеры родительского контейнера
            const container = canvas.parentElement;
            if (!container) return;
            
            const containerWidth = container.clientWidth;
            const canvasWidth = containerWidth;
            const canvasHeight = canvasWidth / CANVAS_ASPECT_RATIO;
            
            // Устанавливаем размеры канваса в CSS пикселях
            canvas.style.width = canvasWidth + 'px';
            canvas.style.height = canvasHeight + 'px';
            
            // Устанавливаем размер буфера канваса в физических пикселях
            canvas.width = canvasWidth * dpr;
            canvas.height = canvasHeight * dpr;
            
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
    }, [CANVAS_ASPECT_RATIO]);

    return (
        <div className={`relative w-full ${className}`}>
            <canvas
                ref={canvasRef}
                className="w-full h-full overflow-hidden"
                style={{ 
                    background: 'transparent',
                    display: 'block',
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px'
                }}
            />
        </div>
    );
}));

export default CoinAnimation;