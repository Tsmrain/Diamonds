import { useState, useEffect } from 'react';

export const useTimer = (checkInDate: string, durationHours: number) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isOvertime, setIsOvertime] = useState(false);

  useEffect(() => {
    const start = new Date(checkInDate).getTime();
    const baseMs = durationHours * 3600 * 1000;

    const tick = () => {
      const now = new Date().getTime();
      const diffMs = now - start;
      setElapsedSeconds(Math.floor(diffMs / 1000));
      setIsOvertime(diffMs > baseMs);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [checkInDate, durationHours]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return { 
    elapsedSeconds, 
    isOvertime, 
    formattedTime: formatTime(elapsedSeconds),
    remainingOrOvertimeFormatted: formatTime(Math.abs((durationHours * 3600) - elapsedSeconds))
  };
};
