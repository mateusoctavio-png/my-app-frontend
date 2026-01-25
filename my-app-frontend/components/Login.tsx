
import React, { useState, useEffect } from 'react';
import { AppTheme, AppLanguage } from '../types';
import { THEME_CONFIG, TRANSLATIONS } from '../constants';
import { 
  LogIn, UserPlus, Facebook, Chrome, AlertCircle, 
  CheckCircle2, Key, Mail, ArrowRight, Loader2, X, ShieldCheck,
  CheckCircle
} from 'lucide-react';

interface LoginProps {
  theme: AppTheme;
  language: AppLanguage;
  onLogin: (nickname: string, email: string) => void;
  setTheme: (theme: AppTheme) => void;
  toggleLanguage: () => void;
}

const Login: React.FC<LoginProps> = ({ theme, language, onLogin, setTheme, toggleLanguage }) => {
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegisteredSuccessfully, setIsRegisteredSuccessfully] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para Recuperação de Senha
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3>(1);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const t = TRANSLATIONS[language];
  const config = THEME_CONFIG[theme];

  useEffect(() => {
    const lastUser = localStorage.getItem('my_app_last_identifier');
    if (lastUser) setIdentifier(lastUser);
  }, []);

  const getUsers = () => {
    const users = localStorage.getItem('my_app_users');
    return users ? JSON.parse(users) : [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const users = getUsers();

    if (isRegistering) {
      // 1. Validar e-mail único
      if (users.find((u: any) => u.email.toLowerCase() === email.trim().toLowerCase())) {
        setError("Este e-mail já está cadastrado. Tente fazer login.");
        return;
      }
      // 2. Validar nickname (@) único
      const cleanNick = nickname.trim().toLowerCase();
      if (users.find((u: any) => u.nickname.toLowerCase() === cleanNick)) {
        setError("Este @ já está em uso por outro usuário. Escolha um diferente.");
        return;
      }

      const newUser = { nickname: nickname.trim(), email: email.trim(), password, createdAt: new Date().toISOString() };
      localStorage.setItem('my_app_users', JSON.stringify([...users, newUser]));
      
      // Feedback de sucesso em vez de login direto
      setIsRegisteredSuccessfully(true);
      setIdentifier(email.trim()); // Prepara o campo de login para o usuário
    } else {
      const user = users.find((u: any) => u.email.toLowerCase() === identifier.trim().toLowerCase() || u.nickname.toLowerCase() === identifier.trim().toLowerCase());
      if (!user) {
        setError("Usuário não encontrado. Verifique os dados ou cadastre-se.");
        return;
      }
      if (user.password !== password) {
        setError("Senha incorreta. Verifique e tente novamente.");
        return;
      }
      if (rememberMe) localStorage.setItem('my_app_last_identifier', identifier);
      else localStorage.removeItem('my_app_last_identifier');
      onLogin(user.nickname, user.email);
    }
  };

  // Funções de Recuperação
  const startRecovery = () => {
    setIsRecoveryOpen(true);
    setRecoveryStep(1);
    setRecoveryError('');
    setIsSuccess(false);
  };

  const handleSendRecoveryCode = () => {
    const users = getUsers();
    const userExists = users.find((u: any) => u.email.toLowerCase() === recoveryEmail.trim().toLowerCase());

    if (!userExists) {
      setRecoveryError("E-mail não encontrado em nossa base.");
      return;
    }

    setIsLoading(true);
    setRecoveryError('');
    setTimeout(() => {
      setIsLoading(false);
      setRecoveryStep(2);
    }, 1500);
  };

  const handleVerifyCode = () => {
    if (recoveryCode.length !== 6) {
      setRecoveryError("Insira o código de 6 dígitos.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setRecoveryStep(3);
      setRecoveryError('');
    }, 1000);
  };

  const handleResetPassword = () => {
    if (newPassword !== confirmPassword) {
      setRecoveryError("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      setRecoveryError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const users = getUsers();
      const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === recoveryEmail.trim().toLowerCase());
      
      if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('my_app_users', JSON.stringify(users));
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => {
          setIsRecoveryOpen(false);
          setIdentifier(recoveryEmail);
        }, 2500);
      }
    }, 1500);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${theme === 'night' ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-10 rounded-[48px] shadow-2xl border border-slate-100 dark:border-slate-800 transition-all duration-300">
        
        {isRegisteredSuccessfully ? (
          <div className="text-center py-10 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-green-500 text-white rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/30">
              <CheckCircle size={56} />
            </div>
            <h3 className="text-3xl font-black mb-4 tracking-tight dark:text-white">Cadastro Concluído!</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-base mb-10 leading-relaxed px-4">
              Sua conta no My. foi criada com sucesso. Agora você já pode entrar usando suas credenciais.
            </p>
            <button
              onClick={() => {
                setIsRegisteredSuccessfully(false);
                setIsRegistering(false);
                setPassword('');
              }}
              className={`w-full py-5 rounded-2xl text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${config.primary}`}
            >
              Ir para o Login <ArrowRight size={20} />
            </button>
          </div>
        ) : (
          <>
            <div className="text-center">
              <div className={`mx-auto h-20 w-20 rounded-3xl ${config.primary} flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-blue-500/20 transform hover:scale-105 transition-transform`}>
                My.
              </div>
              <h2 className={`mt-6 text-3xl font-black tracking-tight ${theme === 'night' ? 'text-white' : 'text-slate-900'}`}>
                {isRegistering ? "Criar nova conta" : "Bem-vindo ao My."}
              </h2>
              <p className={`mt-2 text-sm font-medium ${theme === 'night' ? 'text-slate-400' : 'text-slate-600'}`}>
                {isRegistering ? "Junte-se a milhares de pessoas organizadas" : t.loginTitle}
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest border border-red-100 dark:border-red-900/20 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={20} className="shrink-0" /> {error}
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                {!isRegistering ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">E-mail ou @</label>
                    <input
                      type="text"
                      required
                      className={`appearance-none rounded-2xl relative block w-full px-5 py-4 border-2 font-bold ${theme === 'night' ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-transparent focus:bg-white focus:ring-4 ring-blue-500/10 shadow-inner'} outline-none transition-all`}
                      placeholder={t.nickname}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">E-mail Único</label>
                      <input
                        type="email"
                        required
                        className={`appearance-none rounded-2xl relative block w-full px-5 py-4 border-2 font-bold ${theme === 'night' ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-transparent focus:bg-white focus:ring-4 ring-blue-500/10 shadow-inner'} outline-none transition-all`}
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">@ Nickname Único</label>
                      <input
                        type="text"
                        required
                        className={`appearance-none rounded-2xl relative block w-full px-5 py-4 border-2 font-bold ${theme === 'night' ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-transparent focus:bg-white focus:ring-4 ring-blue-500/10 shadow-inner'} outline-none transition-all`}
                        placeholder="@seu-nick"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                      />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Sua Senha</label>
                  <input
                    type="password"
                    required
                    className={`appearance-none rounded-2xl relative block w-full px-5 py-4 border-2 font-bold ${theme === 'night' ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-transparent focus:bg-white focus:ring-4 ring-blue-500/10 shadow-inner'} outline-none transition-all`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div 
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${rememberMe ? 'bg-blue-600 border-blue-600' : 'border-slate-300 group-hover:border-blue-400'}`}
                  >
                    {rememberMe && <CheckCircle2 size={16} className="text-white" />}
                  </div>
                  <span className="text-xs font-black uppercase text-slate-500 tracking-widest">Lembrar-me</span>
                </label>
                {!isRegistering && (
                  <button 
                    type="button" 
                    onClick={startRecovery}
                    className="text-xs font-black uppercase text-blue-500 tracking-widest hover:underline"
                  >
                    Esqueci a senha
                  </button>
                )}
              </div>

              <button
                type="submit"
                className={`group relative w-full flex justify-center py-5 px-4 border border-transparent text-xs font-black uppercase tracking-[0.2em] rounded-2xl text-white shadow-xl ${config.primary} ${config.hover} transition-all active:scale-95`}
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-6">
                  {isRegistering ? <UserPlus size={20} /> : <LogIn size={20} />}
                </span>
                {isRegistering ? t.register : t.login}
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
                className={`text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-500 transition-colors underline underline-offset-8`}
              >
                {isRegistering ? t.haveAccount : t.noAccount}
              </button>
            </div>
          </>
        )}

        <div className="flex justify-between items-center pt-8 border-t dark:border-slate-800">
          <button onClick={toggleLanguage} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-500 transition-colors">{t.changeLang}</button>
          <div className="flex gap-3">
            {(['blue', 'pink', 'green', 'red', 'black', 'night'] as AppTheme[]).map((thm) => (
              <button key={thm} onClick={() => setTheme(thm)} className={`w-5 h-5 rounded-full border-2 border-white shadow-md transition-transform hover:scale-125 ${THEME_CONFIG[thm].primary} ${theme === thm ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Recuperação de Senha */}
      {isRecoveryOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`w-full max-w-md p-10 rounded-[48px] border shadow-2xl relative overflow-hidden ${theme === 'night' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100'}`}>
            
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center gap-4">
                <Loader2 className={`animate-spin ${config.text}`} size={48} />
                <p className="text-[10px] font-black uppercase tracking-widest">Processando...</p>
              </div>
            )}

            {isSuccess ? (
              <div className="text-center py-10 animate-in zoom-in-95">
                <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/30">
                  <ShieldCheck size={40} />
                </div>
                <h3 className="text-2xl font-black mb-2 tracking-tight">Senha Redefinida!</h3>
                <p className="text-slate-400 font-medium text-sm">Sua nova senha já está ativa. Você pode entrar agora.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                    <Key size={24} className={config.text} /> Recuperar Acesso
                  </h3>
                  <button onClick={() => setIsRecoveryOpen(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                {recoveryStep === 1 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4">
                    <p className="text-sm font-medium text-slate-500">Insira seu e-mail para receber um código de validação.</p>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">E-mail Cadastrado</label>
                      <input 
                        type="email"
                        placeholder="exemplo@email.com"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        className={`w-full p-5 rounded-2xl border-2 outline-none font-bold ${theme === 'night' ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-100 focus:border-blue-500 shadow-inner'}`}
                      />
                    </div>
                    {recoveryError && <p className="text-red-500 text-[10px] font-black uppercase text-center">{recoveryError}</p>}
                    <button onClick={handleSendRecoveryCode} className={`w-full py-5 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all ${config.primary}`}>
                      Enviar Código <ArrowRight size={18} />
                    </button>
                  </div>
                )}

                {recoveryStep === 2 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium text-slate-500">Enviamos um código para o e-mail:</p>
                      <p className="font-black text-blue-500">{recoveryEmail}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center block">Código de 6 Dígitos</label>
                      <input 
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, ''))}
                        className={`w-full p-6 rounded-3xl border-2 outline-none font-black text-4xl text-center tracking-[0.4em] ${theme === 'night' ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-100 focus:border-blue-500 shadow-inner'}`}
                      />
                    </div>
                    {recoveryError && <p className="text-red-500 text-[10px] font-black uppercase text-center">{recoveryError}</p>}
                    <button onClick={handleVerifyCode} className={`w-full py-5 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all ${config.primary}`}>
                      Verificar Código
                    </button>
                    <button onClick={handleSendRecoveryCode} className="w-full text-[10px] font-black uppercase text-slate-400 hover:text-blue-500 transition-colors">Reenviar Código</button>
                  </div>
                )}

                {recoveryStep === 3 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4">
                    <p className="text-sm font-medium text-slate-500">Tudo pronto! Escolha uma nova senha forte.</p>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Nova Senha</label>
                        <input 
                          type="password"
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={`w-full p-5 rounded-2xl border-2 outline-none font-bold ${theme === 'night' ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-100 focus:border-blue-500 shadow-inner'}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Confirmar Nova Senha</label>
                        <input 
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full p-5 rounded-2xl border-2 outline-none font-bold ${theme === 'night' ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-100 focus:border-blue-500 shadow-inner'}`}
                        />
                      </div>
                    </div>
                    {recoveryError && <p className="text-red-500 text-[10px] font-black uppercase text-center">{recoveryError}</p>}
                    <button onClick={handleResetPassword} className={`w-full py-5 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all ${config.primary}`}>
                      Alterar Senha Agora
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
