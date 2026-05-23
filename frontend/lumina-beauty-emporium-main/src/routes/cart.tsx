import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, Tag, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { cartTotal, getCart, removeFromCart, updateQty, type CartItem } from "@/lib/cart";
import { calcShipping, FREE_SHIPPING_THRESHOLD, shippingLabel } from "@/lib/shipping";
import { calcDiscount, findCoupon, type Coupon } from "@/lib/coupon";

const COUPON_KEY = "lumina_applied_coupon";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const refresh = () => setItems(getCart());
    refresh();
    window.addEventListener("lumina-cart-change", refresh);
    // restore coupon if any
    try {
      const raw = localStorage.getItem(COUPON_KEY);
      if (raw) setCoupon(JSON.parse(raw));
    } catch {/* noop */}
    return () => window.removeEventListener("lumina-cart-change", refresh);
  }, []);

  const subtotal = cartTotal(items);
  const discount = calcDiscount(subtotal, coupon);
  const shipping = calcShipping(subtotal - discount);
  const total = Math.max(0, subtotal - discount + shipping);

  const persistCoupon = (c: Coupon | null) => {
    setCoupon(c);
    if (c) localStorage.setItem(COUPON_KEY, JSON.stringify(c));
    else localStorage.removeItem(COUPON_KEY);
  };

  const apply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setApplying(true);
    const c = await findCoupon(code);
    setApplying(false);
    if (!c) {
      toast.error("Cupom inválido ou expirado");
      return;
    }
    persistCoupon(c);
    setCode("");
    toast.success(`Cupom ${c.code} aplicado!`);
  };

  const missingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - (subtotal - discount));

  return (
    <div className="min-h-screen bg-hero">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
        <h1 className="font-display text-4xl">Meu Carrinho</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length === 0 ? "Seu carrinho está vazio" : `${items.length} ${items.length === 1 ? "item" : "itens"}`}
        </p>

        {items.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-border bg-card/50 p-16 text-center">
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Adicione produtos para continuar.</p>
            <Link
              to="/"
              className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:scale-105 transition-all"
            >
              Ver produtos
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-3">
              <ul className="space-y-3">
                {items.map((i) => (
                  <li
                    key={i.id}
                    className="flex gap-4 rounded-2xl border border-border/60 bg-card p-3 sm:p-4"
                  >
                    <img
                      src={i.image_url}
                      alt={i.name}
                      width={120}
                      height={120}
                      className="h-24 w-24 flex-none rounded-xl object-cover sm:h-28 sm:w-28"
                    />
                    <div className="flex flex-1 flex-col">
                      <h3 className="font-display text-base sm:text-lg">{i.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        R$ {i.price.toFixed(2).replace(".", ",")}
                      </p>
                      <div className="mt-auto flex items-center justify-between gap-3">
                        <div className="inline-flex items-center rounded-full border border-border">
                          <button onClick={() => updateQty(i.id, i.quantity - 1)} className="p-2 hover:bg-secondary rounded-l-full" aria-label="Diminuir">
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-[2rem] px-2 text-center text-sm font-semibold">{i.quantity}</span>
                          <button onClick={() => updateQty(i.id, i.quantity + 1)} className="p-2 hover:bg-secondary rounded-r-full" aria-label="Aumentar">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(i.id)} className="text-muted-foreground hover:text-destructive" aria-label="Remover">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {missingForFree > 0 && (
                <div className="rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm">
                  <p className="text-gold-foreground">
                    Falta apenas <strong>R$ {missingForFree.toFixed(2).replace(".", ",")}</strong> para você ganhar <strong>frete grátis</strong>!
                  </p>
                </div>
              )}
            </div>

            <aside className="h-fit space-y-4">
              <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
                <h2 className="font-display text-xl">Resumo</h2>

                <form onSubmit={apply} className="mt-4">
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-foreground/70">
                    <Tag className="h-3.5 w-3.5" /> Cupom de desconto
                  </label>
                  {coupon ? (
                    <div className="flex items-center justify-between rounded-lg border border-emerald-300/60 bg-emerald-50 px-3 py-2 text-sm">
                      <span className="flex items-center gap-2 font-semibold text-emerald-800">
                        <Check className="h-4 w-4" /> {coupon.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => { persistCoupon(null); toast.info("Cupom removido"); }}
                        className="text-emerald-800 hover:text-emerald-900"
                        aria-label="Remover cupom"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="DIGITE O CÓDIGO"
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm uppercase outline-none focus:border-primary/60"
                      />
                      <button
                        type="submit"
                        disabled={applying || !code.trim()}
                        className="rounded-lg bg-secondary px-4 py-2 text-xs font-semibold hover:bg-secondary/70 disabled:opacity-50"
                      >
                        Aplicar
                      </button>
                    </div>
                  )}
                </form>

                <dl className="mt-5 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd>R$ {subtotal.toFixed(2).replace(".", ",")}</dd>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <dt>Desconto</dt>
                      <dd>- R$ {discount.toFixed(2).replace(".", ",")}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Frete</dt>
                    <dd className={shipping === 0 ? "text-gold font-medium" : ""}>{shippingLabel(subtotal - discount)}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
                  <span className="font-semibold">Total</span>
                  <span className="font-display text-2xl font-semibold">
                    R$ {total.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <button
                  onClick={() => navigate({ to: "/checkout" })}
                  className="mt-6 flex w-full items-center justify-center rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:scale-[1.02]"
                >
                  Finalizar compra
                </button>
                <Link
                  to="/"
                  className="mt-2 flex w-full items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-secondary"
                >
                  Continuar comprando
                </Link>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
