import { useAnimationSpeed } from '@/hooks/useAnimationSpeed';

interface SpeedToggleProps {
    className?: string;
}

const SpeedToggle = ({ className = '' }: SpeedToggleProps) => {
    const { speed, setSpeed } = useAnimationSpeed();

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span className="text-sm text-gray-400">Скорость:</span>
            <div className="relative">
                <div className="flex bg-gray-700 rounded-lg p-1">
                    <button
                        onClick={() => setSpeed('slow')}
                        className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                            speed === 'slow'
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'text-gray-300 hover:text-white'
                        }`}
                    >
                        Медленно
                    </button>
                    <button
                        onClick={() => setSpeed('fast')}
                        className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                            speed === 'fast'
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'text-gray-300 hover:text-white'
                        }`}
                    >
                        Быстро
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpeedToggle;
