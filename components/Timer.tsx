
import React, { useEffect, useState } from 'react';

interface TimerProps {
  initialSeconds: number;
  onTimeUp: () => void;
  isActive: boolean;
  questionIndex: number; // To reset timer on new question
}

export const Timer: React.FC<TimerProps> = ({ initialSeconds, onTimeUp, isActive, questionIndex }) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    setTimeLeft(initialSeconds);
  }, [questionIndex, initialSeconds]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onTimeUp]);

  const percentage = (timeLeft / initialSeconds) * 100;
  const colorClass = timeLeft < 10 ? 'bg-red-500' : timeLeft < 20 ? 'bg-amber-500' : 'bg-indigo-600';

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-500">Temps restant</span>
        <span className={`text-sm font-bold ${timeLeft < 10 ? 'text-red-600' : 'text-slate-700'}`}>
          {timeLeft}s
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
