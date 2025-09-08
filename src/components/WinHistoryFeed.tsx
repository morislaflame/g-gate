import { observer } from 'mobx-react-lite';
import Chip from './ui/Chip';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useContext } from 'react';

const WinHistoryFeed = observer(() => {
    const { user } = useContext(Context) as IStoreContext;
    const recentWins = user.getRecentWins(15); 

    return (
        <div className="p-4 w-full">
            
            <div className="flex gap-2 overflow-x-auto hide-scrollbar ios-scroll">
                {recentWins.map((win) => (
                    <Chip 
                        key={win.id} 
                        multiplier={win.multiplier}
                        className=""
                    />
                ))}
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