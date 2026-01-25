
import React, { useMemo, useState } from 'react';
import { AppTheme, AppLanguage, User, CategoryItem } from '../types';
import { THEME_CONFIG, TRANSLATIONS } from '../constants';
import { 
  Home, Target, Briefcase, GraduationCap, BookOpen, Dumbbell, 
  Film, DollarSign, Utensils, Lightbulb, Map, Book, 
  Calendar, CheckCircle2, Info, Trash2, Menu, Settings, LogOut, Star, User as UserIcon,
  ChevronLeft, ChevronRight, Activity, Gamepad2, HeartHandshake, Users, LayoutGrid,
  ChevronDown, ChevronUp, Pin, PinOff, ArrowUp, ArrowDown
} from 'lucide-react';

interface SidebarProps {
  theme: AppTheme;
  language: AppLanguage;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  setTheme: (theme: AppTheme) => void;
  toggleLanguage: () => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  user: User | null;
  onLogout: () => void;
  categoryConfigs: CategoryItem[];
  setCategoryConfigs: (configs: CategoryItem[]) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  theme, language, isOpen, setIsOpen, setTheme, toggleLanguage, 
  currentView, setCurrentView, user, onLogout, categoryConfigs = [], setCategoryConfigs
}) => {
  const t = TRANSLATIONS[language];
  const config = THEME_CONFIG[theme];
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);

  // Mapeamento estático de ícones para categorias dinâmicas
  const iconMap: Record<string, any> = {
    work: Briefcase,
    college: GraduationCap,
    reading: BookOpen,
    training: Dumbbell,
    media: Film,
    finances: DollarSign,
    goals: Target,
    diet: Utensils,
    health: Activity,
    leisure: Gamepad2,
    marriage: HeartHandshake,
    relationship: Users,
    ideas: Lightbulb,
    travel: Map,
    studies: Book,
    devotional: BookOpen,
    commitments: Calendar
  };

  const fixedMenuItems = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'focus', label: t.focus, icon: Target },
  ];

  const bottomMenuItems = [
    { id: 'habits', label: t.habits, icon: CheckCircle2 },
    { id: 'profile', label: t.profile, icon: UserIcon },
    { id: 'tutorial', label: t.tutorial, icon: Info },
    { id: 'trash', label: t.trash, icon: Trash2 },
  ];

  // Categorias que o usuário escolheu fixar
  const pinnedCategories = useMemo(() => {
    return [...categoryConfigs]
      .filter(c => c.isPinned)
      .sort((a, b) => a.order - b.order)
      .map(c => ({
        id: c.id,
        label: (t as any)[c.id] || c.id,
        icon: iconMap[c.id] || LayoutGrid
      }));
  }, [categoryConfigs, t]);

  // Categorias que ficam dentro da seção colapsável "Categorias"
  const collapsedCategories = useMemo(() => {
    return [...categoryConfigs]
      .filter(c => !c.isPinned)
      .sort((a, b) => a.order - b.order);
  }, [categoryConfigs]);

  const togglePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setCategoryConfigs(categoryConfigs.map(c => 
      c.id === id ? { ...c, isPinned: !c.isPinned } : c
    ));
  };

  const moveCategory = (e: React.MouseEvent, id: string, direction: 'up' | 'down') => {
    e.stopPropagation();
    const sorted = [...categoryConfigs].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex(c => c.id === id);
    if (direction === 'up' && index > 0) {
      const prev = sorted[index - 1];
      const current = sorted[index];
      const tempOrder = prev.order;
      prev.order = current.order;
      current.order = tempOrder;
    } else if (direction === 'down' && index < sorted.length - 1) {
      const next = sorted[index + 1];
      const current = sorted[index];
      const tempOrder = next.order;
      next.order = current.order;
      current.order = tempOrder;
    }
    setCategoryConfigs([...sorted]);
  };

  const getTrialDaysRemaining = () => {
    if (!user) return 0;
    const created = new Date(user.createdAt);
    const now = new Date();
    const diffTime = now.getTime() - created.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - diffDays);
  };

  const daysRemaining = getTrialDaysRemaining();

  return (
    <>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)} 
          className={`fixed top-4 left-4 z-50 p-3 rounded-2xl lg:hidden shadow-2xl transition-all active:scale-95 ${theme === 'night' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border border-slate-100'}`}
        >
          <Menu size={24} />
        </button>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col transition-all duration-500 ease-in-out ${config.sidebar} text-white shadow-2xl ${isOpen ? 'w-72 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'}`}>
        
        <div className={`p-6 flex items-center justify-between border-b border-white/10 transition-all ${!isOpen ? 'flex-col gap-4' : ''}`}>
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="h-10 w-10 min-w-[40px] rounded-xl bg-white text-blue-900 flex items-center justify-center font-black text-xl shadow-inner shrink-0">My.</div>
            {isOpen && <span className="font-black text-xl tracking-tighter whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">Organizador</span>}
          </div>
          
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all active:scale-90"
            title={isOpen ? "Recolher Menu" : "Expandir Menu"}
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          {fixedMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group relative ${currentView === item.id ? 'bg-white/20 shadow-lg' : 'hover:bg-white/10'}`}
            >
              <item.icon size={20} className={`shrink-0 transition-transform ${currentView === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              {isOpen && (
                <span className="text-sm font-bold tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                  {item.label}
                </span>
              )}
            </button>
          ))}

          {pinnedCategories.length > 0 && (
             <div className="px-4 pt-4 pb-1">
               {isOpen ? (
                 <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Favoritos</p>
               ) : (
                 <div className="h-[1px] bg-white/10 w-full"></div>
               )}
             </div>
          )}

          {pinnedCategories.map((item) => (
            <div key={item.id} className="relative group/item">
              <button
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group relative ${currentView === item.id ? 'bg-white/20 shadow-lg' : 'hover:bg-white/10'}`}
              >
                <item.icon size={20} className={`shrink-0 transition-transform ${currentView === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                {isOpen && (
                  <span className="text-sm font-bold tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                    {item.label}
                  </span>
                )}
              </button>
              {isOpen && (
                <button 
                  onClick={(e) => togglePin(e, item.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-white/10 rounded-lg"
                  title="Desafixar"
                >
                  <PinOff size={14} className="text-white/60" />
                </button>
              )}
            </div>
          ))}

          {/* Categoria Mãe - Colapsável */}
          <div className="px-1 py-2">
            <button 
              onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all hover:bg-white/10 ${isCategoriesExpanded ? 'bg-white/5' : ''}`}
            >
              <div className="flex items-center gap-4">
                <LayoutGrid size={20} className="shrink-0" />
                {isOpen && <span className="text-sm font-black tracking-tight">{t.categories}</span>}
              </div>
              {isOpen && (
                <ChevronDown size={18} className={`transition-transform duration-300 ${isCategoriesExpanded ? 'rotate-180' : ''}`} />
              )}
            </button>
            
            {isCategoriesExpanded && isOpen && (
              <div className="mt-2 ml-2 pl-4 border-l border-white/10 space-y-1 animate-in slide-in-from-top-2 duration-300">
                {collapsedCategories.map((c, idx) => {
                  const Icon = iconMap[c.id] || LayoutGrid;
                  const label = (t as any)[c.id] || c.id;
                  const isActive = currentView === c.id;
                  
                  return (
                    <div key={c.id} className="relative group/subitem">
                      <button
                        onClick={() => setCurrentView(c.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                      >
                        <Icon size={16} className="shrink-0" />
                        <span className="text-xs font-bold truncate pr-16">{label}</span>
                      </button>
                      
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover/subitem:opacity-100 transition-opacity">
                        <button onClick={(e) => moveCategory(e, c.id, 'up')} disabled={idx === 0} className="p-1 hover:bg-white/20 rounded disabled:opacity-20 text-white/80"><ArrowUp size={12} /></button>
                        <button onClick={(e) => moveCategory(e, c.id, 'down')} disabled={idx === collapsedCategories.length - 1} className="p-1 hover:bg-white/20 rounded disabled:opacity-20 text-white/80"><ArrowDown size={12} /></button>
                        <button onClick={(e) => togglePin(e, c.id)} className="p-1 hover:bg-white/20 rounded text-blue-400" title="Fixar"><Pin size={12} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-4 py-2">
            <div className="h-[1px] bg-white/10 w-full"></div>
          </div>

          {bottomMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group relative ${currentView === item.id ? 'bg-white/20 shadow-lg' : 'hover:bg-white/10'}`}
            >
              <item.icon size={20} className={`shrink-0 transition-transform ${currentView === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              {isOpen && (
                <span className="text-sm font-bold tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          <button 
            onClick={() => setCurrentView('subscription')}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group relative ${user?.subscriptionPlan ? 'bg-amber-500/20 text-amber-200 shadow-lg shadow-amber-500/10' : 'bg-white/10 hover:bg-white/20'}`}
          >
            <Star size={22} className={`shrink-0 ${user?.subscriptionPlan ? 'text-amber-400 fill-amber-400' : ''}`} />
            {isOpen && (
              <div className="text-left animate-in fade-in slide-in-from-left-2 duration-300">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{t.subscription}</p>
                <p className="text-xs font-black">
                  {user?.subscriptionPlan ? t.activePlan : `${daysRemaining} ${t.daysRemaining}`}
                </p>
              </div>
            )}
          </button>

          {isOpen && (
             <div className="flex justify-around py-4 animate-in fade-in duration-500">
              {(['blue', 'pink', 'green', 'red', 'black', 'night'] as AppTheme[]).map((thm) => (
                <button 
                  key={thm} 
                  onClick={() => setTheme(thm)} 
                  className={`w-6 h-6 rounded-full border-2 border-white/50 transition-all hover:scale-125 hover:rotate-12 ${THEME_CONFIG[thm].primary} ${theme === thm ? 'ring-4 ring-white/20 scale-110' : ''}`} 
                />
              ))}
            </div>
          )}
          
          <button 
            onClick={toggleLanguage} 
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-white/10 transition-all group relative"
          >
            <Settings size={22} className="shrink-0 group-hover:rotate-45 transition-transform" />
            {isOpen && <span className="text-sm font-bold animate-in fade-in slide-in-from-left-2 duration-300">{t.changeLang}</span>}
          </button>
          
          <button 
            onClick={onLogout} 
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-red-500/20 text-red-300 transition-all group relative"
          >
            <LogOut size={22} className="shrink-0 group-hover:translate-x-1 transition-transform" />
            {isOpen && <span className="text-sm font-bold animate-in fade-in slide-in-from-left-2 duration-300">Sair</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
