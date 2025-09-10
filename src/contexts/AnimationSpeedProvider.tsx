import { useState, type ReactNode } from 'react';
import { AnimationSpeedContext, type AnimationSpeed } from './AnimationSpeedContext';

interface AnimationSpeedProviderProps {
    children: ReactNode;
}

export const AnimationSpeedProvider = ({ children }: AnimationSpeedProviderProps) => {
    const [speed, setSpeed] = useState<AnimationSpeed>('slow');

    const getDuration = (targetValue: number): number => {
        const baseDuration = speed === 'fast' ? 1000 : 5000; // 1с для быстрого, 3с для медленного
        return Math.max(0.5, Math.min(targetValue, 5)) * baseDuration;
    };

    return (
        <AnimationSpeedContext.Provider value={{ speed, setSpeed, getDuration }}>
            {children}
        </AnimationSpeedContext.Provider>
    );
};
