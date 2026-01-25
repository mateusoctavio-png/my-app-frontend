
import React, { useState } from 'react';
import { User, AppTheme, AppLanguage, Article } from '../types';
import { THEME_CONFIG, TRANSLATIONS } from '../constants';
import { Plus, Clock, User as UserIcon, Calendar, X, BookOpen, Send, Edit2, Trash2 } from 'lucide-react';

interface Props {
  user: User | null;
  theme: AppTheme;
  language: AppLanguage;
  articles: Article[];
  setArticles: (articles: Article[]) => void;
}

const FocusSection: React.FC<Props> = ({ user, theme, language, articles, setArticles }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const config = THEME_CONFIG[theme];
  const isDark = theme === 'night';

  const handleOpenAdd = () => {
    setEditingArticle(null);
    setNewTitle("");
    setNewContent("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, article: Article) => {
    e.stopPropagation();
    setEditingArticle(article);
    setNewTitle(article.title);
    setNewContent(article.content);
    setIsModalOpen(true);
  };

  const handleDeleteArticle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Tem certeza que deseja excluir este artigo permanentemente?")) {
      setArticles(articles.filter(a => a.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() && newContent.trim()) {
      if (editingArticle) {
        setArticles(articles.map(a => 
          a.id === editingArticle.id ? { ...a, title: newTitle.trim(), content: newContent.trim() } : a
        ));
      } else {
        const newArticle: Article = {
          id: Date.now().toString(),
          title: newTitle.trim(),
          content: newContent.trim(),
          author: user?.nickname || "Membro My.",
          date: new Date()
        };
        setArticles([newArticle, ...articles]);
      }
      setNewTitle("");
      setNewContent("");
      setIsModalOpen(false);
      setEditingArticle(null);
    }
  };

  return (
    <div className="p-8 lg:p-12 max-w-5xl mx-auto animate-in fade-in duration-500 pb-32 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
        <div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter">Precisa de mais foco?</h2>
          <p className="text-slate-500 mt-2 text-lg lg:text-xl font-medium">Artigos e dicas para uma vida produtiva e centrada.</p>
        </div>
        {user?.isMaster && (
          <button 
            onClick={handleOpenAdd} 
            className={`flex items-center gap-3 px-8 py-4 rounded-[24px] text-white font-black uppercase text-xs shadow-2xl transition-all active:scale-95 hover:brightness-110 ${config.primary}`}
          >
            <Plus size={20} /> Novo Artigo
          </button>
        )}
      </div>

      <div className="space-y-8">
        {articles.map(article => (
          <article 
            key={article.id} 
            onClick={() => setSelectedArticle(article)}
            className={`p-10 rounded-[48px] border transition-all cursor-pointer group hover:-translate-y-1 relative ${isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl'}`}
          >
            {/* Ações de Gerenciamento (Apenas para Master) */}
            {user?.isMaster && (
              <div className="absolute top-8 right-24 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
                <button 
                  onClick={(e) => handleOpenEdit(e, article)}
                  className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-blue-500 transition-all hover:scale-110"
                  title="Editar Artigo"
                >
                  <Edit2 size={20} />
                </button>
                <button 
                  onClick={(e) => handleDeleteArticle(e, article.id)}
                  className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-red-500 transition-all hover:scale-110"
                  title="Excluir Artigo"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            )}

            <div className="flex justify-between items-start mb-6">
              <h3 className="text-3xl font-black tracking-tight group-hover:text-blue-500 transition-colors pr-20">{article.title}</h3>
              <div className={`p-4 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'} text-slate-400 group-hover:scale-110 transition-transform`}>
                <BookOpen size={24} />
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-10 text-lg line-clamp-3">
              {article.content}
            </p>
            <div className="flex flex-wrap items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-t dark:border-slate-800 pt-8">
              <span className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                <UserIcon size={14} /> {article.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={14} /> {new Date(article.date).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-2">
                <Clock size={14} /> 5 min leitura
              </span>
            </div>
          </article>
        ))}

        {articles.length === 0 && (
          <div className="text-center py-20 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[48px]">
            <BookOpen size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-6" />
            <p className="text-slate-400 font-bold">Nenhum artigo publicado.</p>
          </div>
        )}
      </div>

      {/* Modal de Criação/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className={`w-full max-w-2xl p-10 rounded-[48px] border shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">
                  {editingArticle ? 'Editar Artigo' : 'Publicar Artigo'}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-bold">Inspirando a comunidade My.</p>
              </div>
              <button 
                onClick={() => {setIsModalOpen(false); setEditingArticle(null);}} 
                className="p-3 text-slate-400 hover:text-red-500 transition-all"
              >
                <X size={24}/>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Título Impactante</label>
                <input 
                  autoFocus
                  type="text" 
                  required 
                  placeholder="Ex: 5 Passos para o Deep Work" 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)} 
                  className="w-full p-5 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 outline-none font-black text-xl" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Conteúdo do Artigo</label>
                <textarea 
                  required 
                  placeholder="Compartilhe seu conhecimento..." 
                  value={newContent} 
                  onChange={e => setNewContent(e.target.value)} 
                  className="w-full min-h-[300px] p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 outline-none font-medium text-lg leading-relaxed resize-none" 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => {setIsModalOpen(false); setEditingArticle(null);}} 
                  className="flex-1 py-5 font-black text-xs uppercase rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className={`flex-1 py-5 font-black text-xs uppercase rounded-2xl text-white shadow-xl flex items-center justify-center gap-3 ${config.primary}`}
                >
                  <Send size={18} /> {editingArticle ? 'Salvar Alterações' : 'Publicar Agora'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Leitura Imersiva */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 lg:p-12 bg-black/95 backdrop-blur-xl animate-in zoom-in-95 duration-300">
          <div className={`w-full max-w-4xl h-full lg:h-auto lg:max-h-full overflow-y-auto p-12 lg:rounded-[64px] relative scrollbar-hide ${isDark ? 'bg-slate-900 text-white' : 'bg-white'}`}>
            <button 
              onClick={() => setSelectedArticle(null)} 
              className="fixed lg:absolute top-8 right-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-red-500 hover:text-white transition-all z-[110]"
            >
              <X size={24} />
            </button>
            
            <div className="max-w-2xl mx-auto py-12">
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-blue-500 mb-6">
                <BookOpen size={16} /> Artigo de Foco
              </div>
              <h2 className="text-5xl lg:text-6xl font-black tracking-tighter mb-10 leading-none">{selectedArticle.title}</h2>
              <div className="flex items-center gap-8 mb-16 border-b dark:border-slate-800 pb-8 text-[11px] font-black uppercase tracking-widest text-slate-400">
                <span className="flex items-center gap-2"><UserIcon size={16} /> {selectedArticle.author}</span>
                <span className="flex items-center gap-2"><Calendar size={16} /> {new Date(selectedArticle.date).toLocaleDateString()}</span>
              </div>
              <div className="prose prose-xl dark:prose-invert">
                <p className="text-xl lg:text-2xl leading-relaxed font-medium text-slate-600 dark:text-slate-300 first-letter:text-7xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-blue-600">
                  {selectedArticle.content}
                </p>
                <div className="mt-20 p-10 bg-slate-50 dark:bg-slate-800/50 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-slate-400 font-bold italic">"O foco é a chave para o domínio."</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusSection;
