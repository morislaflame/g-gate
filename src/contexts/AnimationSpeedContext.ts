import { createContext } from 'react';

export type AnimationSpeed = 'slow' | 'fast';

interface AnimationSpeedContextType {
    speed: AnimationSpeed;
    setSpeed: (speed: AnimationSpeed) => void;
    getDuration: (targetValue: number) => number;
}

export const AnimationSpeedContext = createContext<AnimationSpeedContextType | undefined>(undefined);
