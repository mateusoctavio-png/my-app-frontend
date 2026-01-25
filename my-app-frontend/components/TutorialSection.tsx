
import React, { useState } from 'react';
import { AppTheme, AppLanguage, User } from '../types';
import { THEME_CONFIG, TRANSLATIONS } from '../constants';
import { Info, CheckCircle, Smartphone, Layers, Plus, Edit2, Trash2, X, Save, Send } from 'lucide-react';

interface TutorialSectionProps {
  theme: AppTheme;
  language: AppLanguage;
  user: User | null;
  tutorials: any[];
  setTutorials: (t: any[]) => void;
}

const TutorialSection: React.FC<TutorialSectionProps> = ({ theme, language, user, tutorials, setTutorials }) => {
  const t = TRANSLATIONS[language];
  const config = THEME_CONFIG[theme];
  const isDark = theme === 'night';
  const isMaster = user?.email.toLowerCase() === 'mateus.octavio@gmail.com';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', desc: '', icon: 'Layers' });

  const icons = {
    Layers: Layers,
    CheckCircle: CheckCircle,
    Smartphone: Smartphone,
    Info: Info
  };

  const handleOpenAdd = () => {
    setEditingTutorial(null);
    setFormData({ title: '', desc: '', icon: 'Layers' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingTutorial(item);
    setFormData({ title: item.title, desc: item.desc, icon: item.icon });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Deseja excluir este item do tutorial?")) {
      setTutorials(tutorials.filter(t => t.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTutorial) {
      setTutorials(tutorials.map(t => t.id === editingTutorial.id ? { ...t, ...formData } : t));
    } else {
      setTutorials([...tutorials, { id: Date.now().toString(), ...formData }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 lg:p-12 max-w-5xl mx-auto text-center animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter mb-4">Bem-vindo ao My.</h2>
          <p className="text-slate-500 text-lg lg:text-xl font-medium">Toda a sua vida sob controle em um só lugar.</p>
        </div>
        {isMaster && (
          <button 
            onClick={handleOpenAdd}
            className={`flex items-center gap-3 px-8 py-4 rounded-[24px] text-white font-black uppercase text-xs shadow-2xl transition-all active:scale-95 ${config.primary}`}
          >
            <Plus size={20} /> Adicionar Guia
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tutorials.map((s, i) => {
          const IconComponent = (icons as any)[s.icon] || Info;
          return (
            <div key={s.id || i} className={`p-10 rounded-[48px] border text-left group relative transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl'}`}>
              {isMaster && (
                <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => handleOpenEdit(s)} className="p-2 text-slate-400 hover:text-blue-500 transition-colors"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </div>
              )}
              <div className={`w-14 h-14 rounded-2xl mb-8 flex items-center justify-center ${config.text} ${isDark ? 'bg-slate-800' : 'bg-slate-50'} shadow-inner`}>
                <IconComponent size={28} />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">{s.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-lg font-medium">{s.desc}</p>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className={`w-full max-w-lg p-12 rounded-[56px] border shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black uppercase tracking-tight">{editingTutorial ? 'Editar Guia' : 'Novo Guia'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-3 text-slate-400 hover:text-red-500 transition-all"><X size={28}/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Título do Cartão</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 outline-none font-black text-xl" />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Descrição Tutorial</label>
                <textarea required value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full min-h-[120px] p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 outline-none font-medium text-lg leading-relaxed resize-none" />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Ícone Representativo</label>
                <div className="grid grid-cols-4 gap-4">
                  {Object.keys(icons).map(iconName => (
                    <button 
                      key={iconName}
                      type="button"
                      onClick={() => setFormData({...formData, icon: iconName})}
                      className={`p-4 rounded-2xl flex items-center justify-center border-2 transition-all ${formData.icon === iconName ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-slate-50 dark:bg-slate-800'}`}
                    >
                      {React.createElement((icons as any)[iconName], { size: 24 })}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 font-black text-xs uppercase tracking-widest rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-500">Cancelar</button>
                <button type="submit" className={`flex-1 py-5 font-black text-xs uppercase tracking-widest rounded-3xl text-white shadow-xl flex items-center justify-center gap-3 ${config.primary}`}>
                  <Send size={18} /> {editingTutorial ? 'Salvar Alterações' : 'Publicar Guia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorialSection;
