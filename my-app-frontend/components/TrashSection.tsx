
import React, { useMemo } from 'react';
import { AppTheme, AppLanguage, Task, Note, Goal, Notebook, Expense } from '../types';
import { TRANSLATIONS, THEME_CONFIG } from '../constants';
import { Trash2, RotateCcw, Clock, CheckSquare, FileText, Target, Book, Wallet } from 'lucide-react';

interface TrashSectionProps {
  theme: AppTheme;
  language: AppLanguage;
  tasks: Task[];
  setTasks: (tasks: any) => void;
  notes: Note[];
  setNotes: (notes: any) => void;
  goals: Goal[];
  setGoals: (goals: any) => void;
  notebooks: Notebook[];
  setAllNotebooks: (notebooks: any) => void;
  expenses: Expense[];
  setAllExpenses: (expenses: any) => void;
}

const TrashSection: React.FC<TrashSectionProps> = ({ 
  theme, language, 
  tasks, setTasks, 
  notes, setNotes, 
  goals, setGoals, 
  notebooks, setAllNotebooks,
  expenses = [], setAllExpenses
}) => {
  const t = TRANSLATIONS[language];
  const config = THEME_CONFIG[theme];
  const isDark = theme === 'night';

  const deletedItems = useMemo(() => {
    const list: any[] = [];
    
    tasks.filter(t => t.deletedAt).forEach(i => list.push({ ...i, _type: 'Tarefa', _icon: CheckSquare }));
    notes.filter(n => n.deletedAt).forEach(i => list.push({ ...i, _type: 'Nota', _icon: FileText }));
    goals.filter(g => g.deletedAt).forEach(i => list.push({ ...i, _type: 'Meta', _icon: Target }));
    notebooks.filter(nb => nb.deletedAt).forEach(i => list.push({ ...i, _type: 'Caderno', _icon: Book }));
    expenses.filter(e => e.deletedAt).forEach(i => list.push({ ...i, _type: 'Despesa', _icon: Wallet, title: i.description }));

    return list.sort((a, b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime());
  }, [tasks, notes, goals, notebooks, expenses]);

  const calculateDaysLeft = (deletedAt: Date) => {
    const date = new Date(deletedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, 10 - diffDays);
  };

  const handleRestore = (item: any) => {
    const type = item._type;
    if (type === 'Tarefa') setTasks((prev: Task[]) => prev.map(t => t.id === item.id ? { ...t, deletedAt: undefined } : t));
    if (type === 'Nota') setNotes((prev: Note[]) => prev.map(n => n.id === item.id ? { ...n, deletedAt: undefined } : n));
    if (type === 'Meta') setGoals((prev: Goal[]) => prev.map(g => g.id === item.id ? { ...g, deletedAt: undefined } : g));
    if (type === 'Caderno') setAllNotebooks((prev: Notebook[]) => prev.map(nb => nb.id === item.id ? { ...nb, deletedAt: undefined } : nb));
    if (type === 'Despesa') setAllExpenses((prev: Expense[]) => prev.map(e => e.id === item.id ? { ...e, deletedAt: undefined } : e));
  };

  const handlePermanentDelete = (item: any) => {
    if (!window.confirm("Esta ação não pode ser desfeita. Excluir permanentemente?")) return;
    
    const type = item._type;
    if (type === 'Tarefa') setTasks((prev: Task[]) => prev.filter(t => t.id !== item.id));
    if (type === 'Nota') setNotes((prev: Note[]) => prev.filter(n => n.id !== item.id));
    if (type === 'Meta') setGoals((prev: Goal[]) => prev.filter(g => g.id !== item.id));
    if (type === 'Caderno') setAllNotebooks((prev: Notebook[]) => prev.filter(nb => nb.id !== item.id));
    if (type === 'Despesa') setAllExpenses((prev: Expense[]) => prev.filter(e => e.id !== item.id));
  };

  return (
    <div className="p-8 lg:p-12 max-w-5xl mx-auto animate-in fade-in duration-500 pb-32">
      <div className="mb-16 text-center">
        <div className={`mx-auto w-20 h-20 rounded-[32px] bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-500 mb-6 shadow-xl`}>
          <Trash2 size={40} />
        </div>
        <h2 className="text-4xl font-black tracking-tight">{t.trash}</h2>
        <p className="text-slate-500 mt-2 font-medium">Itens removidos serão excluídos permanentemente após 10 dias.</p>
      </div>

      <div className="space-y-4">
        {deletedItems.map(item => {
          const daysLeft = calculateDaysLeft(item.deletedAt);
          return (
            <div key={`${item._type}-${item.id}`} className={`flex flex-col md:flex-row md:items-center justify-between p-7 rounded-[32px] border transition-all hover:shadow-xl group ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className="flex items-center gap-6 text-left">
                <div className={`p-4 rounded-2xl ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-400'} shadow-inner`}>
                  <item._icon size={24} />
                </div>
                <div>
                  <p className="font-black text-lg text-slate-800 dark:text-slate-100 tracking-tight">{item.title || item.content.substring(0, 30) + '...'}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">{item._type}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-6 md:mt-0">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${daysLeft <= 2 ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'}`}>
                  <Clock size={14} /> {daysLeft} dias restantes
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleRestore(item)}
                    className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-500 transition-all shadow-sm hover:scale-110"
                    title="Restaurar Item"
                  >
                    <RotateCcw size={20} />
                  </button>
                  <button 
                    onClick={() => handlePermanentDelete(item)}
                    className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 transition-all shadow-sm hover:scale-110"
                    title="Excluir Permanentemente"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {deletedItems.length === 0 && (
          <div className="py-24 text-center border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[48px]">
             <Trash2 size={64} className="mx-auto text-slate-200 dark:text-slate-800 mb-6" />
             <p className="text-slate-400 font-bold italic text-lg uppercase tracking-widest">Sua lixeira está vazia.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrashSection;
