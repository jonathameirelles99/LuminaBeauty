import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { api } from "@/lib/api";

type Search = { redirect?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/login" });
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { token, user } = await api.register({ email, password, full_name: fullName, phone });
        localStorage.setItem("lumina_token", token);
        localStorage.setItem("lumina_user", JSON.stringify(user));
        window.dispatchEvent(new Event("lumina-auth-change"));
        toast.success("Cadastro realizado!");
        setLoading(false);
        navigate({ to: "/minha-conta" });
      } else {
        const { token, user } = await api.login(email, password);
        localStorage.setItem("lumina_token", token);
        localStorage.setItem("lumina_user", JSON.stringify(user));
        window.dispatchEvent(new Event("lumina-auth-change"));
        toast.success("Bem-vinda de volta!");
        setLoading(false);
        // Admin vai direto para o painel
        if (user.role === "admin") {
          navigate({ to: "/admin" });
        } else if (redirect && redirect.startsWith("/")) {
          navigate({ to: redirect });
        } else {
          navigate({ to: "/minha-conta" });
        }
      }
    } catch (error) {
      setLoading(false);
      toast.error(error instanceof Error ? error.message : "Não foi possível entrar");
    }
  };

  return (
    <div className="min-h-screen bg-hero">
      <Header />
      <main className="mx-auto flex max-w-md flex-col px-4 py-12 lg:px-8">
        <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-elegant">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mt-5 text-center font-display text-3xl">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            {mode === "login"
              ? "Acesse para acompanhar seus pedidos"
              : "Crie sua conta Lumina em segundos"}
          </p>

          <div className="mt-6 inline-flex w-full rounded-full bg-secondary p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all ${mode === "login" ? "bg-card shadow-soft" : "text-muted-foreground"}`}
            >
              Entrar
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all ${mode === "signup" ? "bg-card shadow-soft" : "text-muted-foreground"}`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <>
                <Field label="Nome completo *">
                  <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} />
                </Field>
                <Field label="Telefone">
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="(11) 99999-9999" />
                </Field>
              </>
            )}
            <Field label="E-mail *">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Senha *">
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
            </Field>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-foreground/70">{label}</span>
      {children}
    </label>
  );
}
