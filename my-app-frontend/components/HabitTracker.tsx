
import React, { useState, useMemo } from 'react';
import { AppTheme, AppLanguage, Habit } from '../types';
import { THEME_CONFIG, TRANSLATIONS } from '../constants';
import { 
  Plus, Trash2, Edit2, CheckCircle2, Circle, Flame, TrendingUp, X, Check,
  Calendar as CalendarIcon, Save
} from 'lucide-react';

interface HabitTrackerProps {
  theme: AppTheme;
  language: AppLanguage;
  habits: Habit[];
  setHabits: (habits: Habit[]) => void;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ theme, language, habits, setHabits }) => {
  const t = TRANSLATIONS[language];
  const config = THEME_CONFIG[theme];
  const isDark = theme === 'night';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [habitTitle, setHabitTitle] = useState("");

  // Pega a data local no formato YYYY-MM-DD
  const getTodayStr = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });

  const handleOpenAdd = () => {
    setEditingHabit(null);
    setHabitTitle("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setHabitTitle(habit.title);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;

    if (editingHabit) {
      setHabits(habits.map(h => h.id === editingHabit.id ? { ...h, title: habitTitle.trim() } : h));
    } else {
      const newHabit: Habit = {
        id: Math.random().toString(36).substr(2, 9),
        title: habitTitle.trim(),
        history: {},
        createdAt: new Date()
      };
      setHabits([...habits, newHabit]);
    }
    setHabitTitle("");
    setEditingHabit(null);
    setIsModalOpen(false);
  };

  const toggleToday = (id: string, dateStr: string) => {
    setHabits(habits.map(h => {
      if (h.id === id) {
        return {
          ...h,
          history: { ...h.history, [dateStr]: !h.history[dateStr] }
        };
      }
      return h;
    }));
  };

  // Função para calcular o Streak (Fogo Ativo)
  const calculateStreak = (history: Record<string, boolean>) => {
    let streak = 0;
    let checkDate = new Date();
    const todayStr = getTodayStr();

    // Se hoje não foi feito, verificamos se ontem foi feito para manter a chama acesa
    if (!history[todayStr]) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateStr = checkDate.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
      if (history[dateStr]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
      if (streak > 3650) break; 
    }
    return streak;
  };

  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        full: d.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' }),
        label: d.toLocaleDateString('pt-BR', { weekday: 'narrow' }),
        dayNum: d.getDate()
      });
    }
    return days;
  }, []);

  return (
    <div className="p-8 lg:p-12 max-w-5xl mx-auto animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">
        <div>
          <h2 className="text-4xl lg:text-5xl font-black flex items-center gap-4 tracking-tight">
            <CheckCircle2 className={config.text} size={48} /> {t.habits}
          </h2>
          <p className="text-slate-500 mt-3 text-lg font-medium text-left">Construa sua melhor versão, um dia de cada vez.</p>
        </div>
        <button 
          onClick={handleOpenAdd} 
          className={`flex items-center gap-3 px-8 py-4 rounded-[24px] text-white font-black uppercase text-xs shadow-2xl transition-all active:scale-95 hover:brightness-110 ${config.primary}`}
        >
          <Plus size={22} /> Novo Hábito
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {habits.map(habit => {
          const streak = calculateStreak(habit.history);
          const todayStr = getTodayStr();
          const isDoneToday = !!habit.history[todayStr];
          
          return (
            <div key={habit.id} className={`p-10 rounded-[48px] border flex flex-col md:flex-row items-center justify-between group transition-all relative ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
              <div className="flex flex-col md:flex-row items-center gap-10 w-full md:w-auto">
                <button 
                  onClick={() => toggleToday(habit.id, todayStr)} 
                  className={`w-20 h-20 rounded-[32px] flex items-center justify-center transition-all border-4 shrink-0 ${
                    isDoneToday 
                      ? `${config.primary} border-transparent text-white shadow-2xl shadow-blue-500/40` 
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-300 hover:border-blue-500 hover:scale-105'
                  }`}
                >
                  {isDoneToday ? <Check size={40} strokeWidth={4} /> : <Circle size={40} strokeWidth={3} />}
                </button>
                
                <div className="text-center md:text-left flex-1">
                  <h3 className={`text-3xl font-black tracking-tight transition-all ${isDoneToday ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-100'}`}>
                    {habit.title}
                  </h3>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm ${streak > 0 ? 'bg-orange-50 text-orange-600 ring-1 ring-orange-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-50'}`}>
                      <Flame size={16} fill={streak > 0 ? "currentColor" : "none"} className={streak > 0 ? "animate-pulse" : ""} /> 
                      {streak > 0 ? `Fogo Ativo: ${streak} ${streak === 1 ? 'dia' : 'dias'}` : 'Fogo Apagado'}
                    </div>

                    <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-800">
                      {last7Days.map((day) => {
                        const isDone = !!habit.history[day.full];
                        const isToday = day.full === todayStr;
                        return (
                          <div 
                            key={day.full} 
                            title={`${day.dayNum} - ${isDone ? 'Concluído' : 'Pendente'}`}
                            className={`w-7 h-7 rounded-lg flex flex-col items-center justify-center text-[8px] font-black transition-all ${
                              isDone 
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                                : isToday 
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 ring-1 ring-blue-500/30' 
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                            }`}
                          >
                            {day.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-8 md:mt-0 lg:opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => handleOpenEdit(habit)}
                  className="p-4 text-slate-400 hover:text-blue-500 bg-slate-50 dark:bg-slate-800 rounded-2xl transition-all hover:scale-110 shadow-sm border border-transparent hover:border-blue-200"
                >
                  <Edit2 size={24} />
                </button>
              </div>
            </div>
          );
        })}

        {habits.length === 0 && (
          <div className="text-center py-32 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[64px]">
            <TrendingUp size={64} className="mx-auto text-slate-100 dark:text-slate-800 mb-8" />
            <p className="text-slate-400 italic text-xl font-bold">Nenhum hábito monitorado ainda.</p>
            <p className="text-[10px] uppercase font-black text-slate-300 mt-4 tracking-[0.4em]">A disciplina é a base de todo sucesso</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className={`w-full max-w-md p-12 rounded-[56px] border shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <CalendarIcon className={config.text} /> {editingHabit ? 'Editar Hábito' : 'Novo Hábito'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-red-500 transition-all"><X size={28}/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">O que você quer cultivar todos os dias?</label>
                <input 
                  autoFocus
                  type="text" 
                  required 
                  placeholder="Ex: Ler 10 páginas, Beber 3L de água..." 
                  value={habitTitle} 
                  onChange={e => setHabitTitle(e.target.value)} 
                  className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 outline-none font-black text-xl shadow-inner transition-all" 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 font-black text-xs uppercase tracking-widest rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-500">Cancelar</button>
                <button type="submit" className={`flex-1 py-5 font-black text-xs uppercase tracking-widest rounded-3xl text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${config.primary}`}>
                  <Save size={18} /> {editingHabit ? 'Salvar Alteração' : 'Criar Agora'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitTracker;
