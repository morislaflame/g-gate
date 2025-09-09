export const getCounterAnimationDuration = (targetValue: number, duration: number) => {

    return Math.max(0.5, Math.min(targetValue, 5)) * duration;
}