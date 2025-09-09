import { createContext, useContext, useState, ReactNode } from 'react';

export type AnimationSpeed = 'slow' | 'fast';

interface AnimationSpeedContextType {
    speed: AnimationSpeed;
    setSpeed: (speed: AnimationSpeed) => void;
    getDuration: (targetValue: number) => number;
}

const AnimationSpeedContext = createContext<AnimationSpeedContextType | undefined>(undefined);

interface AnimationSpeedProviderProps {
    children: ReactNode;
}

export const AnimationSpeedProvider = ({ children }: AnimationSpeedProviderProps) => {
    const [speed, setSpeed] = useState<AnimationSpeed>('slow');

    const getDuration = (targetValue: number): number => {
        const baseDuration = speed === 'fast' ? 1000 : 3000; // 1с для быстрого, 3с для медленного
        return Math.max(0.5, Math.min(targetValue, 5)) * baseDuration;
    };

    return (
        <AnimationSpeedContext.Provider value={{ speed, setSpeed, getDuration }}>
            {children}
        </AnimationSpeedContext.Provider>
    );
};

export const useAnimationSpeed = () => {
    const context = useContext(AnimationSpeedContext);
    if (context === undefined) {
        throw new Error('useAnimationSpeed must be used within an AnimationSpeedProvider');
    }
    return context;
};
