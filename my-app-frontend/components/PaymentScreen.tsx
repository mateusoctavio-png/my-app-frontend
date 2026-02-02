
import React, { useState } from "react";
import { AppTheme, AppLanguage, SubscriptionPlan, User } from "../types";
import { THEME_CONFIG, TRANSLATIONS } from "../constants";
import { Check, CreditCard, ShieldCheck, Sparkles, Smartphone } from "lucide-react";

interface Props {
  theme: AppTheme;
  language: AppLanguage;
  user: User;
  isBlocking?: boolean;
  onLogout?: () => void;
  onRetryAccess?: () => void;

  // ✅ só para feedback visual
  status?: "idle" | "checking" | "granted" | "denied";
  error?: string | null;
}

const BACKEND_URL =
  (import.meta as any)?.env?.VITE_BACKEND_URL ||
  "https://stripe-backend-ency.onrender.com"; // ✅ troque se sua URL do Render for outra

const PRICE_IDS: Record<SubscriptionPlan, string> = {
  monthly: "price_1So6v8CJ7mMdErWwHG9Js6eL",
  semestral: "price_1So6uNCJ7mMdErWw8nR7AouU",
  annual: "price_1So4jTCJ7mMdErWw5VsOg0uf",
};

const PaymentScreen: React.FC<Props> = ({
  theme,
  language,
  user,
  isBlocking,
  onLogout,
  onRetryAccess,
  status,
  error,
}) => {
  const t = TRANSLATIONS[language];
  const config = THEME_CONFIG[theme];

  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const plans = [
    {
      id: "monthly" as SubscriptionPlan,
      name: t.planMonthly,
      price: "R$ 6,90 / mês",
      features: [t.cancelAnytime, t.autoRenew],
      badge: null as any,
    },
    {
      id: "semestral" as SubscriptionPlan,
      name: t.planSemestral,
      price: "R$ 19,90 (pagamento único)",
      features: [t.autoRenew, "Economize 15%"],
      badge: null as any,
    },
    {
      id: "annual" as SubscriptionPlan,
      name: t.planAnnual,
      price: "R$ 29,90 (pagamento único)",
      features: ["Melhor custo-benefício", "Acesso Prioritário"],
      badge: t.bestValue,
    },
  ];

  const startCheckout = async (planId: SubscriptionPlan) => {
    setErrorMsg(null);
    setLoadingPlan(planId);

    try {
      const priceId = PRICE_IDS[planId];
      const email = user.email;

      // ✅ volta para o app na mesma origem (Vercel/Preview)
      const returnUrl = window.location.origin;

      const res = await fetch(`${BACKEND_URL}/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, priceId, returnUrl }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("Erro do backend:", data);
        setErrorMsg(data?.error || "Falha ao iniciar checkout. Verifique o backend.");
        return;
      }

      if (!data?.url) {
        console.error("Resposta sem url:", data);
        setErrorMsg("Backend não retornou a URL do Stripe.");
        return;
      }

      // ✅ Produção: Stripe funciona em top-level, então redireciona na mesma aba
      (window.top ?? window).location.href = data.url;
    } catch (err) {
      console.error("Erro ao iniciar checkout:", err);
      setErrorMsg("Falha ao iniciar checkout. Verifique o backend.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div
      className={`p-8 lg:p-12 max-w-6xl mx-auto ${
        isBlocking ? "fixed inset-0 z-[100] bg-white dark:bg-slate-950 overflow-y-auto" : ""
      }`}
    >
      <div className="text-center mb-10">
        <div
          className={`mx-auto h-20 w-20 rounded-3xl ${config.primary} flex items-center justify-center text-white text-4xl font-bold shadow-2xl mb-6`}
        >
          My.
        </div>

        <h2 className="text-4xl font-black tracking-tight mb-3">Assinatura necessária</h2>
        <p className="text-slate-500 text-base max-w-2xl mx-auto">
          Seu acesso está bloqueado. Escolha um plano abaixo para continuar usando o app.
        </p>

        {(errorMsg || error) && (
          <p className="mt-4 text-sm font-black text-red-500">
            {errorMsg || error}
          </p>
        )}

        {status === "checking" && (
          <p className="mt-3 text-xs font-bold text-slate-500">
            Verificando acesso…
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative p-8 rounded-[40px] border-2 transition-all flex flex-col ${
              plan.id === "annual"
                ? `${config.border} shadow-2xl shadow-blue-500/10 bg-blue-50/50 dark:bg-blue-900/10`
                : "border-slate-100 dark:border-slate-800"
            }`}
          >
            {plan.badge && (
              <span
                className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-white shadow-lg ${config.primary}`}
              >
                {plan.badge}
              </span>
            )}

            <div className="flex-1">
              <h3 className="text-xl font-black mb-2 uppercase tracking-tight">{plan.name}</h3>
              <p className={`text-3xl font-black mb-6 ${config.text}`}>{plan.price}</p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                    <Check className={`min-w-[18px] ${config.text}`} size={18} /> {feat}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => startCheckout(plan.id)}
              disabled={loadingPlan === plan.id}
              className={`w-full py-4 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                plan.id === "annual"
                  ? `${config.primary} text-white hover:brightness-110`
                  : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              } ${loadingPlan === plan.id ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <Sparkles size={18} />
              {loadingPlan === plan.id ? "Abrindo..." : "Assinar agora"}
            </button>

            <p className="mt-3 text-xs text-slate-500 text-center">
              Após finalizar o pagamento, volte para esta aba e clique em “Já paguei — verificar novamente”.
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-3 max-w-md mx-auto">
        <button
          className="w-full py-4 rounded-2xl font-black border border-slate-200"
          onClick={onRetryAccess}
        >
          Já paguei — verificar novamente
        </button>

        <button
          className="w-full py-4 rounded-2xl font-black border border-slate-200"
          onClick={onLogout}
        >
          Sair
        </button>
      </div>

      <div className="mt-12 text-center">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-6">
          Pagamento Seguro com
        </p>
        <div className="flex justify-center items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2 font-black text-xl">
            <Smartphone size={24} /> Apple Pay
          </div>
          <div className="flex items-center gap-2 font-black text-xl">
            <CreditCard size={24} /> Google Pay
          </div>
          <div className="flex items-center gap-2 font-black text-xl">
            <ShieldCheck size={24} /> Stripe
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;
