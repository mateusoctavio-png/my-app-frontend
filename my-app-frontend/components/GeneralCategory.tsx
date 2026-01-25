
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { AppTheme, AppLanguage, Task, Note, Goal, Notebook, Priority, GoalStatus, Expense } from '../types';
import { THEME_CONFIG, TRANSLATIONS } from '../constants';
import { 
  CheckSquare, FileText, Target, Book, Plus, 
  Download, Share2, Trash2, Edit2, X, Calendar, Clock, Check, AlertCircle,
  ChevronDown, Timer, ArrowUpRight, BookOpen, Save, Wallet, Calculator, CreditCard, ChevronLeft, ChevronRight,
  Search, Bookmark, MessageSquare, Loader2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Props {
  categoryId: string;
  theme: AppTheme;
  language: AppLanguage;
  allTasks: Task[];
  setAllTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void;
  allNotes: Note[];
  setAllNotes: (notes: Note[] | ((prev: Note[]) => Note[])) => void;
  allGoals: Goal[];
  setAllGoals: (goals: Goal[] | ((prev: Goal[]) => Goal[])) => void;
  allNotebooks: Notebook[];
  setAllNotebooks: (notebooks: Notebook[] | ((prev: Notebook[]) => Notebook[])) => void;
  allExpenses?: Expense[];
  setAllExpenses?: (expenses: Expense[] | ((prev: Expense[]) => Expense[])) => void;
}

const GeneralCategory: React.FC<Props> = ({ 
  categoryId, theme, language, 
  allTasks, setAllTasks, allNotes, setAllNotes, allGoals, setAllGoals, allNotebooks, setAllNotebooks,
  allExpenses, setAllExpenses
}) => {
  const isFinance = categoryId === 'finances';
  const [activeTab, setActiveTab] = useState<'tasks' | 'notes' | 'goals' | 'notebook' | 'bible' | 'expenses'>(
    categoryId === 'devotional' ? 'bible' : (isFinance ? 'expenses' : 'tasks')
  );
  const [shareStatus, setShareStatus] = useState<'idle' | 'success'>('idle');
  const [exportStatus, setExportStatus] = useState<'idle' | 'success'>('idle');

  const t = TRANSLATIONS[language];
  const config = THEME_CONFIG[theme];
  const isDark = theme === 'night';

  const tabs = [
    { id: 'tasks', label: t.tasks, icon: CheckSquare },
    { id: 'notes', label: t.notepad, icon: FileText },
    { id: 'goals', label: t.goalsTable, icon: Target },
    { id: 'notebook', label: t.notebook, icon: Book },
  ];

  if (categoryId === 'devotional') tabs.unshift({ id: 'bible', label: t.bible, icon: Book });
  if (isFinance) tabs.unshift({ id: 'expenses', label: "Minhas Despesas", icon: Wallet });

  const handleExport = () => {
    try {
      const categoryName = (t as any)[categoryId] || categoryId;
      let content = `MY. ORGANIZADOR - RELATÓRIO: ${categoryName.toUpperCase()}\n`;
      content += `Data de emissão: ${new Date().toLocaleString()}\n`;
      content += `==========================================\n\n`;

      if (activeTab === 'tasks') {
        const tasks = allTasks.filter(t => !t.deletedAt && t.categoryId === categoryId);
        content += `ABA: TAREFAS\n\n`;
        tasks.forEach(task => {
          content += `[${task.completed ? 'X' : ' '}] ${task.title}\n    Prioridade: ${task.priority} | Prazo: ${task.dueDate}\n\n`;
        });
      }

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `My_Relatorio_${categoryId}_${activeTab}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 2000);
    } catch (err) {
      console.error("Erro ao exportar:", err);
    }
  };

  const handleShare = async () => {
    const categoryName = (t as any)[categoryId] || categoryId;
    const shareText = `Confira meu progresso em "${categoryName}" (Aba ${activeTab}) no My. Organizador Pessoal!`;
    const shareUrl = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({ title: `My. - ${categoryName}`, text: shareText, url: shareUrl });
        setShareStatus('success');
        setTimeout(() => setShareStatus('idle'), 2000);
      } catch (err) {}
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h2 className="text-4xl font-black capitalize tracking-tight">{(t as any)[categoryId] || categoryId}</h2>
        </div>
        <div className="flex gap-3">
          <button className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border transition-all font-bold text-sm dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800`} onClick={handleExport}>
            {exportStatus === 'success' ? <Check size={18} /> : <Download size={18} />}
            {exportStatus === 'success' ? 'Baixado!' : 'Exportar'}
          </button>
          <button className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border transition-all font-bold text-sm dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800`} onClick={handleShare}>
            {shareStatus === 'success' ? <Check size={18} /> : <Share2 size={18} />}
            {shareStatus === 'success' ? 'Compartilhado!' : 'Compartilhar'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-1.5 rounded-[24px] bg-slate-100 dark:bg-slate-900/50 mb-10 self-start border dark:border-slate-800">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? `${config.primary} text-white shadow-xl shadow-blue-500/20` : 'text-slate-500 hover:bg-slate-200'}`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className={`min-h-[65vh] rounded-[40px] p-10 border transition-all ${isDark ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-white border-slate-100 shadow-2xl shadow-slate-200/50'}`}>
        {activeTab === 'expenses' && allExpenses && setAllExpenses && (
          <ExpensesModule expenses={allExpenses} setExpenses={setAllExpenses} theme={theme} categoryId={categoryId} />
        )}
        {activeTab === 'tasks' && <TasksModule tasks={allTasks} setTasks={setAllTasks} theme={theme} categoryId={categoryId} language={language} />}
        {activeTab === 'notes' && <NotesModule notes={allNotes} setNotes={setAllNotes} theme={theme} categoryId={categoryId} language={language} />}
        {activeTab === 'goals' && <GoalsModule goals={allGoals} setGoals={setAllGoals} theme={theme} categoryId={categoryId} language={language} />}
        {activeTab === 'notebook' && <NotebookModule notebooks={allNotebooks} setNotebooks={setAllNotebooks} theme={theme} categoryId={categoryId} language={language} />}
        {activeTab === 'bible' && <BibleModule theme={theme} />}
      </div>
    </div>
  );
};

const ExpensesModule = ({ expenses, setExpenses, theme, categoryId }: { expenses: Expense[], setExpenses: (update: any) => void, theme: AppTheme, categoryId: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const config = THEME_CONFIG[theme];
  const isDark = theme === 'night';

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    isRecurring: false,
    installments: '1'
  });

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      // Garantir que itens excluídos não apareçam na lista principal
      if (e.deletedAt) return false;
      const d = new Date(e.dueDate + 'T12:00:00');
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
    });
  }, [expenses, viewMonth, viewYear]);

  const totals = useMemo(() => {
    const total = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const paid = filteredExpenses.filter(e => e.paid).reduce((acc, curr) => acc + curr.amount, 0);
    return { total, paid, remaining: total - paid };
  }, [filteredExpenses]);

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formData.amount);
    
    if (editingExpense) {
      setExpenses((prev: Expense[]) => prev.map(exp => 
        exp.id === editingExpense.id 
          ? { ...exp, description: formData.description, amount: amountNum, dueDate: formData.dueDate } 
          : exp
      ));
    } else {
      const instCount = parseInt(formData.installments) || 1;
      const baseDate = new Date(formData.dueDate + 'T12:00:00');
      const groupId = Math.random().toString(36).substr(2, 9);
      
      const newItems: Expense[] = [];
      for (let i = 0; i < instCount; i++) {
        const d = new Date(baseDate);
        d.setMonth(baseDate.getMonth() + i);
        newItems.push({
          id: Math.random().toString(36).substr(2, 9),
          categoryId,
          description: instCount > 1 ? `${formData.description} (${i + 1}/${instCount})` : formData.description,
          amount: amountNum,
          dueDate: d.toISOString().split('T')[0],
          isRecurring: formData.isRecurring,
          installments: instCount,
          currentInstallment: i + 1,
          paid: false,
          groupId: instCount > 1 ? groupId : undefined
        });
      }
      setExpenses((prev: Expense[]) => [...prev, ...newItems]);
    }
    
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
    setFormData({ description: '', amount: '', dueDate: new Date().toISOString().split('T')[0], isRecurring: false, installments: '1' });
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setFormData({
      description: exp.description,
      amount: exp.amount.toString(),
      dueDate: exp.dueDate,
      isRecurring: false,
      installments: '1'
    });
    setIsModalOpen(true);
  };

  const togglePaid = (id: string) => {
    setExpenses((prev: Expense[]) => prev.map(e => e.id === id ? { ...e, paid: !e.paid } : e));
  };

  const changeMonth = (delta: number) => {
    let newMonth = viewMonth + delta;
    let newYear = viewYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div className="flex items-center gap-6">
          <div className={`p-4 rounded-3xl ${config.primary} text-white shadow-xl`}>
            <Calculator size={32} />
          </div>
          <div className="text-left">
            <h3 className="text-3xl font-black">Lançamentos Mensais</h3>
            <div className="flex items-center gap-4 mt-1">
              <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"><ChevronLeft size={18}/></button>
              <span className="text-lg font-bold text-slate-500 dark:text-slate-400 min-w-[140px] text-center">{monthNames[viewMonth]} de {viewYear}</span>
              <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"><ChevronRight size={18}/></button>
            </div>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-black uppercase text-xs shadow-xl transition-all active:scale-95 ${config.primary}`}><Plus size={20} /> Novo Lançamento</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className={`p-8 rounded-[40px] border transition-all ${isDark ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-slate-50 border-transparent shadow-inner'}`}>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Montante Total</p>
          <p className="text-3xl font-black text-slate-700 dark:text-slate-100">R$ {totals.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className={`p-8 rounded-[40px] border transition-all ${isDark ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-green-50/50 border-transparent shadow-inner'}`}>
          <p className="text-[10px] font-black uppercase text-green-500 tracking-widest mb-2">Total Pago</p>
          <p className="text-3xl font-black text-green-600">R$ {totals.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className={`p-8 rounded-[40px] border transition-all ${isDark ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-red-50/50 border-transparent shadow-inner'}`}>
          <p className="text-[10px] font-black uppercase text-red-500 tracking-widest mb-2">Restante a Pagar</p>
          <p className="text-3xl font-black text-red-600">R$ {totals.remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="space-y-4">
        {filteredExpenses.map(exp => (
          <div key={exp.id} className={`p-6 rounded-[32px] border flex items-center justify-between group transition-all ${exp.paid ? 'opacity-40 grayscale blur-[0.3px]' : 'hover:shadow-2xl hover:-translate-y-1'} ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-center gap-6 text-left">
              <button onClick={() => togglePaid(exp.id)} className={`h-10 w-10 rounded-xl border-2 flex items-center justify-center transition-all ${exp.paid ? 'bg-green-500 border-green-500 text-white shadow-lg' : 'border-slate-300 dark:border-slate-600 hover:border-blue-500'}`}>
                {exp.paid && <Check size={20} strokeWidth={3} />}
              </button>
              <div>
                <h4 className={`text-xl font-black tracking-tight ${exp.paid ? 'line-through' : ''}`}>{exp.description}</h4>
                <div className="flex items-center gap-4 mt-1 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                   <span className="flex items-center gap-1"><Calendar size={12}/> Venc: {new Date(exp.dueDate + 'T12:00:00').toLocaleDateString()}</span>
                   {exp.installments > 1 && <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded">Parcela {exp.currentInstallment}/{exp.installments}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className={`text-2xl font-black mr-4 ${exp.paid ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>R$ {exp.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <div className="flex items-center gap-2 transition-all">
                <button onClick={() => openEditModal(exp)} className="p-3 text-slate-400 hover:text-blue-500 bg-slate-50 dark:bg-slate-800 rounded-2xl transition-all shadow-sm"><Edit2 size={18}/></button>
              </div>
            </div>
          </div>
        ))}
        {filteredExpenses.length === 0 && (
          <div className="py-20 text-center border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[48px]">
             <CreditCard size={48} className="mx-auto text-slate-100 dark:text-slate-800 mb-6" />
             <p className="text-slate-400 font-bold italic">Nenhuma despesa lançada para este período.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className={`w-full max-w-lg p-12 rounded-[48px] border shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black uppercase tracking-tight">{editingExpense ? 'Editar Despesa' : 'Nova Despesa'}</h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"><X size={28}/></button>
            </div>
            <form onSubmit={handleSaveExpense} className="space-y-6">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Descrição do Gasto</label>
                <input type="text" required placeholder="Ex: Aluguel" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 font-bold outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Valor (R$)</label>
                  <input type="number" step="0.01" required placeholder="0,00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 font-bold outline-none" />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Data do Pagamento</label>
                  <input type="date" required value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 font-bold outline-none" />
                </div>
              </div>
              
              {!editingExpense && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800">
                    <div 
                      onClick={() => setFormData({...formData, isRecurring: !formData.isRecurring})}
                      className={`w-12 h-7 rounded-full relative transition-all cursor-pointer ${formData.isRecurring ? config.primary : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${formData.isRecurring ? 'left-6' : 'left-1'}`} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Lançamento que se repete?</span>
                  </div>
                  {formData.isRecurring && (
                    <div className="space-y-2 text-left animate-in slide-in-from-top-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Número de Parcelas</label>
                      <input type="number" min="1" value={formData.installments} onChange={e => setFormData({...formData, installments: e.target.value})} className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 font-bold outline-none" />
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={closeModal} className="flex-1 py-5 font-black text-xs uppercase tracking-widest rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-500">Cancelar</button>
                <button type="submit" className={`flex-1 py-5 font-black text-xs uppercase tracking-widest rounded-3xl text-white shadow-xl transition-all active:scale-95 ${config.primary}`}>
                  {editingExpense ? 'Salvar Alterações' : 'Confirmar Lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TasksModule = ({ tasks, setTasks, theme, categoryId, language }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const getTodayISO = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
  const [formData, setFormData] = useState({ title: '', priority: 'medium' as Priority, dueDate: getTodayISO(), categoryId: categoryId });
  const config = THEME_CONFIG[theme];
  const isDark = theme === 'night';
  const categoryTasks = tasks.filter((t: Task) => !t.deletedAt && t.categoryId === categoryId);
  const t = TRANSLATIONS[language];

  const categories = [
    'work', 'college', 'reading', 'training', 'media', 'finances', 
    'goals', 'diet', 'ideas', 'travel', 'studies', 'commitments', 'devotional',
    'health', 'leisure', 'marriage', 'relationship'
  ];

  const toggleTask = (id: string) => setTasks((prev: Task[]) => prev.map((t: Task) => t.id === id ? { ...t, completed: !t.completed } : t));
  
  const deleteTask = (id: string) => {
    setTasks((prev: Task[]) => prev.map(t => t.id === id ? { ...t, deletedAt: new Date() } : t));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      setTasks((prev: Task[]) => prev.map((t: Task) => t.id === editingTask.id ? { ...t, ...formData } : t));
    } else {
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title: formData.title,
        priority: formData.priority,
        dueDate: formData.dueDate,
        categoryId: formData.categoryId,
        completed: false
      };
      setTasks((prev: Task[]) => [newTask, ...prev]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-2xl font-black">Lista de Tarefas</h3>
        <button onClick={() => { setEditingTask(null); setFormData({title: '', priority: 'medium', dueDate: getTodayISO(), categoryId: categoryId}); setIsModalOpen(true); }} className={`flex items-center gap-3 px-7 py-3 rounded-2xl text-white font-black uppercase text-xs shadow-xl ${config.primary}`}><Plus size={20} /> Nova Tarefa</button>
      </div>
      <div className="space-y-4">
        {categoryTasks.map((task: Task) => (
          <div key={task.id} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border dark:border-slate-800 flex justify-between items-center group transition-all">
            <div className="flex items-center gap-5">
              <button onClick={() => toggleTask(task.id)} className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>{task.completed && <CheckSquare size={18} />}</button>
              <div>
                <span className={`font-bold text-lg ${task.completed ? 'line-through text-slate-400' : ''}`}>{task.title}</span>
                <p className="text-[10px] font-black uppercase text-slate-400 mt-1">{task.dueDate === getTodayISO() ? 'Hoje' : new Date(task.dueDate + 'T00:00:00').toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <button onClick={() => { setEditingTask(task); setFormData({title: task.title, priority: task.priority, dueDate: task.dueDate, categoryId: task.categoryId}); setIsModalOpen(true); }} className="p-2.5 text-slate-400 hover:text-blue-500 bg-white dark:bg-slate-800 rounded-xl shadow-sm"><Edit2 size={18} /></button>
              <button onClick={() => deleteTask(task.id)} className="p-2.5 text-slate-400 hover:text-red-500 bg-white dark:bg-slate-800 rounded-xl shadow-sm"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
        {categoryTasks.length === 0 && (
          <p className="text-center py-12 text-slate-400 font-bold italic">Nenhuma tarefa cadastrada nesta categoria.</p>
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-lg p-10 rounded-[40px] border shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100'}`}>
            <h3 className="text-2xl font-black mb-8 uppercase tracking-tight">{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Título</label>
                <input type="text" required placeholder="Título" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 outline-none font-bold" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Categoria</label>
                  <div className="relative">
                    <select 
                      value={formData.categoryId} 
                      onChange={e => setFormData({...formData, categoryId: e.target.value})}
                      className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 outline-none font-bold appearance-none pr-10"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{(t as any)[cat] || cat}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Prioridade</label>
                  <div className="relative">
                    <select 
                      value={formData.priority} 
                      onChange={e => setFormData({...formData, priority: e.target.value as Priority})}
                      className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 outline-none font-bold appearance-none pr-10"
                    >
                      <option value="high">Alta</option>
                      <option value="medium">Média</option>
                      <option value="low">Baixa</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Data de Cumprimento</label>
                <input type="date" required value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 outline-none font-bold" />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-xs uppercase rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500">Cancelar</button>
                <button type="submit" className={`flex-1 py-4 font-black text-xs uppercase rounded-2xl text-white shadow-xl ${config.primary}`}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const NotesModule = ({ notes, setNotes, theme, categoryId, language }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState("");
  const config = THEME_CONFIG[theme];
  const isDark = theme === 'night';
  const categoryNotes = notes.filter((n: Note) => !n.deletedAt && n.categoryId === categoryId);
  
  const deleteNote = (id: string) => {
    setNotes((prev: Note[]) => prev.map(n => n.id === id ? { ...n, deletedAt: new Date() } : n));
  };

  const handleAddNote = () => {
    if (!content.trim()) return;
    const newNote: Note = {
      id: Date.now().toString(),
      categoryId,
      content: content.trim(),
      timestamp: new Date()
    };
    setNotes((prev: Note[]) => [newNote, ...prev]);
    setIsModalOpen(false);
    setContent("");
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-2xl font-black">Lembretes e Notas</h3>
        <button onClick={() => { setContent(""); setIsModalOpen(true); }} className={`flex items-center gap-3 px-7 py-3 rounded-2xl text-white font-black uppercase text-xs shadow-xl ${config.primary}`}><Plus size={20} /> Criar Nota</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryNotes.map((n: Note) => (
          <div key={n.id} className="p-8 rounded-[40px] bg-slate-50 dark:bg-slate-800/40 border dark:border-slate-800 group relative transition-all min-h-[180px] flex flex-col justify-between">
            <p className="text-sm font-bold leading-relaxed">{n.content}</p>
            <div className="flex justify-between items-center mt-6">
              <span className="text-[9px] font-black uppercase text-slate-400">{new Date(n.timestamp).toLocaleDateString()}</span>
              <button onClick={() => deleteNote(n.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 bg-white dark:bg-slate-800 rounded-xl shadow-sm"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {categoryNotes.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[40px]">
            <FileText size={48} className="mx-auto text-slate-100 dark:text-slate-800 mb-4" />
            <p className="text-slate-400 font-bold italic">Nenhuma nota para exibir.</p>
          </div>
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-lg p-10 rounded-[48px] border shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100'}`}>
            <h3 className="text-2xl font-black mb-8 uppercase tracking-tight">Escrever Nota</h3>
            <textarea required value={content} onChange={e => setContent(e.target.value)} placeholder="O que você está pensando?" className="w-full min-h-[250px] p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 outline-none font-medium text-lg leading-relaxed resize-none" />
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-xs uppercase rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500">Cancelar</button>
              <button onClick={handleAddNote} className={`flex-1 py-4 font-black text-xs uppercase rounded-2xl text-white shadow-xl ${config.primary}`}>Salvar Nota</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const GoalsModule = ({ goals, setGoals, theme, categoryId, language }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({ title: '', dueDate: '', description: '', status: 'pendente' as GoalStatus });
  const config = THEME_CONFIG[theme];
  const isDark = theme === 'night';
  const categoryGoals = goals.filter((g: Goal) => !g.deletedAt && g.categoryId === categoryId);

  const calculateDaysLeft = (dueDate: string) => {
    if (!dueDate) return 0;
    const target = new Date(dueDate + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case 'concluída': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'inconclusa': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'parcialmente concluída': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pendente': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGoal) {
      setGoals((prev: Goal[]) => prev.map(g => g.id === editingGoal.id ? { ...g, ...formData } : g));
    } else {
      const newGoal: Goal = {
        id: Date.now().toString(),
        categoryId,
        ...formData
      };
      setGoals((prev: Goal[]) => [newGoal, ...prev]);
    }
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const deleteGoal = (id: string) => {
    setGoals((prev: Goal[]) => prev.map(g => g.id === id ? { ...g, deletedAt: new Date() } : g));
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h3 className="text-3xl font-black tracking-tight">Quadro de Metas</h3>
          <p className="text-slate-400 text-sm mt-1 font-medium">Gestão de objetivos de longo prazo</p>
        </div>
        <button 
          onClick={() => { 
            setEditingGoal(null);
            setFormData({title: '', dueDate: '', description: '', status: 'pendente'}); 
            setIsModalOpen(true); 
          }} 
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-black uppercase text-xs shadow-xl transition-all active:scale-95 ${config.primary}`}
        >
          <Plus size={20} /> Definir Meta
        </button>
      </div>

      <div className="overflow-x-auto bg-slate-50/50 dark:bg-slate-900/20 rounded-[40px] border dark:border-slate-800">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/50">
              <th className="py-6 px-8 text-[10px] font-black uppercase text-slate-500 tracking-widest w-1/3">Descrição da Meta</th>
              <th className="py-6 px-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Status</th>
              <th className="py-6 px-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Data Alvo</th>
              <th className="py-6 px-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Contagem Regressiva</th>
              <th className="py-6 px-8 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categoryGoals.map((g: Goal) => {
              const daysLeft = calculateDaysLeft(g.dueDate);
              return (
                <tr key={g.id} className="border-b dark:border-slate-800/50 group hover:bg-white dark:hover:bg-slate-800 transition-all">
                  <td className="py-8 px-8">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${config.primary} bg-opacity-10 text-blue-600`}>
                        <Target size={20} className={config.text} />
                      </div>
                      <div>
                        <p className="font-black text-lg text-slate-800 dark:text-slate-100 tracking-tight">{g.title}</p>
                        {g.description && <p className="text-sm text-slate-400 mt-1 font-medium">{g.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-8 px-4 text-center">
                    <span className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-sm ${getStatusColor(g.status)}`}>
                      {g.status}
                    </span>
                  </td>
                  <td className="py-8 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <Calendar size={18} className="text-slate-300 mb-2" />
                      <span className="font-black text-sm text-slate-700 dark:text-slate-300">
                        {g.dueDate ? new Date(g.dueDate + 'T00:00:00').toLocaleDateString() : 'Não definida'}
                      </span>
                    </div>
                  </td>
                  <td className="py-8 px-4 text-center">
                    <div className={`flex flex-col items-center font-black ${daysLeft < 0 ? 'text-red-500' : daysLeft <= 3 ? 'text-amber-500' : 'text-blue-500'}`}>
                      <Timer size={20} className="mb-2" />
                      <span className="text-xs uppercase tracking-tighter">
                        {daysLeft < 0 ? `${Math.abs(daysLeft)}d atrasado` : daysLeft === 0 ? 'Expira hoje!' : `Faltam ${daysLeft} dias`}
                      </span>
                    </div>
                  </td>
                  <td className="py-8 px-8 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => { setEditingGoal(g); setFormData({title: g.title, dueDate: g.dueDate, description: g.description, status: g.status}); setIsModalOpen(true); }} 
                        className="p-3 text-slate-400 hover:text-blue-500 transition-all bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => deleteGoal(g.id)} 
                        className="p-3 text-slate-400 hover:text-red-500 transition-all bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {categoryGoals.length === 0 && (
          <div className="py-24 text-center text-slate-300 dark:text-slate-700">
            <div className="w-20 h-20 rounded-[32px] bg-slate-50 dark:bg-slate-800 mx-auto flex items-center justify-center mb-6">
              <Target size={40} className="opacity-20" />
            </div>
            <p className="font-black uppercase text-xs tracking-[0.2em]">Nenhuma meta ativa nesta área</p>
            <p className="text-sm font-medium mt-2 text-slate-400">Clique em "Definir Meta" para começar sua jornada.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-lg p-12 rounded-[56px] border shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black tracking-tight uppercase">{editingGoal ? 'Editar Meta' : 'Definir Nova Meta'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"><X size={28} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Descrição da Meta</label>
                <input type="text" required placeholder="O que deseja alcançar?" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 font-black text-lg outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Data Alvo</label>
                  <input type="date" required value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 font-bold outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Status</label>
                  <div className="relative">
                    <select 
                      value={formData.status} 
                      onChange={e => setFormData({...formData, status: e.target.value as GoalStatus})} 
                      className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 font-black text-xs uppercase tracking-widest outline-none appearance-none pr-12"
                    >
                      <option value="pendente">Pendente</option>
                      <option value="concluída">Concluída</option>
                      <option value="inconclusa">Inconclusa</option>
                      <option value="parcialmente concluída">Parcialmente Concluída</option>
                    </select>
                    <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Notas Adicionais (Opcional)</label>
                <textarea placeholder="Detalhes ou passos intermediários..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full min-h-[120px] p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 font-medium outline-none resize-none leading-relaxed" />
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 font-black text-xs uppercase tracking-widest rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-500">Cancelar</button>
                <button type="submit" className={`flex-1 py-5 font-black text-xs uppercase tracking-widest rounded-3xl text-white shadow-xl transition-all active:scale-95 ${config.primary}`}>
                  {editingGoal ? 'Salvar Alterações' : 'Ativar Meta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const NotebookModule = ({ notebooks, setNotebooks, theme, categoryId, language }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNB, setEditingNB] = useState<Notebook | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const config = THEME_CONFIG[theme];
  const isDark = theme === 'night';
  const categoryNotebooks = notebooks.filter((nb: Notebook) => !nb.deletedAt && nb.categoryId === categoryId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNB) {
      setNotebooks((prev: Notebook[]) => prev.map((nb: Notebook) => nb.id === editingNB.id ? { ...nb, ...formData } : nb));
    } else {
      const newNB: Notebook = {
        id: Date.now().toString(),
        categoryId,
        ...formData
      };
      setNotebooks((prev: Notebook[]) => [newNB, ...prev]);
    }
    setIsModalOpen(false);
    setEditingNB(null);
  };

  const deleteNB = (id: string) => {
    setNotebooks((prev: Notebook[]) => prev.map(nb => nb.id === id ? { ...nb, deletedAt: new Date() } : nb));
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-3xl font-black tracking-tight">Seus Cadernos</h3>
          <p className="text-slate-400 text-sm mt-1 font-medium">Anote ideias complexas e projetos</p>
        </div>
        <button 
          onClick={() => { setFormData({title: '', content: ''}); setEditingNB(null); setIsModalOpen(true); }} 
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-black uppercase text-xs shadow-xl transition-all active:scale-95 ${config.primary}`}
        >
          <Plus size={20} /> Novo Caderno
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categoryNotebooks.map((nb: Notebook) => (
          <div 
            key={nb.id} 
            onClick={() => { setEditingNB(nb); setFormData({title: nb.title, content: nb.content}); setIsModalOpen(true); }}
            className={`p-8 rounded-[40px] border cursor-pointer transition-all group flex flex-col justify-between min-h-[220px] ${isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-100 shadow-lg shadow-slate-200/40 hover:shadow-2xl'}`}
          >
            <div className="flex flex-col gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${config.primary} bg-opacity-10 ${config.text}`}>
                <BookOpen size={24} />
              </div>
              <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">{nb.title}</h4>
              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-medium">
                {nb.content ? nb.content.replace(/<[^>]*>?/gm, '') : 'Nenhum conteúdo ainda...'}
              </p>
            </div>
            <div className="flex justify-end gap-2 mt-6 opacity-0 group-hover:opacity-100 transition-all">
              <button 
                onClick={(e) => { e.stopPropagation(); deleteNB(nb.id); }} 
                className="p-3 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-800 rounded-xl shadow-sm"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {categoryNotebooks.length === 0 && (
        <div className="py-24 text-center text-slate-300 dark:text-slate-700">
          <div className="w-20 h-20 rounded-[32px] bg-slate-50 dark:bg-slate-800 mx-auto flex items-center justify-center mb-6">
            <Book size={40} className="opacity-20" />
          </div>
          <p className="font-black uppercase text-xs tracking-[0.2em]">Sua biblioteca está vazia</p>
          <p className="text-sm font-medium mt-2 text-slate-400">Comece a documentar seus pensamentos agora.</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className={`w-full max-w-4xl h-[90vh] flex flex-col rounded-[56px] border shadow-2xl overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100'}`}>
            <div className="p-10 border-b dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-4 flex-1 mr-8">
                <div className={`p-3 rounded-2xl ${config.primary} bg-opacity-10 ${config.text}`}>
                  <BookOpen size={24} />
                </div>
                <input 
                  type="text" 
                  autoFocus
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Título do Caderno"
                  className="bg-transparent border-none outline-none text-3xl font-black tracking-tight w-full placeholder:text-slate-200"
                />
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"><X size={28} /></button>
            </div>
            
            <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
              <textarea 
                value={formData.content} 
                onChange={e => setFormData({...formData, content: e.target.value})}
                placeholder="Escreva livremente aqui... Suas ideias ganham vida neste espaço."
                className="w-full h-full bg-transparent border-none outline-none resize-none font-medium text-xl leading-loose placeholder:text-slate-200"
              />
            </div>

            <div className="p-10 border-t dark:border-slate-800 flex justify-end gap-4">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-8 py-4 font-black text-xs uppercase tracking-widest rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-500"
              >
                Descartar
              </button>
              <button 
                onClick={handleSubmit} 
                className={`px-10 py-4 font-black text-xs uppercase tracking-widest rounded-3xl text-white shadow-xl flex items-center gap-3 transition-all active:scale-95 ${config.primary}`}
              >
                <Save size={18} /> Salvar Caderno
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BibleModule = ({ theme }: { theme: AppTheme }) => {
  const [selectedBook, setSelectedBook] = useState("Salmos");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [bibleContent, setBibleContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [bibleSearch, setBibleSearch] = useState("");
  const config = THEME_CONFIG[theme];
  const isDark = theme === 'night';

  const otBooks = [
    "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio", "Josué", "Juízes", "Rute",
    "1 Samuel", "2 Samuel", "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras", "Neemias",
    "Ester", "Jó", "Salmos", "Provérbios", "Eclesiastes", "Cantares", "Isaías", "Jeremias",
    "Lamentações", "Ezequiel", "Daniel", "Oseias", "Joel", "Amós", "Obadias", "Jonas",
    "Miqueias", "Naum", "Habacuque", "Sofonias", "Ageu", "Zacarias", "Malaquias"
  ];

  const ntBooks = [
    "Mateus", "Marcos", "Lucas", "João", "Atos", "Romanos", "1 Coríntios", "2 Coríntios",
    "Gálatas", "Efésios", "Filipenses", "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses",
    "1 Timóteo", "2 Timóteo", "Tito", "Filemom", "Hebreus", "Tiago", "1 Pedro", "2 Pedro",
    "1 João", "2 João", "3 João", "Judas", "Apocalipse"
  ];

  const fetchBibleContent = async (book: string, chapter: number) => {
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Forneça o texto completo da Bíblia Sagrada na versão NVI (Nova Versão Internacional) em Português para o livro: ${book}, Capítulo: ${chapter}. Formate cada versículo com o número em negrito no início. Retorne apenas o texto bíblico.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      setBibleContent(response.text || "Conteúdo não disponível.");
    } catch (err) {
      setBibleContent("Erro ao carregar o texto bíblico. Verifique sua conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBibleContent(selectedBook, selectedChapter);
  }, [selectedBook, selectedChapter]);

  const handleBibleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = bibleSearch.trim();
    if (!query) return;

    const parts = query.split(' ');
    let bookPart = parts[0];
    let chapterPart = parts[1];
    
    if (['1', '2', '3'].includes(parts[0])) {
      bookPart = `${parts[0]} ${parts[1]}`;
      chapterPart = parts[2];
    }

    const allBooks = [...otBooks, ...ntBooks];
    const foundBook = allBooks.find(b => b.toLowerCase().includes(bookPart.toLowerCase()));
    
    if (foundBook) {
      setSelectedBook(foundBook);
      if (chapterPart) {
        const c = parseInt(chapterPart.split(':')[0]);
        if (!isNaN(c)) setSelectedChapter(c);
      } else {
        setSelectedChapter(1);
      }
      setBibleSearch("");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[75vh] animate-in fade-in duration-500">
      <div className={`lg:col-span-3 overflow-y-auto pr-4 custom-scrollbar space-y-8 text-left ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
        <div>
          <form onSubmit={handleBibleSearch} className="mb-8 sticky top-0 bg-inherit pt-1 z-10">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Ex: João 3 ou Salmos 23" 
                value={bibleSearch}
                onChange={(e) => setBibleSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none border-2 transition-all ${isDark ? 'bg-slate-800 border-slate-700 focus:border-blue-500' : 'bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 shadow-inner'}`} 
              />
            </div>
          </form>

          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 px-2">Antigo Testamento</p>
          <div className="space-y-1">
            {otBooks.map(b => (
              <button 
                key={b} 
                onClick={() => { setSelectedBook(b); setSelectedChapter(1); }} 
                className={`w-full text-left px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedBook === b ? `${config.primary} text-white shadow-lg` : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 px-2">Novo Testamento</p>
          <div className="space-y-1">
            {ntBooks.map(b => (
              <button 
                key={b} 
                onClick={() => { setSelectedBook(b); setSelectedChapter(1); }} 
                className={`w-full text-left px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedBook === b ? `${config.primary} text-white shadow-lg` : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`lg:col-span-9 rounded-[48px] overflow-hidden flex flex-col border transition-all ${isDark ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-slate-50 border-slate-100 shadow-inner'}`}>
        <header className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${config.primary} text-white shadow-xl`}>
              <Book size={24} />
            </div>
            <div className="text-left">
              <h4 className="text-2xl font-black tracking-tight">{selectedBook} {selectedChapter}</h4>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Versão NVI (Português)</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
              <button onClick={() => setSelectedChapter(prev => Math.max(1, prev - 1))} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all text-slate-500"><ChevronLeft size={18}/></button>
              <span className="px-4 text-xs font-black text-slate-700 dark:text-slate-200">Cap. {selectedChapter}</span>
              <button onClick={() => setSelectedChapter(prev => prev + 1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all text-slate-500"><ChevronRight size={18}/></button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar text-left relative">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
              <Loader2 className={`animate-spin ${config.text}`} size={48} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Recuperando Escrituras...</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
              <div className="prose prose-lg dark:prose-invert">
                <p className="text-xl lg:text-2xl leading-[2.2] text-slate-700 dark:text-slate-200 font-medium whitespace-pre-wrap">
                  {bibleContent}
                </p>
              </div>
              <div className="mt-20 pt-10 border-t dark:border-slate-800 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                <div className="flex gap-6">
                   <button onClick={() => navigator.clipboard.writeText(`${selectedBook} ${selectedChapter}\n\n${bibleContent}`)} className="flex items-center gap-2 hover:text-blue-500 transition-colors"><Bookmark size={14}/> Copiar Capítulo</button>
                   <button className="flex items-center gap-2 hover:text-blue-500 transition-colors"><MessageSquare size={14}/> Meditar</button>
                </div>
                <p>My. Bible Sync • Gemini Flash</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneralCategory;
