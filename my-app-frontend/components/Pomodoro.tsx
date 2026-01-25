
import React, { useState, useEffect } from 'react';
import { AppTheme } from '../types';
import { THEME_CONFIG } from '../constants';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';

interface PomodoroProps {
  theme: AppTheme;
  isDark: boolean;
}

const Pomodoro: React.FC<PomodoroProps> = ({ theme, isDark }) => {
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const config = THEME_CONFIG[theme];

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      // Optional: alert user or play sound
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setSeconds(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  return (
    <div className={`rounded-3xl p-6 shadow-sm border transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
        <Timer className={config.text} /> Pomodoro
      </h3>
      
      <div className="flex flex-col items-center text-center">
        <div className={`text-5xl font-mono font-bold tracking-tighter mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {formatTime(seconds)}
        </div>
        
        <div className={`flex gap-3 mb-6 p-1 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <button 
            onClick={() => { setMode('focus'); setSeconds(25 * 60); setIsActive(false); }}
            className={`px-4 py-1 text-xs font-bold rounded-lg transition-all ${mode === 'focus' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            Foco
          </button>
          <button 
            onClick={() => { setMode('break'); setSeconds(5 * 60); setIsActive(false); }}
            className={`px-4 py-1 text-xs font-bold rounded-lg transition-all ${mode === 'break' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            Pausa
          </button>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={toggle}
            className={`h-12 w-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 ${config.primary}`}
          >
            {isActive ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
          </button>
          <button 
            onClick={reset}
            className={`h-12 w-12 rounded-full flex items-center justify-center border transition-colors ${isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-400' : 'border-slate-100 hover:bg-slate-50 text-slate-600'}`}
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;
