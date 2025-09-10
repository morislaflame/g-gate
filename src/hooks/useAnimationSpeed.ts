import { useContext } from 'react';
import { AnimationSpeedContext } from '@/contexts/AnimationSpeedContext';

export const useAnimationSpeed = () => {
    const context = useContext(AnimationSpeedContext);
    if (context === undefined) {
        throw new Error('useAnimationSpeed must be used within an AnimationSpeedProvider');
    }
    return context;
};
