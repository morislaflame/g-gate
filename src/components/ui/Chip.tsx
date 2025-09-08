interface ChipProps {
    multiplier: number;
    className?: string;
}

const Chip = ({ multiplier, className = "" }: ChipProps) => {
    // Функция для определения цвета чипа на основе мультипликатора
    const getChipColor = (multiplier: number): string => {
        // Нормализуем мультипликатор от 0.5 до 3.0 в диапазон 0-1
        const normalizedMultiplier = Math.max(0, Math.min(1, (multiplier - 0.5) / 2.5));
        
        // Определяем цвет на основе нормализованного значения
        if (normalizedMultiplier >= 0.75) {
            return 'var(--color-chip-primary)'; // Самый высокий выигрыш
        } else if (normalizedMultiplier >= 0.5) {
            return 'var(--color-chip-secondary)';
        } else if (normalizedMultiplier >= 0.25) {
            return 'var(--color-chip-tertiary)';
        } else {
            return 'var(--color-chip-quaternary)'; // Самый низкий выигрыш
        }
    };

    const formatMultiplier = (multiplier: number): string => {
        if (multiplier >= 1) {
            return `${multiplier.toFixed(2)}x`;
        } else {
            return `${multiplier.toFixed(2)}x`;
        }
    };

    return (
        <div 
            className={`inline-flex items-center justify-center px-[12px] py-[8px] rounded-full text-white font-semibold text-sm min-w-[60px] transition-all duration-200 hover:scale-x-105 ${className}`}
            style={{ backgroundColor: getChipColor(multiplier) }}
        >
            {formatMultiplier(multiplier)}
        </div>
    );
};

export default Chip;