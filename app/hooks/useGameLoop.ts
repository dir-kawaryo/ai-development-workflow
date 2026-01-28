import { useEffect } from 'react';

import { INITIAL_DROP_SPEED } from '@/app/constants/tetris';

interface GameLoopProps {
  onTick: () => void;
  isGameOver: boolean;
  isPaused: boolean;
  intervalRef: React.MutableRefObject<NodeJS.Timeout | null>;
}

export function useGameLoop({ onTick, isGameOver, isPaused, intervalRef }: GameLoopProps) {
  useEffect(() => {
    if (isGameOver || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(onTick, INITIAL_DROP_SPEED);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [onTick, isGameOver, isPaused, intervalRef]);
}
