import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, ShoppingBag, User as UserIcon, MapPin, CreditCard, Minus, Plus, Trash2, Copy, QrCode, ArrowRight, ArrowLeft, Clock } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { cartTotal, clearCart, getCart, removeFromCart, updateQty, type CartItem } from "@/lib/cart";
import { calcShipping, fetchCep, maskCep, shippingLabel } from "@/lib/shipping";
import {
  generateFakePixPayload,
  maskCardNumber,
  maskCvv,
  maskExpiry,
  validateCardNumber,
  validateCvv,
  validateExpiry,
  type PaymentMethod,
} from "@/lib/payment";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

const COUPON_KEY = "lumina_applied_coupon";
const PIX_TIMEOUT = 5 * 60; // 5 minutos em segundos

type Coupon = {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
};

function calcDiscount(subtotal: number, coupon: Coupon | null): number {
  if (!coupon) return 0;
  if (coupon.discount_type === "percent") {
    return Math.min(subtotal, +(subtotal * (coupon.discount_value / 100)).toFixed(2));
  }
  return Math.min(subtotal, coupon.discount_value);
}

type Step = 0 | 1 | 2 | 3 | 4; // 4 = aguardando PIX
const STEPS = [
  { label: "Carrinho", icon: ShoppingBag },
  { label: "Dados", icon: UserIcon },
  { label: "Endereço", icon: MapPin },
  { label: "Pagamento", icon: CreditCard },
];

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState<Step>(0);
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [pixOrderId, setPixOrderId] = useState<string | null>(null);
  const [pixPayload, setPixPayload] = useState<string>("");
  const [pixTimer, setPixTimer] = useState(PIX_TIMEOUT);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [data, setData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    payment_method: "pix" as PaymentMethod,
    card_number: "",
    card_name: "",
    card_expiry: "",
    card_cvv: "",
  });

  const [cepLoading, setCepLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setItems(getCart());
    const refresh = () => setItems(getCart());
    window.addEventListener("lumina-cart-change", refresh);
    try {
      const raw = localStorage.getItem(COUPON_KEY);
      if (raw) setCoupon(JSON.parse(raw));
    } catch {/* noop */}
    return () => window.removeEventListener("lumina-cart-change", refresh);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) navigate({ to: "/login", search: { redirect: "/checkout" } });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user || profileLoaded) return;
    setData((d) => ({
      ...d,
      customer_email: user.email || d.customer_email,
      customer_name: user.fullName || user.full_name || d.customer_name,
      customer_phone: user.phone || d.customer_phone,
    }));
    setProfileLoaded(true);
  }, [user, profileLoaded]);

  // Timer do PIX
  useEffect(() => {
    if (step !== 4) return;
    setPixTimer(PIX_TIMEOUT);
    timerRef.current = setInterval(() => {
      setPixTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          // Cancela o pedido e volta ao carrinho
          if (pixOrderId) {
            api.updateOrderStatus(pixOrderId, "cancelado").catch(() => {});
          }
          toast.error("Tempo de pagamento expirado. Seu pedido foi cancelado.");
          navigate({ to: "/" });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [step]);

  const subtotal = useMemo(() => cartTotal(items), [items]);
  const discount = useMemo(() => calcDiscount(subtotal, coupon), [subtotal, coupon]);
  const shipping = useMemo(() => calcShipping(subtotal - discount), [subtotal, discount]);
  const total = useMemo(() => Math.max(0, subtotal - discount + shipping), [subtotal, discount, shipping]);

  const handleCepBlur = async () => {
    const clean = data.cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    setCepLoading(true);
    const r = await fetchCep(clean);
    setCepLoading(false);
    if (!r) { toast.error("CEP não encontrado"); return; }
    setData((d) => ({ ...d, street: r.logradouro || d.street, neighborhood: r.bairro || d.neighborhood, city: r.localidade || d.city, state: r.uf || d.state }));
  };

  const canAdvance = (): string | null => {
    if (step === 0) { if (items.length === 0) return "Adicione produtos ao carrinho"; return null; }
    if (step === 1) {
      if (data.customer_name.trim().length < 2) return "Informe seu nome completo";
      if (!/^\S+@\S+\.\S+$/.test(data.customer_email)) return "E-mail inválido";
      if (data.customer_phone.replace(/\D/g, "").length < 8) return "Telefone inválido";
      return null;
    }
    if (step === 2) {
      if (data.cep.replace(/\D/g, "").length !== 8) return "Informe um CEP válido";
      if (!data.street.trim()) return "Informe a rua";
      if (!data.number.trim()) return "Informe o número";
      if (!data.neighborhood.trim()) return "Informe o bairro";
      if (!data.city.trim()) return "Informe a cidade";
      if (!data.state.trim()) return "Informe o estado";
      return null;
    }
    if (step === 3) {
      if (data.payment_method === "pix") return null;
      if (!data.card_name.trim()) return "Informe o nome no cartão";
      if (!validateCardNumber(data.card_number)) return "Número do cartão inválido";
      if (!validateExpiry(data.card_expiry)) return "Validade inválida (use MM/AA)";
      if (!validateCvv(data.card_cvv)) return "CVV inválido";
      return null;
    }
    return null;
  };

  const next = () => { const err = canAdvance(); if (err) { toast.error(err); return; } setStep((s) => (s + 1) as Step); };
  const prev = () => setStep((s) => Math.max(0, s - 1) as Step);

  const submit = async () => {
    const err = canAdvance();
    if (err) { toast.error(err); return; }
    if (!user) return;
    setSubmitting(true);
    const shipping_address = `${data.street}, ${data.number}${data.complement ? " - " + data.complement : ""} - ${data.neighborhood}, ${data.city}/${data.state} - CEP ${data.cep}`;
    try {
      const order = await api.createOrder({
        user_id: user.id,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone || null,
        shipping_address,
        cep: data.cep,
        street: data.street,
        number: data.number,
        complement: data.complement || null,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        subtotal, shipping, discount,
        coupon_code: coupon?.code || null,
        total,
        payment_method: data.payment_method,
      });

      localStorage.setItem("lumina_last_order", JSON.stringify({
        id: order.id, customer_name: data.customer_name, customer_email: data.customer_email,
        items, subtotal, shipping, discount, total, coupon_code: coupon?.code || null, payment_method: data.payment_method,
      }));

      clearCart();
      localStorage.removeItem(COUPON_KEY);
      setSubmitting(false);

      if (data.payment_method === "pix") {
        setPixOrderId(order.id);
        setPixPayload(generateFakePixPayload(order.id, total));
        setStep(4);
      } else {
        navigate({ to: "/confirmacao" });
      }
    } catch {
      toast.error("Erro ao criar pedido");
      setSubmitting(false);
    }
  };

  const confirmPixPayment = async () => {
    if (!pixOrderId) return;
    clearInterval(timerRef.current!);
    await api.updateOrderStatus(pixOrderId, "pago").catch(() => {});
    navigate({ to: "/confirmacao" });
  };

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  if (authLoading || !user) {
    return <div className="min-h-screen bg-hero"><Header /><div className="p-12 text-center text-muted-foreground">Carregando…</div></div>;
  }

  // Tela de aguardo do PIX
  if (step === 4) {
    const pct = (pixTimer / PIX_TIMEOUT) * 100;
    const urgent = pixTimer <= 60;
    return (
      <div className="min-h-screen bg-hero">
        <Header />
        <main className="mx-auto max-w-lg px-4 py-12 lg:px-8">
          <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-elegant text-center">
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${urgent ? "bg-destructive/10" : "bg-primary/10"}`}>
              <Clock className={`h-8 w-8 ${urgent ? "text-destructive" : "text-primary"}`} />
            </div>
            <h2 className="mt-4 font-display text-2xl">Aguardando pagamento PIX</h2>
            <p className="mt-1 text-sm text-muted-foreground">Escaneie o QR Code ou use o código abaixo</p>

            {/* Timer */}
            <div className={`mt-4 text-3xl font-mono font-bold ${urgent ? "text-destructive" : "text-primary"}`}>
              {formatTimer(pixTimer)}
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${urgent ? "bg-destructive" : "bg-primary"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {urgent && <p className="mt-2 text-xs font-medium text-destructive">⚠️ Menos de 1 minuto restante!</p>}

            {/* QR Code */}
            <div className="mt-6 flex justify-center">
              <div className="rounded-xl bg-white p-4 shadow-soft">
                <QRCodeSVG value={pixPayload} size={180} level="M" />
              </div>
            </div>

            {/* Copia e cola */}
            <div className="mt-4 flex items-stretch gap-2">
              <code className="flex-1 truncate rounded-lg bg-secondary px-3 py-2 font-mono text-xs text-left">{pixPayload}</code>
              <button
                onClick={async () => { try { await navigator.clipboard.writeText(pixPayload); toast.success("Código PIX copiado!"); } catch { toast.error("Não foi possível copiar"); } }}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:scale-105 transition-all"
              >
                <Copy className="h-3.5 w-3.5" /> Copiar
              </button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground italic">Demonstração — nenhum valor é cobrado de verdade.</p>

            {/* Botão simular pagamento */}
            <button
              onClick={confirmPixPayment}
              className="mt-6 w-full rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-soft hover:scale-[1.02] transition-all"
            >
              ✓ Simular pagamento realizado
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-12">
        <h1 className="font-display text-3xl sm:text-4xl">Finalizar Compra</h1>
        <Stepper step={step} onSelect={(s) => { if (s < step) setStep(s); }} />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="rounded-2xl border border-border/60 bg-card p-5 sm:p-7 shadow-soft">
            {step === 0 && <CartStep items={items} />}
            {step === 1 && <DataStep data={data} setData={setData} />}
            {step === 2 && <AddressStep data={data} setData={setData} cepLoading={cepLoading} onCepBlur={handleCepBlur} />}
            {step === 3 && <PaymentStep data={data} setData={setData} total={total} />}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              {step > 0 ? (
                <button onClick={prev} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-secondary">
                  <ArrowLeft className="h-4 w-4" /> Voltar
                </button>
              ) : <span />}
              {step < 3 ? (
                <button onClick={next} disabled={items.length === 0} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:scale-[1.02] transition-all disabled:opacity-50">
                  Continuar <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={submit} disabled={submitting} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:scale-[1.02] transition-all disabled:opacity-50">
                  {submitting ? "Processando…" : "Confirmar pedido"} <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          </section>
          <Summary items={items} subtotal={subtotal} discount={discount} shipping={shipping} total={total} coupon={coupon} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Stepper({ step, onSelect }: { step: Step; onSelect: (s: Step) => void }) {
  return (
    <ol className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const isActive = i === step;
        const isDone = i < step;
        return (
          <li key={s.label} className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => isDone && onSelect(i as Step)} disabled={!isDone}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all ${isActive ? "bg-primary text-primary-foreground shadow-soft scale-110" : isDone ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-secondary text-muted-foreground"}`}>
              {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </button>
            <span className={`text-xs font-medium sm:text-sm ${isActive ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
            {i < STEPS.length - 1 && <span className="hidden h-px w-6 bg-border sm:block" />}
          </li>
        );
      })}
    </ol>
  );
}

function CartStep({ items }: { items: CartItem[] }) {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Seu carrinho está vazio.</p>
        <Link to="/" className="mt-4 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft">Ver produtos</Link>
      </div>
    );
  }
  return (
    <div>
      <h2 className="font-display text-xl">Revise seus itens</h2>
      <ul className="mt-4 space-y-3">
        {items.map((i) => (
          <li key={i.id} className="flex items-center gap-4 rounded-xl border border-border/60 p-3">
            <img src={i.image_url} alt={i.name} className="h-16 w-16 flex-none rounded-lg object-cover" />
            <div className="flex-1">
              <p className="font-medium">{i.name}</p>
              <p className="text-xs text-muted-foreground">R$ {i.price.toFixed(2).replace(".", ",")}</p>
            </div>
            <div className="inline-flex items-center rounded-full border border-border">
              <button onClick={() => updateQty(i.id, i.quantity - 1)} className="p-1.5 hover:bg-secondary rounded-l-full"><Minus className="h-3 w-3" /></button>
              <span className="min-w-[2rem] px-1 text-center text-xs font-semibold">{i.quantity}</span>
              <button onClick={() => updateQty(i.id, i.quantity + 1)} className="p-1.5 hover:bg-secondary rounded-r-full"><Plus className="h-3 w-3" /></button>
            </div>
            <button onClick={() => removeFromCart(i.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DataStep({ data, setData }: { data: any; setData: any }) {
  return (
    <div>
      <h2 className="font-display text-xl">Seus dados</h2>
      <p className="mt-1 text-sm text-muted-foreground">Confirme as informações para entrega e contato.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Nome completo *" full><input required value={data.customer_name} onChange={(e) => setData({ ...data, customer_name: e.target.value })} className={inputCls} /></Field>
        <Field label="E-mail *"><input type="email" required value={data.customer_email} onChange={(e) => setData({ ...data, customer_email: e.target.value })} className={inputCls} /></Field>
        <Field label="Telefone *"><input required value={data.customer_phone} onChange={(e) => setData({ ...data, customer_phone: e.target.value })} placeholder="(11) 99999-9999" className={inputCls} /></Field>
      </div>
    </div>
  );
}

function AddressStep({ data, setData, cepLoading, onCepBlur }: any) {
  return (
    <div>
      <h2 className="font-display text-xl">Endereço de entrega</h2>
      <p className="mt-1 text-sm text-muted-foreground">Digite seu CEP para preenchimento automático.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-6">
        <Field label="CEP *" cls="sm:col-span-2">
          <div className="relative">
            <input required value={data.cep} onChange={(e) => setData({ ...data, cep: maskCep(e.target.value) })} onBlur={onCepBlur} placeholder="00000-000" className={inputCls} />
            {cepLoading && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">…</span>}
          </div>
        </Field>
        <Field label="Rua *" cls="sm:col-span-4"><input required value={data.street} onChange={(e) => setData({ ...data, street: e.target.value })} className={inputCls} /></Field>
        <Field label="Número *" cls="sm:col-span-2"><input required value={data.number} onChange={(e) => setData({ ...data, number: e.target.value })} className={inputCls} /></Field>
        <Field label="Complemento" cls="sm:col-span-4"><input value={data.complement} onChange={(e) => setData({ ...data, complement: e.target.value })} className={inputCls} placeholder="apto, bloco…" /></Field>
        <Field label="Bairro *" cls="sm:col-span-3"><input required value={data.neighborhood} onChange={(e) => setData({ ...data, neighborhood: e.target.value })} className={inputCls} /></Field>
        <Field label="Cidade *" cls="sm:col-span-2"><input required value={data.city} onChange={(e) => setData({ ...data, city: e.target.value })} className={inputCls} /></Field>
        <Field label="UF *" cls="sm:col-span-1"><input required maxLength={2} value={data.state} onChange={(e) => setData({ ...data, state: e.target.value.toUpperCase() })} className={inputCls} /></Field>
      </div>
    </div>
  );
}

function PaymentStep({ data, setData, total }: any) {
  const methods: { id: PaymentMethod; label: string }[] = [
    { id: "pix", label: "PIX" },
    { id: "credit", label: "Cartão de crédito" },
    { id: "debit", label: "Cartão de débito" },
  ];

  return (
    <div>
      <h2 className="font-display text-xl">Forma de pagamento</h2>
      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        {methods.map((m) => (
          <button key={m.id} type="button" onClick={() => setData({ ...data, payment_method: m.id })}
            className={`rounded-xl border p-3 text-sm font-medium transition-all ${data.payment_method === m.id ? "border-primary bg-primary/5 text-primary shadow-soft" : "border-border hover:bg-secondary"}`}>
            {m.label}
          </button>
        ))}
      </div>
      {data.payment_method === "pix" && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-medium">Após confirmar, você terá 5 minutos para pagar via PIX.</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">O pedido será cancelado automaticamente se não for pago no prazo.</p>
        </div>
      )}
      {(data.payment_method === "credit" || data.payment_method === "debit") && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Nome no cartão *" full><input required value={data.card_name} onChange={(e) => setData({ ...data, card_name: e.target.value.toUpperCase() })} className={inputCls} /></Field>
          <Field label="Número do cartão *" full><input required value={data.card_number} onChange={(e) => setData({ ...data, card_number: maskCardNumber(e.target.value) })} placeholder="0000 0000 0000 0000" className={inputCls} /></Field>
          <Field label="Validade (MM/AA) *"><input required value={data.card_expiry} onChange={(e) => setData({ ...data, card_expiry: maskExpiry(e.target.value) })} placeholder="MM/AA" maxLength={5} className={inputCls} /></Field>
          <Field label="CVV *"><input required value={data.card_cvv} onChange={(e) => setData({ ...data, card_cvv: maskCvv(e.target.value) })} placeholder="000" maxLength={4} className={inputCls} /></Field>
        </div>
      )}
    </div>
  );
}

function Summary({ items, subtotal, discount, shipping, total, coupon }: { items: CartItem[]; subtotal: number; discount: number; shipping: number; total: number; coupon: Coupon | null }) {
  return (
    <aside className="h-fit rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
      <h2 className="font-display text-xl">Seu pedido</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {items.map((i) => (
          <li key={i.id} className="flex justify-between gap-4">
            <span className="text-foreground/80">{i.quantity}× {i.name}</span>
            <span className="font-medium">R$ {(i.price * i.quantity).toFixed(2).replace(".", ",")}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>R$ {subtotal.toFixed(2).replace(".", ",")}</dd></div>
        {discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Desconto{coupon ? ` (${coupon.code})` : ""}</dt><dd>- R$ {discount.toFixed(2).replace(".", ",")}</dd></div>}
        <div className="flex justify-between"><dt className="text-muted-foreground">Frete</dt><dd>{shippingLabel(subtotal - discount)}</dd></div>
      </dl>
      <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
        <span className="font-semibold">Total</span>
        <span className="font-display text-2xl font-semibold">R$ {total.toFixed(2).replace(".", ",")}</span>
      </div>
    </aside>
  );
}

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60";

function Field({ label, children, cls, full }: { label: string; children: React.ReactNode; cls?: string; full?: boolean }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""} ${cls || ""}`}>
      <span className="mb-1.5 block text-xs font-medium text-foreground/70">{label}</span>
      {children}
    </label>
  );
}