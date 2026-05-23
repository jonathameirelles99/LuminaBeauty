import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Package, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

export const Route = createFileRoute("/minha-conta")({
  component: MyAccountPage,
});

type Order = {
  id: string;
  created_at: string;
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  payment_method: string;
  coupon_code: string | null;
  items: { name: string; quantity: number; price: number }[];
};

const statusStyles: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-800",
  pago: "bg-emerald-100 text-emerald-800",
  enviado: "bg-blue-100 text-blue-800",
  entregue: "bg-primary/15 text-primary",
  cancelado: "bg-red-100 text-red-800",
};

const paymentLabels: Record<string, string> = {
  pix: "PIX",
  credit: "Cartão de crédito",
  debit: "Cartão de débito",
};

function MyAccountPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/login", search: { redirect: "/minha-conta" } });
      return;
    }
    api.getOrders()
      .then((data) => { setOrders(data as Order[]); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, authLoading, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("lumina_token");
    localStorage.removeItem("lumina_user");
    window.dispatchEvent(new Event("lumina-auth-change"));
    toast.success("Sessão encerrada");
    navigate({ to: "/" });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-hero">
        <Header />
        <div className="p-12 text-center text-muted-foreground">Carregando…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl">Minha Conta</h1>
            <p className="mt-1 text-sm text-muted-foreground">Olá{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""} — bem-vinda de volta</p>
          </div>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>

        <section className="mt-8 rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <UserIcon className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl">Dados pessoais</h2>
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Nome</dt>
              <dd className="mt-0.5">{user?.fullName || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">E-mail</dt>
              <dd className="mt-0.5">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Telefone</dt>
              <dd className="mt-0.5">{user?.phone || "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="mt-8">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl">Meus pedidos</h2>
          </div>

          {orders.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
              <p className="text-muted-foreground">Você ainda não fez nenhum pedido.</p>
              <Link to="/" className="mt-4 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:scale-105 transition-all">
                Começar a comprar
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {orders.map((o) => (
                <details key={o.id} className="group rounded-2xl border border-border/60 bg-card p-4">
                  <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-sm">{new Date(o.created_at).toLocaleString("pt-BR")} · {paymentLabels[o.payment_method] || o.payment_method}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyles[o.status] || "bg-secondary"}`}>{o.status}</span>
                      <span className="font-display text-lg font-semibold">R$ {Number(o.total).toFixed(2).replace(".", ",")}</span>
                    </div>
                  </summary>
                  <div className="mt-4 border-t border-border/60 pt-4 text-sm">
                    <ul className="space-y-1">
                      {o.items.map((it, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{it.quantity}× {it.name}</span>
                          <span>R$ {(it.price * it.quantity).toFixed(2).replace(".", ",")}</span>
                        </li>
                      ))}
                    </ul>
                    <dl className="mt-3 space-y-1 border-t border-border/60 pt-3 text-xs">
                      <Row label="Subtotal" value={`R$ ${Number(o.subtotal).toFixed(2).replace(".", ",")}`} />
                      <Row label="Frete" value={Number(o.shipping) === 0 ? "Grátis" : `R$ ${Number(o.shipping).toFixed(2).replace(".", ",")}`} />
                      {Number(o.discount) > 0 && (
                        <Row label={`Desconto${o.coupon_code ? ` (${o.coupon_code})` : ""}`} value={`- R$ ${Number(o.discount).toFixed(2).replace(".", ",")}`} />
                      )}
                    </dl>
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
