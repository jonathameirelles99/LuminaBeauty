import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Truck, Tag, CreditCard } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

type LastOrder = {
  id: string;
  customer_name: string;
  customer_email: string;
  items: { id: string; name: string; quantity: number; price: number }[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  payment_method: "pix" | "credit" | "debit";
};

const paymentLabels: Record<string, string> = {
  pix: "PIX",
  credit: "Cartão de crédito",
  debit: "Cartão de débito",
};

export const Route = createFileRoute("/confirmacao")({
  component: ConfirmacaoPage,
});

function ConfirmacaoPage() {
  const [order, setOrder] = useState<LastOrder | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("lumina_last_order");
    if (raw) setOrder(JSON.parse(raw));
  }, []);

  const handleCancel = async () => {
    if (!order) return;
    if (!confirm("Tem certeza que deseja cancelar este pedido?")) return;
    setCancelling(true);
    try {
      await fetch(`http://localhost:5000/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("lumina_token")}`,
        },
        body: JSON.stringify({ Status: "cancelado" }),
      });
      localStorage.removeItem("lumina_last_order");
      alert("Pedido cancelado com sucesso.");
      window.location.href = "/";
    } catch {
      alert("Erro ao cancelar o pedido.");
    }
    setCancelling(false);
  };

  return (
    <div className="min-h-screen bg-hero">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
        <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-elegant sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="mt-6 text-center font-display text-4xl">Pedido confirmado!</h1>
          <p className="mt-3 text-center text-muted-foreground">
            Obrigada pela sua compra{order?.customer_name ? `, ${order.customer_name.split(" ")[0]}` : ""}.
            {order?.payment_method === "pix"
              ? " Conclua o pagamento via PIX para iniciarmos o envio."
              : " Você receberá um e-mail com as informações de rastreamento em breve."}
          </p>

          {order && (
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-blush/40 p-4 text-center">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Pedido</p>
                <p className="mt-1 font-mono text-sm font-semibold">#{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="rounded-2xl bg-blush/40 p-4 text-center">
                <CreditCard className="mx-auto mb-1 h-4 w-4 text-primary" />
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Pagamento</p>
                <p className="mt-1 text-sm font-semibold">{paymentLabels[order.payment_method]}</p>
              </div>
              <div className="rounded-2xl bg-blush/40 p-4 text-center">
                <Truck className="mx-auto mb-1 h-4 w-4 text-primary" />
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Entrega</p>
                <p className="mt-1 text-sm font-semibold">5–10 dias úteis</p>
              </div>
            </div>
          )}

          {order && (
            <div className="mt-6 rounded-2xl border border-border/60 p-5">
              <h2 className="font-display text-lg">Resumo</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {order.items.map((i) => (
                  <li key={i.id} className="flex justify-between">
                    <span>{i.quantity}× {i.name}</span>
                    <span>R$ {(i.price * i.quantity).toFixed(2).replace(".", ",")}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-1 border-t border-border/60 pt-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>R$ {order.subtotal.toFixed(2).replace(".", ",")}</dd>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <dt className="flex items-center gap-1"><Tag className="h-3.5 w-3.5" /> Desconto{order.coupon_code ? ` (${order.coupon_code})` : ""}</dt>
                    <dd>- R$ {order.discount.toFixed(2).replace(".", ",")}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Frete</dt>
                  <dd>{order.shipping === 0 ? "Grátis" : `R$ ${order.shipping.toFixed(2).replace(".", ",")}`}</dd>
                </div>
              </dl>
              <div className="mt-3 flex items-baseline justify-between border-t border-border/60 pt-3">
                <span className="font-semibold">Total</span>
                <span className="font-display text-xl font-semibold">R$ {order.total.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/minha-conta"
              className="inline-flex rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft hover:scale-105 transition-all"
            >
              Acompanhar pedido
            </Link>
            <Link
              to="/"
              className="inline-flex rounded-full border border-border px-7 py-3.5 text-sm font-medium hover:bg-secondary"
            >
              Voltar à loja
            </Link>
            {order && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="inline-flex rounded-full border border-destructive/40 px-7 py-3.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all disabled:opacity-50"
              >
                {cancelling ? "Cancelando…" : "Cancelar pedido"}
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 