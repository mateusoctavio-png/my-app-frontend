
import React, { useEffect, useMemo, useState } from "react";
import {
  AppTheme,
  AppLanguage,
  User,
  Task,
  Note,
  Goal,
  Notebook,
  Habit,
  ImportantDate,
  QuickNote,
  CategoryItem,
  Expense,
  Article,
} from "./types";

import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import GeneralCategory from "./components/GeneralCategory";
import FocusSection from "./components/FocusSection";
import TrashSection from "./components/TrashSection";
import TutorialSection from "./components/TutorialSection";
import HabitTracker from "./components/HabitTracker";
import PaymentScreen from "./components/PaymentScreen";
import ProfileSection from "./components/ProfileSection";

const BACKEND_URL = "https://stripe-backend-ency.onrender.com";

// ✅ tipo local (não depende de outros arquivos)
type AccessStatus = "idle" | "checking" | "granted" | "denied";

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [theme, setTheme] = useState<AppTheme>("blue");
  const [language, setLanguage] = useState<AppLanguage>("pt");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");

type AccessStatus = "idle" | "checking" | "granted" | "denied";

// ✅ Controle de acesso pelo backend
const [accessStatus, setAccessStatus] = useState<AccessStatus>("idle");
const [accessError, setAccessError] = useState<string | null>(null);


  // Estados Globais
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [allGoals, setAllGoals] = useState<Goal[]>([]);
  const [allNotebooks, setAllNotebooks] = useState<Notebook[]>([]);
  const [allHabits, setAllHabits] = useState<Habit[]>([]);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
  const [allTutorials, setAllTutorials] = useState<any[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [categoryConfigs, setCategoryConfigs] = useState<CategoryItem[]>([]);

  const getTodayISO = () => {
    return new Date().toLocaleDateString("sv-SE", {
      timeZone: "America/Sao_Paulo",
    });
  };

  const initialDynamicCategories = [
    "work",
    "college",
    "reading",
    "training",
    "media",
    "finances",
    "goals",
    "diet",
    "health",
    "leisure",
    "marriage",
    "relationship",
    "ideas",
    "travel",
    "studies",
    "devotional",
    "commitments",
  ];

  // ✅ Checar acesso no backend (retorna boolean)
  const checkAccess = async (email: string): Promise<boolean> => {
  setAccessStatus("checking");
  setAccessError(null);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(
      `${BACKEND_URL}/access?email=${encodeURIComponent(email)}`,
      {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      }
    );

    const data = await res.json().catch(() => null);

    if (!res.ok || !data) {
      setAccessStatus("denied");
      setAccessError("Falha ao verificar acesso (backend).");
      return false;
    }

    const ok = data.has_access === true;

    setAccessStatus(ok ? "granted" : "denied");
    return ok;
  } catch (err: any) {
    setAccessStatus("denied");
    setAccessError(
      err?.name === "AbortError"
        ? "Tempo esgotado ao verificar acesso."
        : "Falha ao verificar acesso."
    );
    return false;
  } finally {
    clearTimeout(timeout);
  }
};


  // ✅ Recuperar sessão
  useEffect(() => {
    const savedSession = localStorage.getItem("my_app_session");
    if (savedSession) {
      try {
        const userData = JSON.parse(savedSession);
        setUser(userData);
        setIsLoggedIn(true);
      } catch (e) {
        console.error("Erro ao restaurar sessão:", e);
        localStorage.removeItem("my_app_session");
      }
    }
  }, []);

  // ✅ Sempre que logar, checa acesso
  useEffect(() => {
    if (isLoggedIn && user?.email) {
      checkAccess(user.email);
    } else {
      setAccessStatus("idle");
      setAccessError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user?.email]);

  // ✅ Retorno do Stripe (opção B): retry confirmando checkout-status e depois checa acesso
  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const checkout = params.get("checkout");
  const sessionId = params.get("session_id");

  if (checkout !== "success" || !sessionId || !user?.email) return;

  const confirm = async () => {
    try {
      await fetch(
        `${BACKEND_URL}/checkout-status?session_id=${encodeURIComponent(sessionId)}`,
        {
          headers: {
            Accept: "application/json"
          },
        }
      );

      // força nova checagem de acesso
      await checkAccess(user.email);

      // limpa URL
      window.history.replaceState({}, "", window.location.pathname);
    } catch (e) {
      console.error("Erro ao confirmar checkout:", e);
    }
  };

  confirm();
}, [user?.email]);


  // ✅ Carregar dados quando loga (seu original)
  useEffect(() => {
    if (isLoggedIn && user) {
      const userKey = `my_app_data_${user.email}`;
      const savedData = localStorage.getItem(userKey);

      const globalContentKey = "my_app_global_content";
      const savedGlobal = localStorage.getItem(globalContentKey);

      const defaultTutorials = [
        {
          id: "1",
          title: "Dashboard",
          desc: "Sua central de comando. Visualize prioridades, calendários e use o Pomodoro para focar.",
          icon: "Layers",
        },
        {
          id: "2",
          title: "Categorias Gerais",
          desc: "Cada área da vida tem 4 módulos: Tarefas, Notas, Metas e Caderno. Explore as abas no topo de cada categoria.",
          icon: "CheckCircle",
        },
        {
          id: "3",
          title: "Master User",
          desc: "Usuários master podem postar artigos na seção 'Precisa de mais foco?'.",
          icon: "Smartphone",
        },
        {
          id: "4",
          title: "Bíblia NVI",
          desc: "Acesse a Bíblia Sagrada na aba Devocionais para sua leitura diária.",
          icon: "Info",
        },
      ];

      const defaultArticles = [
        {
          id: "1",
          title: "A Arte da Hiperfocalização",
          content: "Texto...",
          author: "Equipe My.",
          date: new Date(),
        },
        {
          id: "2",
          title: "Rotinas Matinais de Sucesso",
          content: "Texto...",
          author: "Equipe My.",
          date: new Date(),
        },
      ];

      if (savedGlobal) {
        const parsedGlobal = JSON.parse(savedGlobal);
        setAllTutorials(parsedGlobal.tutorials || defaultTutorials);
        setAllArticles(parsedGlobal.articles || defaultArticles);
      } else {
        setAllTutorials(defaultTutorials);
        setAllArticles(defaultArticles);
      }

      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setAllTasks(parsed.tasks || []);
          setAllNotes(parsed.notes || []);
          setAllGoals(parsed.goals || []);
          setAllNotebooks(parsed.notebooks || []);
          setAllHabits(parsed.habits || []);
          setAllExpenses(parsed.expenses || []);
          setImportantDates(parsed.importantDates || []);
          setQuickNotes(parsed.quickNotes || []);

          if (parsed.categoryConfigs && parsed.categoryConfigs.length > 0) {
            setCategoryConfigs(parsed.categoryConfigs);
          } else {
            setCategoryConfigs(
              initialDynamicCategories.map((id, idx) => ({
                id,
                isPinned: false,
                order: idx,
              }))
            );
          }
        } catch (e) {
          console.error("Erro ao carregar dados do usuário:", e);
        }
      } else {
        setAllTasks([
          {
            id: "1",
            title: "Configurar meu Perfil",
            categoryId: "commitments",
            priority: "high",
            dueDate: getTodayISO(),
            completed: false,
          },
        ]);
        setAllNotes([]);
        setAllGoals([]);
        setAllNotebooks([]);
        setAllHabits([]);
        setAllExpenses([]);
        setImportantDates([]);
        setQuickNotes([
          {
            id: "1",
            content:
              "Bem-vindo ao My! Seus dados agora são salvos automaticamente e privados.",
            color: "bg-blue-100 dark:bg-blue-900/30",
          },
        ]);
        setCategoryConfigs(
          initialDynamicCategories.map((id, idx) => ({
            id,
            isPinned: false,
            order: idx,
          }))
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user?.email]);

  // ✅ Salvar dados automaticamente
  useEffect(() => {
    if (isLoggedIn && user) {
      const userKey = `my_app_data_${user.email}`;
      const dataToSave = {
        tasks: allTasks,
        notes: allNotes,
        goals: allGoals,
        notebooks: allNotebooks,
        habits: allHabits,
        expenses: allExpenses,
        importantDates,
        quickNotes,
        categoryConfigs,
      };
      localStorage.setItem(userKey, JSON.stringify(dataToSave));

      const globalContentKey = "my_app_global_content";
      localStorage.setItem(
        globalContentKey,
        JSON.stringify({ tutorials: allTutorials, articles: allArticles })
      );
    }
  }, [
    allTasks,
    allNotes,
    allGoals,
    allNotebooks,
    allHabits,
    allExpenses,
    importantDates,
    quickNotes,
    categoryConfigs,
    allTutorials,
    allArticles,
    isLoggedIn,
    user?.email,
  ]);

  useEffect(() => {
    if (theme === "night")
      document.body.classList.add("bg-slate-950", "text-white");
    else document.body.classList.remove("bg-slate-950", "text-white");
  }, [theme]);

  const toggleLanguage = () => setLanguage((prev) => (prev === "pt" ? "en" : "pt"));

  const handleLogin = (nickname: string, email: string) => {
    const isMaster = email.toLowerCase() === "mateus.octavio@gmail.com";
    const userData: any = {
      nickname,
      email,
      isMaster,
      createdAt: new Date().toISOString(),
      subscriptionPlan: undefined,
    };
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem("my_app_session", JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem("my_app_session");
    setIsLoggedIn(false);
    setUser(null);
    setCurrentView("home");
    setAllTasks([]);
    setAllNotes([]);
    setAllGoals([]);
    setAllNotebooks([]);
    setAllHabits([]);
    setAllExpenses([]);
    setImportantDates([]);
    setQuickNotes([]);
    setCategoryConfigs([]);
    setSearchQuery("");
    setAccessStatus("idle");
    setAccessError(null);
  };

  const handleDeleteAccount = () => {
    if (!user) return;

    const users = JSON.parse(localStorage.getItem("my_app_users") || "[]");
    const updatedUsers = users.filter(
      (u: any) => u.email.toLowerCase() !== user.email.toLowerCase()
    );
    localStorage.setItem("my_app_users", JSON.stringify(updatedUsers));

    localStorage.removeItem(`my_app_data_${user.email}`);
    localStorage.removeItem(`my_app_hero_${user.email}`);

    handleLogout();
  };

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();

    const taskMatches = allTasks
      .filter((t) => !t.deletedAt && t.title.toLowerCase().includes(q))
      .map((t) => ({ ...t, _type: "task" }));

    const dateMatches = importantDates
      .filter((d) => d.title.toLowerCase().includes(q))
      .map((d) => ({ ...d, _type: "date", categoryId: "commitments" }));

    return [...taskMatches, ...dateMatches];
  }, [searchQuery, allTasks, importantDates]);

  // ✅ Login sempre aparece
  if (!isLoggedIn) {
    return (
      <Login
        theme={theme}
        language={language}
        onLogin={handleLogin}
        setTheme={setTheme}
        toggleLanguage={toggleLanguage}
      />
    );
  }

  // ✅ Acesso negado => tela de planos
  if (accessStatus !== "granted") {
  return (
    <PaymentScreen
      theme={theme}
      language={language}
      user={user!}
      isBlocking
      onLogout={handleLogout}
      onRetryAccess={() => checkAccess(user!.email)}
    />
  );
}


  // ✅ Acesso liberado => app normal
  const renderView = () => {
    if (currentView === "home")
      return (
        <Dashboard
          theme={theme}
          language={language}
          user={user}
          tasks={allTasks}
          setTasks={setAllTasks}
          importantDates={importantDates}
          setImportantDates={setImportantDates}
          quickNotes={quickNotes}
          setQuickNotes={setQuickNotes}
          allGoals={allGoals}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          setCurrentView={setCurrentView}
        />
      );

    if (currentView === "focus")
      return (
        <FocusSection
          user={user}
          theme={theme}
          language={language}
          articles={allArticles}
          setArticles={setAllArticles}
        />
      );

    if (currentView === "trash")
      return (
        <TrashSection
          theme={theme}
          language={language}
          tasks={allTasks}
          setTasks={setAllTasks}
          notes={allNotes}
          setNotes={setAllNotes}
          goals={allGoals}
          setGoals={setAllGoals}
          notebooks={allNotebooks}
          setAllNotebooks={setAllNotebooks}
          expenses={allExpenses}
          setAllExpenses={setAllExpenses}
        />
      );

    if (currentView === "tutorial")
      return (
        <TutorialSection
          theme={theme}
          language={language}
          user={user}
          tutorials={allTutorials}
          setTutorials={setAllTutorials}
        />
      );

    if (currentView === "profile")
      return (
        <ProfileSection
          theme={theme}
          language={language}
          user={user!}
          setUser={setUser}
          setTheme={setTheme}
          toggleLanguage={toggleLanguage}
          onDeleteAccount={handleDeleteAccount}
          policies={{
            privacy: "Política de Privacidade",
            terms: "Termos de Uso",
            safety: "Segurança",
          }}
          setPolicies={() => {}}
        />
      );

    if (currentView === "habits")
      return (
        <HabitTracker
          theme={theme}
          language={language}
          habits={allHabits}
          setHabits={setAllHabits}
        />
      );

    if (initialDynamicCategories.includes(currentView)) {
      return (
        <GeneralCategory
          categoryId={currentView}
          theme={theme}
          language={language}
          allTasks={allTasks}
          setAllTasks={setAllTasks}
          allNotes={allNotes}
          setAllNotes={setAllNotes}
          allGoals={allGoals}
          setAllGoals={setAllGoals}
          allNotebooks={allNotebooks}
          setAllNotebooks={setAllNotebooks}
          allExpenses={allExpenses}
          setAllExpenses={setAllExpenses}
        />
      );
    }

    return (
      <div className="p-12 text-center text-slate-400 font-bold">
        Em breve no My.
      </div>
    );
  };

  return (
    <div
      className={`flex h-screen overflow-hidden ${
        theme === "night"
          ? "bg-slate-950 text-white"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      <Sidebar
        theme={theme}
        language={language}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        setTheme={setTheme}
        toggleLanguage={toggleLanguage}
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        onLogout={handleLogout}
        categoryConfigs={categoryConfigs}
        setCategoryConfigs={setCategoryConfigs}
      />

      <main className="flex-1 relative overflow-y-auto overflow-x-hidden custom-scrollbar">
        {renderView()}
      </main>

      {accessError && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[420px] bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl font-bold text-sm shadow-lg">
          {accessError}
        </div>
      )}
    </div>
  );
};

export default App;


