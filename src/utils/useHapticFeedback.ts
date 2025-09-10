import { useCallback } from 'react';

type HapticImpactStyle = 'light' | 'medium' | 'heavy' | 'soft';
type HapticNotificationStyle = 'success' | 'warning' | 'error' | 'none';

export const useHapticFeedback = () => {

  const hapticImpact = useCallback((style: HapticImpactStyle = 'soft') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  }, []);

  const hapticNotification = useCallback((style: HapticNotificationStyle = 'none') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred(style);
    }
  }, []);
  
  return {
    hapticImpact,
    hapticNotification,
  };
};