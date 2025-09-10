import { observer } from 'mobx-react-lite';
import Chip from './ui/Chip';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useContext, useEffect, useRef, useState } from 'react';

const WinHistoryFeed = observer(() => {
    const { user } = useContext(Context) as IStoreContext;
    const [newWinId, setNewWinId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const previousWinsRef = useRef<typeof user.winHistory>([]);
    const isInitializedRef = useRef(false);
    
    // Получаем массив выигрышей напрямую
    const recentWins = user.getRecentWins(15);

    // Отслеживаем появление новых элементов
    useEffect(() => {
        
        // Если это первый рендер, просто инициализируем
        if (!isInitializedRef.current) {
            previousWinsRef.current = [...recentWins];
            isInitializedRef.current = true;
            return;
        }
        
        if (recentWins.length > 0 && previousWinsRef.current.length > 0) {
            // Проверяем, есть ли новый элемент (первый в списке)
            const currentFirstId = recentWins[0]?.id;
            const previousFirstId = previousWinsRef.current[0]?.id;
            
            
            if (currentFirstId && currentFirstId !== previousFirstId) {
                setNewWinId(currentFirstId);
                
                // Убираем флаг нового элемента через время анимации
                const timer = setTimeout(() => {
                    setNewWinId(null);
                }, 500); // Время анимации
                
                // Обновляем предыдущее состояние после запуска анимации
                previousWinsRef.current = [...recentWins];
                
                return () => {
                    clearTimeout(timer);
                };
            } else {
                previousWinsRef.current = [...recentWins];
            }
        } else {
            console.log('⏭️ Skipping check - not enough data');
        }
    }, [recentWins]);

    return (
        <div className="p-4 w-full absolute bottom-0 left-0">
            <div 
                ref={containerRef}
                className="flex gap-2 overflow-x-auto hide-scrollbar ios-scroll"
            >
                {recentWins.map((win, index) => {
                    const isNew = win.id === newWinId;
                    const isShifting = newWinId && index > 0;
                    
                    if (isNew || isShifting) {
                        console.log(`🎭 Rendering chip ${win.id} (index: ${index}):`, {
                            isNew,
                            isShifting,
                            newWinId,
                            animationDelay: isShifting ? `${index * 30}ms` : '0ms'
                        });
                    }
                    
                    return (
                        <div
                            key={win.id}
                            className={`transition-all duration-500 ease-out ${
                                isNew 
                                    ? 'animate-slide-in-from-top' 
                                    : isShifting 
                                        ? 'animate-slide-right' 
                                        : ''
                            }`}
                            style={{
                                animationDelay: isShifting ? `${index * 30}ms` : '0ms',
                                willChange: isNew || isShifting ? 'transform, opacity' : 'auto'
                            }}
                        >
                            <Chip 
                                multiplier={win.multiplier}
                                className=""
                            />
                        </div>
                    );
                })}
            </div>
            
            {recentWins.length === 0 && (
                <p className="text-white opacity-70 text-center py-4">
                    Пока нет истории выигрышей
                </p>
            )}
        </div>
    );
});

export default WinHistoryFeed;