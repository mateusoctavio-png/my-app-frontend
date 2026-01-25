
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppTheme, AppLanguage, User, Task, QuickNote, ImportantDate, Priority, Goal } from '../types';
import { THEME_CONFIG, TRANSLATIONS } from '../constants';
import { 
  Bell, Search, Plus, Calendar as CalendarIcon, 
  Clock, CheckCircle, Target, Trash2, Send, X, Edit2, Search as SearchIcon,
  Settings2, AlertCircle, ChevronDown, CalendarDays, Save, RefreshCw, CalendarCheck,
  Star, History, Megaphone, FileText, Book, Wallet, ArrowUpRight, Camera,
  Check, BellOff, Timer, Flag
} from 'lucide-react';
import OverviewCharts from './OverviewCharts';
import Pomodoro from './Pomodoro';

interface DashboardProps {
  theme: AppTheme;
  language: AppLanguage;
  user: User | null;
  tasks: Task[];
  setTasks: (update: any) => void;
  importantDates: ImportantDate[];
  setImportantDates: (update: any) => void;
  quickNotes: QuickNote[];
  setQuickNotes: (update: any) => void;
  allGoals: Goal[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: any[];
  setCurrentView: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  theme, language, user, tasks, setTasks, 
  importantDates, setImportantDates, quickNotes, setQuickNotes, allGoals,
  searchQuery, setSearchQuery, searchResults, setCurrentView
}) => {
  const t = TRANSLATIONS[language];
  const config = THEME_CONFIG[theme];
  const isDark = theme === 'night';
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const [quote, setQuote] = useState(t.defaultQuote);
  const [bgImage, setBgImage] = useState('https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1200');
  const [isEditingHero, setIsEditingHero] = useState(false);
  const [heroFormData, setHeroFormData] = useState({ quote: '', bgImage: '' });

  const [quickTaskInput, setQuickTaskInput] = useState('');
  
  const [showAddDate, setShowAddDate] = useState(false);
  const [editingDateObj, setEditingDateObj] = useState<ImportantDate | null>(null);
  const [newDateForm, setNewDateForm] = useState({ title: '', date: '', isRecurring: false });
  const [dateSearchTerm, setDateSearchTerm] = useState('');
  const [isSearchingDates, setIsSearchingDates] = useState(false);
  
  const [noteInput, setNoteInput] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  
  const getTodayISO = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
  const [consultingDate, setConsultingDate] = useState<string>(getTodayISO());
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [tempDate, setTempDate] = useState('');

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fechar notificações ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // Persistência da frase e fundo
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`my_app_hero_${user.email}`);
      if (saved) {
        const { quote: sQuote, bgImage: sBg } = JSON.parse(saved);
        if (sQuote) setQuote(sQuote);
        if (sBg) setBgImage(sBg);
      }
    }
  }, [user]);

  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    setQuote(heroFormData.quote);
    setBgImage(heroFormData.bgImage);
    if (user) {
      localStorage.setItem(`my_app_hero_${user.email}`, JSON.stringify(heroFormData));
    }
    setIsEditingHero(false);
  };

  const categories = [
    'work', 'college', 'reading', 'training', 'media', 'finances', 
    'goals', 'diet', 'health', 'leisure', 'marriage', 'relationship',
    'ideas', 'travel', 'studies', 'devotional', 'commitments'
  ];

  const handleResultClick = (item: any) => {
    if (item.categoryId) {
      setCurrentView(item.categoryId);
    }
    setSearchQuery('');
  };

  const getResultIcon = (type: string) => {
    switch(type) {
      case 'task': return CheckCircle;
      case 'date': return CalendarIcon;
      case 'note': return FileText;
      case 'goal': return Target;
      case 'notebook': return Book;
      case 'expense': return Wallet;
      default: return Search;
    }
  };

  const handleAddQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    const title = quickTaskInput.trim();
    if (!title) return;
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      categoryId: 'commitments',
      priority: 'medium',
      dueDate: getTodayISO(),
      completed: false
    };
    setTasks((prev: Task[]) => [newTask, ...prev]);
    setQuickTaskInput('');
  };

  const filteredTasks = useMemo(() => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const todayISO = getTodayISO();
    return tasks
      .filter(t => !t.deletedAt)
      .filter(t => {
        if (consultingDate === todayISO) {
          return t.dueDate === todayISO || (t.dueDate < todayISO && !t.completed);
        }
        return t.dueDate === consultingDate;
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  }, [tasks, consultingDate]);

  const toggleTask = (id: string) => {
    setTasks((prev: Task[]) => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks((prev: Task[]) => prev.map(t => t.id === id ? { ...t, deletedAt: new Date() } : t));
  };

  const saveEditedTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      setTasks((prev: Task[]) => prev.map(t => t.id === editingTask.id ? editingTask : t));
      setEditingTask(null);
    }
  };

  const handleSaveImportantDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDateForm.title && newDateForm.date) {
      if (editingDateObj) {
        setImportantDates((prev: ImportantDate[]) => prev.map(d => d.id === editingDateObj.id ? { ...d, ...newDateForm } : d));
      } else {
        const newDate: ImportantDate = {
          id: Date.now().toString(),
          title: newDateForm.title,
          date: newDateForm.date,
          isRecurring: newDateForm.isRecurring
        };
        setImportantDates((prev: ImportantDate[]) => [...prev, newDate]);
      }
      setNewDateForm({ title: '', date: '', isRecurring: false });
      setEditingDateObj(null);
      setShowAddDate(false);
    }
  };

  const handleEditImportantDate = (date: ImportantDate) => {
    setEditingDateObj(date);
    setNewDateForm({ title: date.title, date: date.date, isRecurring: !!date.isRecurring });
    setShowAddDate(true);
  };

  const handleSaveQuickNote = () => {
    if (!noteInput.trim()) return;
    if (editingNoteId) {
      setQuickNotes((prev: QuickNote[]) => prev.map(n => n.id === editingNoteId ? { ...n, content: noteInput } : n));
      setEditingNoteId(null);
    } else {
      const newNote: QuickNote = {
        id: Date.now().toString(),
        content: noteInput,
        color: 'bg-yellow-100 dark:bg-yellow-900/40'
      };
      setQuickNotes((prev: QuickNote[]) => [newNote, ...prev]);
    }
    setNoteInput('');
  };

  const handleEditNote = (note: QuickNote) => {
    setNoteInput(note.content);
    setEditingNoteId(note.id);
  };

  const formatDisplayDate = (isoDate: string) => {
    const todayStr = getTodayISO();
    if (isoDate === todayStr) return "Hoje";
    const tomorrow = new Date(todayStr + 'T12:00:00');
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
    if (isoDate === tomorrowStr) return "Amanhã";
    const date = new Date(isoDate + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const sortedImportantDates = useMemo(() => {
    const todayStr = getTodayISO();
    const now = new Date(todayStr + 'T12:00:00');
    const todayMs = now.getTime();
    
    const minDate = new Date(todayStr + 'T12:00:00');
    minDate.setDate(now.getDate() - 5);
    
    const maxDate = new Date(todayStr + 'T12:00:00');
    maxDate.setDate(now.getDate() + (dateSearchTerm ? 365 : 15));

    return importantDates
      .map(d => {
        let eventDate = new Date(d.date + 'T12:00:00');
        if (d.isRecurring) {
          eventDate.setFullYear(now.getFullYear());
          if (eventDate.getTime() < minDate.getTime() && now.getMonth() === 0 && eventDate.getMonth() === 11) {
             eventDate.setFullYear(now.getFullYear() - 1);
          } else if (eventDate.getTime() > maxDate.getTime() && now.getMonth() === 11 && eventDate.getMonth() === 0) {
             eventDate.setFullYear(now.getFullYear() + 1);
          }
        }
        const diffDays = Math.round((eventDate.getTime() - todayMs) / (1000 * 60 * 60 * 24));
        const absDiff = Math.abs(diffDays);
        return { ...d, _dateObj: eventDate, _diffDays: diffDays, _absDiff: absDiff };
      })
      .filter(d => {
        const matchesDateRange = d._dateObj >= minDate && d._dateObj <= maxDate;
        const matchesSearch = d.title.toLowerCase().includes(dateSearchTerm.toLowerCase());
        return matchesDateRange && matchesSearch;
      })
      .sort((a, b) => {
        if (a._absDiff !== b._absDiff) return a._absDiff - b._absDiff;
        return b._diffDays - a._diffDays;
      });
  }, [importantDates, dateSearchTerm]);

  const activeNotifications = useMemo(() => {
    const todayStr = getTodayISO();
    const overdueTasks = tasks.filter(t => !t.completed && !t.deletedAt && t.dueDate < todayStr);
    const todayImportantDates = sortedImportantDates.filter(d => d._diffDays === 0);
    return { overdueTasks, todayImportantDates, total: overdueTasks.length + todayImportantDates.length };
  }, [tasks, sortedImportantDates]);

  const calculateDaysLeft = (dueDate: string) => {
    if (!dueDate) return 0;
    const target = new Date(dueDate + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const activeGoals = useMemo(() => {
    return allGoals.filter(g => !g.deletedAt).sort((a, b) => {
      const daysA = calculateDaysLeft(a.dueDate);
      const daysB = calculateDaysLeft(b.dueDate);
      return daysA - daysB;
    });
  }, [allGoals]);

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      <header className={`sticky top-0 z-[100] flex items-center justify-between px-8 py-5 backdrop-blur-xl border-b transition-all ${isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-100'}`}>
        <div className="flex items-center gap-4 flex-1 max-w-xl relative">
          <div className="relative w-full group text-left">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar tarefas ou datas importantes..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className={`w-full pl-12 pr-4 py-3 rounded-2xl text-sm transition-all outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-white focus:ring-4 ring-blue-500/10' : 'bg-slate-100 border-transparent focus:bg-white focus:ring-4 ring-blue-500/10 shadow-inner'}`} 
            />
          </div>

          {searchQuery.trim() && (
            <div ref={searchResultsRef} className={`absolute top-full left-0 right-0 mt-4 p-6 rounded-[32px] border shadow-2xl animate-in slide-in-from-top-4 duration-300 max-h-[60vh] overflow-y-auto custom-scrollbar z-[110] ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="flex justify-between items-center mb-6 px-2">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Encontrados {searchResults.length} resultados</p>
                <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X size={14} /></button>
              </div>
              
              <div className="space-y-2">
                {searchResults.map((item) => {
                  const Icon = getResultIcon(item._type);
                  const catLabel = (t as any)[item.categoryId] || item.categoryId;
                  return (
                    <div 
                      key={`${item._type}-${item.id}`} 
                      onClick={() => handleResultClick(item)}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${isDark ? 'bg-slate-800/40 border-slate-700 hover:bg-slate-800 hover:border-blue-500/50' : 'bg-slate-50 border-transparent hover:bg-white hover:border-blue-500/50 shadow-sm'}`}
                    >
                      <div className="flex items-center gap-4 text-left min-w-0">
                        <div className={`p-2.5 rounded-xl ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-white text-slate-400 shadow-sm'}`}>
                          <Icon size={18} />
                        </div>
                        <div className="truncate">
                          <p className={`font-bold text-sm truncate ${item.completed ? 'line-through opacity-50' : ''}`}>{item.title}</p>
                          <p className="text-[9px] font-black uppercase text-blue-500 tracking-tighter mt-0.5">{catLabel} • {item._type === 'date' ? 'Data Importante' : 'Tarefa'}</p>
                        </div>
                      </div>
                      <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
                    </div>
                  );
                })}
                {searchResults.length === 0 && (
                  <div className="py-12 text-center">
                    <SearchIcon size={32} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                    <p className="text-slate-400 font-bold italic text-sm">Nenhum resultado para "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-3 rounded-2xl relative hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${activeNotifications.total > 0 ? config.text : 'text-slate-400'}`}
          >
            <Bell size={22} />
            {activeNotifications.total > 0 && (
              <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-slate-950 animate-bounce">
                {activeNotifications.total}
              </span>
            )}
          </button>

          {/* Modal de Notificações */}
          {showNotifications && (
            <div 
              ref={notificationRef}
              className={`absolute top-full right-0 mt-4 w-80 max-h-[400px] overflow-y-auto rounded-[32px] border shadow-2xl animate-in slide-in-from-top-2 duration-300 z-[120] p-6 custom-scrollbar ${isDark ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-100'}`}
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-black uppercase tracking-widest">Avisos Importantes</h4>
                <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-red-500"><X size={16} /></button>
              </div>

              {activeNotifications.total === 0 ? (
                <div className="py-8 text-center">
                  <BellOff size={32} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                  <p className="text-xs font-bold text-slate-400 italic">Nenhum aviso urgente no momento.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Tarefas Atrasadas */}
                  {activeNotifications.overdueTasks.map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => { setCurrentView(task.categoryId); setShowNotifications(false); }}
                      className={`p-4 rounded-2xl border bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20 group cursor-pointer transition-all hover:scale-[1.02]`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle className="text-red-500 shrink-0" size={16} />
                        <div>
                          <p className="text-xs font-black text-red-600 dark:text-red-400 leading-tight">Tarefa Atrasada</p>
                          <p className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-200">{task.title}</p>
                          <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-tighter">Venceu em {formatDisplayDate(task.dueDate)}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Datas de Hoje */}
                  {activeNotifications.todayImportantDates.map(date => (
                    <div 
                      key={date.id} 
                      onClick={() => setShowNotifications(false)}
                      className={`p-4 rounded-2xl border bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20 group cursor-pointer transition-all hover:scale-[1.02]`}
                    >
                      <div className="flex items-start gap-3">
                        <Star className="text-blue-500 shrink-0" size={16} fill="currentColor" />
                        <div>
                          <p className="text-xs font-black text-blue-600 dark:text-blue-400 leading-tight">Evento Hoje</p>
                          <p className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-200">{date.title}</p>
                          <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-tighter">Ocorrendo agora</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 pl-6 border-l dark:border-slate-800">
            <div className={`h-10 w-10 rounded-2xl ${config.primary} flex items-center justify-center text-white font-black text-lg shadow-xl shadow-blue-500/20`}>{user?.nickname.charAt(0).toUpperCase()}</div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-black tracking-tight leading-none">{user?.nickname}</p>
              <p className={`text-[10px] font-black mt-1 uppercase tracking-tighter ${user?.subscriptionPlan ? 'text-amber-500' : 'text-slate-400'}`}>{user?.subscriptionPlan ? "Premium" : "7 Dias de Teste"}</p>
            </div>
          </div>
        </div>
      </header>

      <section className="relative h-80 mx-8 mt-10 rounded-[48px] overflow-hidden group shadow-2xl shadow-blue-500/20">
        <img src={bgImage} alt="Hero" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]" />
        
        {/* Botão de Edição do Banner */}
        <button 
          onClick={() => {
            setHeroFormData({ quote, bgImage });
            setIsEditingHero(true);
          }}
          className="absolute top-6 right-8 p-3 rounded-2xl bg-black/20 backdrop-blur-md text-white/70 opacity-0 group-hover:opacity-100 hover:bg-black/40 hover:text-white transition-all z-20"
          title="Customizar Banner"
        >
          <Settings2 size={22} />
        </button>

        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center px-16">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter animate-in slide-in-from-left-6 duration-700 leading-tight text-left">{t.mainTitle}</h1>
          <div className="mt-8 flex items-center gap-6">
            <div className={`w-1 bg-white/30 h-12 rounded-full`}></div>
            <p className="text-white/90 italic text-2xl max-w-2xl font-medium tracking-tight leading-relaxed text-left">"{quote}"</p>
          </div>
        </div>
      </section>

      {/* Modal de Edição do Hero */}
      {isEditingHero && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`w-full max-w-lg p-12 rounded-[48px] border shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black tracking-tight uppercase text-left">Customizar Hero</h3>
              <button onClick={() => setIsEditingHero(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"><X size={28} /></button>
            </div>
            <form onSubmit={handleSaveHero} className="space-y-6">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Frase Motivacional</label>
                <textarea 
                  value={heroFormData.quote} 
                  onChange={e => setHeroFormData({...heroFormData, quote: e.target.value})} 
                  placeholder="Sua frase aqui..."
                  className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 outline-none font-bold text-lg min-h-[120px] resize-none" 
                />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">URL da Imagem de Fundo</label>
                <div className="relative">
                  <Camera className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={heroFormData.bgImage} 
                    onChange={e => setHeroFormData({...heroFormData, bgImage: e.target.value})} 
                    placeholder="https://images.unsplash.com/..."
                    className="w-full pl-14 pr-5 py-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 outline-none font-bold" 
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsEditingHero(false)} className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500">Cancelar</button>
                <button type="submit" className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest rounded-2xl text-white shadow-xl ${config.primary}`}>Salvar Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-8 mt-12">
        <div className="lg:col-span-8 space-y-10">
          <div className={`rounded-[40px] p-10 border transition-all ${isDark ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
              <div>
                <h3 className="text-3xl font-black flex items-center gap-4 text-left"><Target className={config.text} size={32} /> {t.priorities}</h3>
                <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest text-left">Compromissos Agendados</p>
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded-[24px] bg-slate-100 dark:bg-slate-800">
                <button 
                  onClick={() => setConsultingDate(getTodayISO())} 
                  className={`px-6 py-2.5 text-[10px] font-black uppercase rounded-2xl transition-all ${consultingDate === getTodayISO() ? 'bg-white dark:bg-slate-700 shadow-xl text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Hoje
                </button>
                <button 
                  onClick={() => {
                    const tom = new Date(getTodayISO() + 'T12:00:00');
                    tom.setDate(tom.getDate() + 1);
                    setConsultingDate(tom.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' }));
                  }} 
                  className={`px-6 py-2.5 text-[10px] font-black uppercase rounded-2xl transition-all ${consultingDate !== getTodayISO() ? 'bg-white dark:bg-slate-700 shadow-xl text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Próximos
                </button>
                <div className="relative">
                  <button onClick={() => setShowCustomPicker(!showCustomPicker)} className={`px-6 py-2.5 text-[10px] font-black uppercase rounded-2xl transition-all flex items-center gap-3 ${![getTodayISO(), new Date(new Date(getTodayISO() + 'T12:00:00').setDate(new Date(getTodayISO() + 'T12:00:00').getDate() + 1)).toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' })].includes(consultingDate) ? 'bg-white dark:bg-slate-700 shadow-xl text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}><CalendarIcon size={14} /> Escolher</button>
                  {showCustomPicker && (
                    <div className="absolute right-0 top-full mt-4 z-50 p-6 bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-2xl rounded-[32px] w-72">
                      <input 
                        type="date" 
                        className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 mb-6 font-bold" 
                        value={tempDate} 
                        onChange={(e) => setTempDate(e.target.value)} 
                      />
                      <button onClick={() => { setConsultingDate(tempDate); setShowCustomPicker(false); }} className={`w-full py-3 rounded-2xl text-white text-[10px] font-black uppercase shadow-xl ${config.primary}`}>Consultar</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <form onSubmit={handleAddQuickTask} className="mb-12">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="O que você precisa fazer hoje?" 
                  value={quickTaskInput} 
                  onChange={(e) => setQuickTaskInput(e.target.value)} 
                  className={`w-full pl-8 pr-16 py-5 rounded-[28px] text-sm border-2 outline-none transition-all font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500 focus:bg-slate-950' : 'bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 shadow-inner'}`} 
                />
                <button type="submit" className={`absolute right-3 top-1/2 -translate-y-1/2 p-3.5 rounded-2xl text-white shadow-2xl transition-all active:scale-90 hover:brightness-110 ${config.primary}`}><Plus size={24} /></button>
              </div>
            </form>

            <div className="space-y-5">
              {filteredTasks.map(task => {
                const isOverdue = task.dueDate < getTodayISO() && !task.completed;
                const categoryLabel = (t as any)[task.categoryId] || task.categoryId;
                return (
                  <div key={task.id} className={`flex items-center justify-between p-7 rounded-[32px] border transition-all group ${task.completed ? 'opacity-40 grayscale blur-[0.5px]' : 'hover:shadow-2xl hover:-translate-y-1'} ${isDark ? 'bg-slate-800/40 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-transparent hover:bg-white shadow-sm'}`}>
                    <div className="flex items-center gap-8 text-left">
                      <button onClick={() => toggleTask(task.id)} className={`h-8 w-8 rounded-[12px] border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-green-500 border-green-500 text-white shadow-xl shadow-green-500/30' : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 hover:scale-110'}`}>{task.completed && <Check size={18} />}</button>
                      <div>
                        <h4 className={`font-black text-xl tracking-tight ${task.completed ? 'line-through text-slate-500' : ''}`}>
                          {task.title}
                          {isOverdue && <span className="ml-3 px-2 py-0.5 bg-red-100 text-red-600 text-[9px] uppercase font-black rounded-md inline-flex items-center gap-1"><AlertCircle size={10} /> Atrasada</span>}
                        </h4>
                        <div className="flex items-center gap-5 mt-3 text-[10px] font-black uppercase tracking-widest">
                          <span className={`${config.text} bg-white dark:bg-slate-700 px-3 py-1.5 rounded-xl shadow-sm`}>{categoryLabel}</span>
                          <span className={`${task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-amber-500' : 'text-blue-500'}`}>• {task.priority}</span>
                          <span className="text-slate-400 flex items-center gap-2"><Clock size={14} /> {formatDisplayDate(task.dueDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => setEditingTask(task)} className="p-3 text-slate-300 hover:text-blue-500 bg-white dark:bg-slate-700 rounded-2xl transition-all shadow-sm"><Edit2 size={20} /></button>
                      <button onClick={() => deleteTask(task.id)} className="p-3 text-slate-300 hover:text-red-500 bg-white dark:bg-slate-700 rounded-2xl transition-all shadow-sm"><Trash2 size={20} /></button>
                    </div>
                  </div>
                );
              })}
              {filteredTasks.length === 0 && (
                <div className="text-center py-20 border-4 border-dashed border-slate-50 dark:border-slate-800 rounded-[48px]">
                  <SearchIcon size={48} className="mx-auto text-slate-100 dark:text-slate-800 mb-6" />
                  <p className="text-slate-400 italic text-lg font-bold">Nada programado para este período.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className={`rounded-[40px] p-10 border transition-all ${isDark ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
            <h3 className="text-2xl font-black mb-12 flex items-center gap-4 text-left">{t.overview} <div className="h-1 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full"></div></h3>
            <OverviewCharts theme={theme} isDark={isDark} tasks={tasks.filter(t => !t.deletedAt)} />
          </div>

          {/* Painel de Metas - Novo Módulo */}
          <div className={`rounded-[40px] p-10 border transition-all ${isDark ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-black flex items-center gap-4 text-left"><Flag className={config.text} size={32} /> Painel de Metas</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Espelho de Objetivos</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeGoals.slice(0, 6).map(goal => {
                const daysLeft = calculateDaysLeft(goal.dueDate);
                const catLabel = (t as any)[goal.categoryId] || goal.categoryId;
                const statusColor = goal.status === 'concluída' ? 'bg-green-100 text-green-700' : 
                                  goal.status === 'pendente' ? 'bg-amber-100 text-amber-700' :
                                  goal.status === 'parcialmente concluída' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700';

                return (
                  <div key={goal.id} className={`p-6 rounded-[32px] border transition-all hover:scale-[1.02] ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2.5 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-white'} shadow-sm text-blue-500`}>
                        <Target size={20} />
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${statusColor}`}>
                        {goal.status}
                      </span>
                    </div>
                    <h4 className="font-black text-lg tracking-tight line-clamp-1">{goal.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1 mb-6">{catLabel}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t dark:border-slate-700/50">
                      <div className="flex items-center gap-2 text-slate-400">
                        <CalendarIcon size={14} />
                        <span className="text-[10px] font-black">{new Date(goal.dueDate + 'T00:00:00').toLocaleDateString()}</span>
                      </div>
                      <div className={`flex items-center gap-2 font-black ${daysLeft < 0 ? 'text-red-500' : daysLeft <= 7 ? 'text-amber-500' : 'text-blue-500'}`}>
                        <Timer size={14} />
                        <span className="text-[10px] uppercase">{daysLeft < 0 ? 'Atrasado' : `${daysLeft} dias`}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {activeGoals.length === 0 && (
                <div className="col-span-full py-16 text-center border-4 border-dashed border-slate-50 dark:border-slate-800 rounded-[48px]">
                  <Flag size={40} className="mx-auto text-slate-100 dark:text-slate-800 mb-4 opacity-50" />
                  <p className="text-slate-400 font-bold italic">Nenhuma meta ativa cadastrada nas categorias.</p>
                </div>
              )}
            </div>
            
            {activeGoals.length > 6 && (
              <button 
                onClick={() => setCurrentView('goals')}
                className="w-full mt-10 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-500 transition-colors border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl"
              >
                Ver todas as {activeGoals.length} metas lançadas
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div className={`rounded-[40px] p-8 border transition-all relative ${isDark ? 'bg-slate-900 border-slate-800 shadow-inner' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black flex items-center gap-4 text-left"><CalendarIcon className={config.text} size={28} /> {t.importantDates}</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsSearchingDates(!isSearchingDates)} 
                  className={`p-3 rounded-2xl transition-all shadow-sm ${isSearchingDates ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                >
                  <Search size={18} />
                </button>
                <button 
                  onClick={() => {
                    setEditingDateObj(null);
                    setNewDateForm({ title: '', date: '', isRecurring: false });
                    setShowAddDate(true);
                  }} 
                  className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-slate-200 transition-all shadow-sm"
                >
                  <Plus size={22} />
                </button>
              </div>
            </div>

            {isSearchingDates && (
              <div className="mb-8 animate-in slide-in-from-top-2">
                 <input 
                  autoFocus
                  type="text" 
                  placeholder="Pesquisar datas (ex: Aniversário)..." 
                  value={dateSearchTerm} 
                  onChange={(e) => setDateSearchTerm(e.target.value)} 
                  className={`w-full p-4 rounded-2xl text-xs font-bold border-2 outline-none transition-all ${isDark ? 'bg-slate-900 border-slate-700 focus:border-blue-500' : 'bg-slate-50 border-transparent focus:border-blue-500'}`} 
                />
              </div>
            )}

            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
              {sortedImportantDates.map(d => {
                const isToday = d._diffDays === 0;
                const isTomorrow = d._diffDays === 1;
                const isPast = d._diffDays < 0;
                const isNextMonth = d._diffDays >= 28 && d._diffDays <= 60;

                return (
                  <div key={d.id} className={`flex items-center gap-6 group hover:translate-x-1 transition-all p-4 rounded-3xl ${isToday ? 'bg-blue-50 dark:bg-blue-900/10 ring-2 ring-blue-500/20' : ''}`}>
                    <div className={`w-16 h-16 rounded-[20px] flex flex-col items-center justify-center font-black border-2 transition-all shadow-md relative ${isToday ? 'bg-blue-500 text-white border-transparent' : 'bg-slate-100 dark:bg-slate-800 border-transparent group-hover:border-blue-500'}`}>
                      <span className={`text-2xl leading-none ${isToday ? 'text-white' : config.text}`}>{d._dateObj.getDate()}</span>
                      <span className={`text-[10px] uppercase mt-1.5 tracking-tighter flex items-center gap-1 ${isToday ? 'text-white/80' : 'text-slate-500'}`}>
                        {d._dateObj.toLocaleString('pt-BR', {month: 'short'}).replace('.', '')}
                        {d.isRecurring && <RefreshCw size={8} className={isToday ? 'text-white' : 'text-blue-500'} />}
                      </span>
                      {isToday && <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white p-1 rounded-full animate-pulse shadow-lg"><Star size={8} fill="currentColor"/></div>}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className={`text-base font-black truncate ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-100'}`}>{d.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {isToday ? (
                          <span className="text-[9px] font-black uppercase text-red-500 animate-pulse tracking-widest">Acontece Hoje</span>
                        ) : isTomorrow ? (
                          <span className="text-[9px] font-black uppercase text-amber-500 tracking-widest">Amanhã</span>
                        ) : isPast ? (
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1"><History size={10} /> Ocorreu há {Math.abs(d._diffDays)}d</span>
                        ) : isNextMonth ? (
                          <span className="text-[9px] font-black uppercase text-blue-400 tracking-widest">No Mês Que Vem</span>
                        ) : d._diffDays > 60 ? (
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Em {Math.floor(d._diffDays / 30)} Meses</span>
                        ) : (
                          <span className="text-[9px] font-black uppercase text-blue-500 tracking-widest">Em {d._diffDays} dias</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                      <button 
                        onClick={() => handleEditImportantDate(d)} 
                        className="p-3 text-slate-400 hover:text-blue-500 transition-all bg-slate-50 dark:bg-slate-800 rounded-xl"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {sortedImportantDates.length === 0 && (
                <div className="text-center py-10 animate-in fade-in">
                  <p className="text-slate-400 font-bold italic text-sm">Nenhum evento encontrado.</p>
                  {dateSearchTerm && <button onClick={() => setDateSearchTerm('')} className="text-[10px] font-black text-blue-500 mt-2 uppercase underline">Limpar busca</button>}
                </div>
              )}
            </div>
          </div>

          <Pomodoro theme={theme} isDark={isDark} />

          <div className={`rounded-[40px] p-8 border transition-all ${isDark ? 'bg-slate-900 border-slate-800 shadow-none' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
            <h3 className="text-xl font-black mb-10 flex items-center justify-between text-left">{t.notepad} <Plus size={26} className="text-slate-200" /></h3>
            <div className="relative mb-10">
              <textarea 
                placeholder="Pensamento rápido..." 
                className={`w-full min-h-[160px] p-8 rounded-[40px] text-base font-bold outline-none transition-all resize-none leading-relaxed text-left ${isDark ? 'bg-slate-800 text-slate-300 border-slate-700 focus:ring-8 ring-blue-500/5' : 'bg-slate-50 border-transparent focus:bg-white focus:ring-8 ring-blue-500/5 shadow-inner'}`} 
                value={noteInput} 
                onChange={e => setNoteInput(e.target.value)} 
              />
              <button 
                onClick={handleSaveQuickNote} 
                className={`absolute bottom-6 right-6 p-4 rounded-[20px] text-white shadow-2xl transition-all active:scale-95 hover:brightness-110 ${config.primary}`}
              >
                {editingNoteId ? <Save size={24} /> : <Send size={24} />}
              </button>
              {editingNoteId && (
                <button 
                  onClick={() => { setEditingNoteId(null); setNoteInput(''); }}
                  className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl shadow-lg hover:scale-105 transition-all"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {quickNotes.map(note => (
                <div key={note.id} className={`p-5 rounded-[24px] border transition-all group relative text-left ${isDark ? 'bg-slate-800/40 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-transparent hover:bg-white hover:shadow-lg'}`}>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed pr-10">{note.content}</p>
                  <div className="flex items-center gap-2 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => handleEditNote(note)} className="p-2 text-slate-400 hover:text-blue-500 bg-white dark:bg-slate-700 rounded-xl shadow-sm border dark:border-slate-600"><Edit2 size={14} /></button>
                  </div>
                </div>
              ))}
              {quickNotes.length === 0 && (
                <p className="text-center text-slate-400 text-xs font-bold italic py-8">Nenhum lembrete rápido...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddDate && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`w-full max-w-md p-10 rounded-[48px] border shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 text-left">
                <CalendarDays className={config.text} size={28} /> {editingDateObj ? 'Editar Evento' : 'Novo Evento'}
              </h3>
              <button onClick={() => { setShowAddDate(false); setEditingDateObj(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveImportantDate} className="space-y-6">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Tipo de Compromisso</label>
                <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800">
                  <button 
                    type="button"
                    onClick={() => setNewDateForm({...newDateForm, isRecurring: false})}
                    className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${!newDateForm.isRecurring ? 'bg-white dark:bg-slate-700 shadow-md text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <CalendarCheck size={14} /> Único
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewDateForm({...newDateForm, isRecurring: true})}
                    className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${newDateForm.isRecurring ? 'bg-white dark:bg-slate-700 shadow-md text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <RefreshCw size={14} /> Fixo (Anual)
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Nome do Evento</label>
                <input 
                  type="text" 
                  required 
                  autoFocus
                  placeholder={newDateForm.isRecurring ? "Ex: Aniversário de Casamento" : "Ex: Reunião Importante"} 
                  value={newDateForm.title} 
                  onChange={e => setNewDateForm({...newDateForm, title: e.target.value})} 
                  className={`w-full p-5 rounded-2xl outline-none border-2 font-bold transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-transparent focus:bg-white focus:ring-4 ring-blue-500/10 shadow-inner'}`}
                />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Data Marcada</label>
                <input 
                  type="date" 
                  required 
                  value={newDateForm.date} 
                  onChange={e => setNewDateForm({...newDateForm, date: e.target.value})} 
                  className={`w-full p-5 rounded-2xl outline-none border-2 font-bold transition-all text-slate-900 dark:text-white ${isDark ? 'bg-slate-800 border-slate-700 focus:border-blue-500' : 'bg-slate-50 border-transparent focus:bg-white focus:ring-4 ring-blue-500/10 shadow-inner'}`}
                />
                {newDateForm.isRecurring && <p className="text-[9px] font-black uppercase text-blue-500 italic mt-2 ml-2 tracking-widest text-left">* Este evento será lembrado todos os anos nesta data.</p>}
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => { setShowAddDate(false); setEditingDateObj(null); }} className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">Cancelar</button>
                <button type="submit" className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest rounded-2xl text-white shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all ${config.primary}`}>
                  <Save size={18} /> {editingDateObj ? 'Salvar Alterações' : 'Salvar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`w-full max-w-lg p-12 rounded-[48px] border shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black tracking-tight uppercase text-left">Editar Tarefa</h3>
              <button onClick={() => setEditingTask(null)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"><X size={28} /></button>
            </div>
            <form onSubmit={saveEditedTask} className="space-y-6">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Título da Tarefa</label>
                <input type="text" value={editingTask.title} onChange={e => setEditingTask({...editingTask, title: e.target.value})} className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 outline-none font-bold text-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Categoria</label>
                  <div className="relative">
                    <select 
                      value={editingTask.categoryId} 
                      onChange={e => setEditingTask({...editingTask, categoryId: e.target.value})}
                      className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 outline-none font-bold appearance-none pr-10"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{(t as any)[cat] || cat}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Prioridade</label>
                  <div className="relative">
                    <select 
                      value={editingTask.priority} 
                      onChange={e => setEditingTask({...editingTask, priority: e.target.value as Priority})}
                      className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 outline-none font-bold appearance-none pr-10"
                    >
                      <option value="high">Alta</option>
                      <option value="medium">Média</option>
                      <option value="low">Baixa</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Data de Cumprimento</label>
                <input type="date" value={editingTask.dueDate} onChange={e => setEditingTask({...editingTask, dueDate: e.target.value})} className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 outline-none font-bold" />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setEditingTask(null)} className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500">Cancelar</button>
                <button type="submit" className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest rounded-2xl text-white shadow-xl ${config.primary}`}>Aplicar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
