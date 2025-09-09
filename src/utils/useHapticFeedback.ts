import { useCallback } from 'react';

type HapticImpactStyle = 'light' | 'medium' | 'heavy' | 'soft';

export const useHapticFeedback = () => {

  const hapticImpact = useCallback((style: HapticImpactStyle = 'soft') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  }, []);
  
  return {
    hapticImpact,
  };
};