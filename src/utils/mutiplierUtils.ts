import type { WinHistory } from '@/types/types';

// Функция для генерации случайного мультипликатора
export const generateRandomMultiplier = (): number => {
    // Генерируем случайное число от 0.5 до 3.0 с шагом 0.1
    const min = 0.5;
    const max = 3.0;
    const step = 0.1;
    
    const range = (max - min) / step;
    const randomStep = Math.floor(Math.random() * (range + 1));
    
    return Math.round((min + randomStep * step) * 10) / 10;
};

// Функция для расчета выигрыша
export const calculateWinAmount = (betAmount: number, multiplier: number): number => {
    return Math.round(betAmount * multiplier);
};

// Функция для создания записи в истории выигрышей
export const createWinHistoryEntry = (betAmount: number, multiplier: number): WinHistory => {
    return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        multiplier,
        timestamp: new Date(),
        betAmount,
        winAmount: calculateWinAmount(betAmount, multiplier)
    };
};

// Функция для получения цвета чипа (дублируем логику из компонента для использования в других местах)
export const getChipColor = (multiplier: number): string => {
    const normalizedMultiplier = Math.max(0, Math.min(1, (multiplier - 0.5) / 2.5));
    
    if (normalizedMultiplier >= 0.75) {
        return 'var(--color-chip-primary)';
    } else if (normalizedMultiplier >= 0.5) {
        return 'var(--color-chip-secondary)';
    } else if (normalizedMultiplier >= 0.25) {
        return 'var(--color-chip-tertiary)';
    } else {
        return 'var(--color-chip-quaternary)';
    }
};