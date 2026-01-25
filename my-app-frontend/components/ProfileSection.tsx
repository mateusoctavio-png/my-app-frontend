
import React, { useState } from 'react';
import { AppTheme, AppLanguage, User } from '../types';
import { THEME_CONFIG, TRANSLATIONS } from '../constants';
import { 
  User as UserIcon, CreditCard, ShieldCheck, 
  Trash2, Mail, Calendar, Edit2, Save, Lock, FileText, Shield,
  Key, CheckCircle, ArrowRight, MailCheck, Loader2, AlertTriangle, X
} from 'lucide-react';

interface Props {
  theme: AppTheme;
  language: AppLanguage;
  user: User;
  setUser: (user: User) => void;
  setTheme: (theme: AppTheme) => void;
  toggleLanguage: () => void;
  policies: { privacy: string; terms: string; safety: string };
  setPolicies: (policies: any) => void;
  onDeleteAccount: () => void;
}

const ProfileSection: React.FC<Props> = ({ 
  theme, language, user, setUser, setTheme, toggleLanguage, 
  policies, setPolicies, onDeleteAccount 
}) => {
  const t = TRANSLATIONS[language];
  const config = THEME_CONFIG[theme];
  const isDark = theme === 'night';

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newNickname, setNewNickname] = useState(user.nickname);
  const [editingPolicy, setEditingPolicy] = useState<string | null>(null);
  const [policyTempText, setPolicyTempText] = useState("");

  // Estados para alteração de senha
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordStep, setPasswordStep] = useState<1 | 2 | 3>(1); 
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para Encerramento de Conta
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveProfile = () => {
    setUser({ ...user, nickname: newNickname });
    setIsEditingProfile(false);
  };

  const handleEditPolicy = (key: string) => {
    setEditingPolicy(key);
    setPolicyTempText((policies as any)[key]);
  };

  const handleSavePolicy = () => {
    if (editingPolicy) {
      setPolicies({ ...policies, [editingPolicy]: policyTempText });
      setEditingPolicy(null);
    }
  };

  const startPasswordChange = () => {
    setPasswordStep(1);
    setIsPasswordModalOpen(true);
    setIsSuccess(false);
    setPasswordError("");
    setVerificationCode("");
  };

  const sendEmailCode = async () => {
    setIsLoading(true);
    setPasswordError("");
    setTimeout(() => {
      setIsLoading(false);
      setPasswordStep(2);
    }, 1500);
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      setPasswordError("Insira os 6 dígitos do código.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (verificationCode.length === 6) {
        setPasswordStep(3);
      } else {
        setPasswordError("Código inválido. Verifique seu e-mail.");
      }
    }, 1200);
  };

  const finalizePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('my_app_users') || '[]');
      const userIndex = users.findIndex((u: any) => u.email === user.email);
      
      if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('my_app_users', JSON.stringify(users));
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setPasswordStep(1);
        }, 2000);
      }
    }, 1500);
  };

  const handleFinalAccountDeletion = () => {
    if (deleteConfirmationText !== user.nickname) return;
    
    setIsDeleting(true);
    setTimeout(() => {
      onDeleteAccount();
    }, 2000);
  };

  return (
    <div className="p-8 lg:p-12 max-w-5xl mx-auto animate-in fade-in duration-500 pb-32">
      {/* Header do Perfil */}
      <div className="flex flex-col md:flex-row items-center gap-10 mb-20 bg-white dark:bg-slate-900 p-10 rounded-[48px] border dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className={`w-32 h-32 rounded-[40px] ${config.primary} flex items-center justify-center text-white text-5xl font-black shadow-2xl relative`}>
          {user.nickname.charAt(0).toUpperCase()}
          {user.isMaster && <div className="absolute -top-3 -right-3 bg-amber-400 p-2 rounded-xl text-amber-900 shadow-lg"><Lock size={16} /></div>}
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="text-4xl font-black tracking-tight flex items-center justify-center md:justify-start gap-4">
            {user.nickname}
            {user.isMaster && <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-lg text-[10px] font-black uppercase">Master</span>}
          </h2>
          <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2 mt-2">
            <Mail size={16} /> {user.email}
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4 flex items-center justify-center md:justify-start gap-2">
            <Calendar size={14} /> {t.membershipSince}: {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button 
          onClick={() => setIsEditingProfile(!isEditingProfile)}
          className={`flex items-center gap-2 px-8 py-4 rounded-2xl border transition-all font-black text-xs uppercase tracking-widest ${isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-100 hover:bg-slate-50'}`}
        >
          {isEditingProfile ? <Save size={18} /> : <Edit2 size={18} />}
          {isEditingProfile ? t.saveChanges : t.editProfile}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Configurações da Conta */}
        <div className={`p-8 rounded-[40px] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <h3 className="text-xl font-black mb-8 flex items-center gap-3"><UserIcon className={config.text} /> {t.accountSettings}</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Nickname / @</label>
              <input type="text" value={newNickname} readOnly={!isEditingProfile} onChange={(e) => setNewNickname(e.target.value)} className={`w-full p-4 rounded-2xl outline-none border-2 font-bold ${isEditingProfile ? 'border-blue-500 bg-white dark:bg-slate-950 shadow-inner' : 'border-transparent bg-slate-50 dark:bg-slate-800 text-slate-500'}`} />
            </div>
            
            <button 
              onClick={handleSaveProfile} 
              disabled={!isEditingProfile}
              className={`w-full py-4 rounded-2xl text-white font-black uppercase text-xs shadow-xl transition-all ${isEditingProfile ? config.primary : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
            >
              {t.saveChanges}
            </button>
            
            <div className="pt-4 border-t dark:border-slate-800">
               <button 
                onClick={startPasswordChange}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-transparent active:scale-95"
               >
                 <Key size={16} /> Alterar Minha Senha
               </button>
            </div>
          </div>
        </div>

        {/* Assinatura */}
        <div className={`p-8 rounded-[40px] border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <h3 className="text-xl font-black mb-8 flex items-center gap-3"><CreditCard className={config.text} /> {t.subscription}</h3>
          <div className={`p-6 rounded-3xl mb-6 ${user.subscriptionPlan ? 'bg-amber-500/10 border-amber-500/20' : 'bg-blue-500/10 border-blue-500/20'} border`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                <h4 className="text-2xl font-black">{user.subscriptionPlan ? t[`plan${user.subscriptionPlan.charAt(0).toUpperCase() + user.subscriptionPlan.slice(1)}` as keyof typeof t] : "Trial Grátis"}</h4>
              </div>
              <ShieldCheck className={user.subscriptionPlan ? 'text-amber-500' : 'text-blue-500'} size={36} />
            </div>
          </div>
          <button className={`w-full py-4 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest ${isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-100 hover:bg-slate-50'}`}>Gerenciar no App Store / Play Store</button>
        </div>

        {/* Políticas */}
        <div className={`p-8 rounded-[40px] border md:col-span-2 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black flex items-center gap-3"><Shield className={config.text} /> {t.policy}</h3>
            {user.isMaster && <span className="text-[10px] font-black uppercase text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-lg">Master User</span>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { key: 'privacy', label: 'Privacidade', icon: Lock },
              { key: 'terms', label: 'Termos de Uso', icon: FileText },
              { key: 'safety', label: 'Segurança', icon: ShieldCheck }
            ].map((p) => (
              <div key={p.key} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 group relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-xl ${config.text} bg-white dark:bg-slate-900 shadow-sm`}><p.icon size={18} /></div>
                  <h4 className="font-black text-xs uppercase tracking-widest flex-1 ml-4">{p.label}</h4>
                  {user.isMaster && (
                    <button onClick={() => handleEditPolicy(p.key)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-blue-500 transition-all"><Edit2 size={14} /></button>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 line-clamp-3">{(policies as any)[p.key]}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 pt-8 border-t dark:border-slate-800 flex justify-between items-center">
            <button 
              onClick={() => setIsDeleteModalOpen(true)} 
              className="px-6 py-4 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-600 hover:bg-red-600 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-3 border border-red-100 dark:border-red-900/20 active:scale-95"
            >
              <Trash2 size={18} /> {t.closeAccount}
            </button>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">My. Version 1.0.0-PRO</p>
          </div>
        </div>
      </div>

      {/* Modal de Alteração de Senha */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`w-full max-w-md p-10 rounded-[48px] border shadow-2xl relative overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100'}`}>
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center gap-4">
                <Loader2 className={`animate-spin ${config.text}`} size={48} />
                <p className="text-xs font-black uppercase tracking-widest">Processando...</p>
              </div>
            )}

            {isSuccess ? (
              <div className="text-center py-10 animate-in zoom-in-95">
                <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/30">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-black mb-2">Senha Alterada!</h3>
                <p className="text-slate-400 font-medium">Sua conta está protegida com a nova credencial.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black uppercase tracking-tight">Segurança da Conta</h3>
                  <button onClick={() => setIsPasswordModalOpen(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={24} /></button>
                </div>

                {passwordStep === 1 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <MailCheck size={32} />
                      </div>
                      <p className={`text-sm font-bold mb-8 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        Para sua segurança, enviaremos um código de 6 dígitos para o e-mail: <br/> 
                        <span className="font-black text-blue-500 block mt-2">{user.email}</span>
                      </p>
                      <button onClick={sendEmailCode} className={`w-full py-5 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all ${config.primary}`}>
                        Gerar Código Real <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {passwordStep === 2 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div className="space-y-4">
                      <div className="text-center">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Código enviado para o seu e-mail</label>
                        <p className="text-[9px] text-blue-500 font-bold uppercase mt-1 italic">Verifique sua caixa de entrada e spam</p>
                      </div>
                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="000000"
                        autoFocus
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        className={`w-full p-6 rounded-3xl border-2 outline-none font-black text-3xl text-center tracking-[0.5em] transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-100 text-slate-900 focus:border-blue-500 shadow-inner'}`}
                      />
                      {passwordError && <p className="text-red-500 text-[10px] font-black uppercase text-center bg-red-50 dark:bg-red-900/10 py-2 rounded-lg">{passwordError}</p>}
                    </div>
                    <button onClick={verifyCode} className={`w-full py-5 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all ${config.primary}`}>
                      Validar Código
                    </button>
                    <button onClick={sendEmailCode} className="w-full text-[10px] font-black uppercase text-slate-400 hover:text-blue-500 transition-colors">Não recebi o código</button>
                  </div>
                )}

                {passwordStep === 3 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Nova Senha de Acesso</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        autoFocus
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`w-full p-5 rounded-2xl border-2 outline-none font-bold ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-100 focus:border-blue-500 shadow-inner'}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Repita a Nova Senha</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full p-5 rounded-2xl border-2 outline-none font-bold ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-100 focus:border-blue-500 shadow-inner'}`}
                      />
                    </div>
                    {passwordError && <p className="text-red-500 text-[10px] font-black uppercase text-center bg-red-50 dark:bg-red-900/10 py-2 rounded-lg">{passwordError}</p>}
                    <button onClick={finalizePasswordChange} className={`w-full py-5 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all ${config.primary}`}>
                      Confirmar Mudança
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de Encerramento de Conta (Dangerous Action) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className={`w-full max-w-md p-10 rounded-[48px] border-4 border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.3)] relative overflow-hidden ${isDark ? 'bg-slate-900 text-white' : 'bg-white'}`}>
            {isDeleting && (
              <div className="absolute inset-0 bg-red-600 z-50 flex flex-col items-center justify-center gap-6 animate-in slide-in-from-bottom-full duration-700">
                <Loader2 className="animate-spin text-white" size={64} />
                <p className="text-xl font-black uppercase tracking-widest text-white text-center px-10">Apagando todos os seus registros...</p>
              </div>
            )}

            <div className="text-center">
              <div className="w-20 h-20 bg-red-500 text-white rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-red-500/30">
                <AlertTriangle size={44} />
              </div>
              <h3 className="text-3xl font-black mb-4 tracking-tight text-red-600">Ação Irreversível</h3>
              <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 leading-relaxed">
                Ao confirmar, seu acesso será revogado e <span className="text-red-500 underline">todos os seus dados</span> (notas, tarefas, finanças e metas) serão deletados permanentemente.
              </p>
              
              <div className="space-y-6 text-left">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">Digite seu nickname para confirmar:</p>
                  <p className="text-xs font-black text-blue-500 mb-4 uppercase tracking-tighter">"{user.nickname}"</p>
                  <input 
                    type="text" 
                    placeholder="Escreva exatamente como acima"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    className={`w-full p-4 rounded-xl border-2 outline-none font-bold transition-all ${deleteConfirmationText === user.nickname ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-slate-200 dark:border-slate-700'}`}
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 py-5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black uppercase text-xs tracking-widest transition-all"
                  >
                    Desistir
                  </button>
                  <button 
                    disabled={deleteConfirmationText !== user.nickname}
                    onClick={handleFinalAccountDeletion}
                    className={`flex-1 py-5 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-xl transition-all ${deleteConfirmationText === user.nickname ? 'bg-red-600 hover:bg-red-700 active:scale-95' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
                  >
                    Deletar Tudo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Política (Master) */}
      {editingPolicy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`w-full max-w-2xl p-10 rounded-[48px] border shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100'}`}>
            <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Editar {editingPolicy}</h3>
            <p className="text-slate-400 text-sm mb-8 font-medium">Você está editando conteúdo global como Master.</p>
            <textarea value={policyTempText} onChange={(e) => setPolicyTempText(e.target.value)} className="w-full min-h-[300px] p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 outline-none font-medium text-lg leading-relaxed resize-none mb-8" />
            <div className="flex gap-4">
              <button onClick={() => setEditingPolicy(null)} className="flex-1 py-4 font-black uppercase text-xs rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500">Cancelar</button>
              <button onClick={handleSavePolicy} className={`flex-1 py-4 font-black uppercase text-xs rounded-2xl text-white shadow-xl ${config.primary}`}>Publicar Alteração</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSection;
