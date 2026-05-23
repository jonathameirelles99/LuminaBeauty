import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogOut, Package, ShoppingBag, Plus, Trash2, Pencil } from "lucide-react";
import { Header } from "@/components/Header";
import { CATEGORIES, type CategoryName } from "@/lib/categories";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  subcategory: string;
  image_url: string | null;
  stock: number;
};

type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  coupon_code: string | null;
  payment_method: string;
  status: string;
  created_at: string;
  items: { name: string; quantity: number; price: number }[];
};

type Coupon = {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  starts_at: string;
  ends_at: string | null;
  active: boolean;
};

const ORDER_STATUSES = ["pendente", "pago", "enviado", "entregue", "cancelado"];

function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"products" | "orders" | "coupons">("products");
  const [authChecked, setAuthChecked] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("lumina_user");
    if (!raw) { navigate({ to: "/login" }); return; }
    try {
      const user = JSON.parse(raw);
      if (user.role !== "admin") { navigate({ to: "/login" }); return; }
    } catch {
      navigate({ to: "/login" }); return;
    }
    setAuthChecked(true);
    load();
  }, [navigate]);

  const load = async () => {
    try {
      const [p, o, c] = await Promise.all([api.getProducts(), api.getOrders(), api.getCoupons()]);
      setProducts(p as Product[]);
      setOrders(o as Order[]);
      setCoupons(c as Coupon[]);
    } catch {
      toast.error("Erro ao carregar dados");
    }
  };

  const saveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;
    const payload = {
      code: (editingCoupon.code || "").trim().toUpperCase(),
      discount_type: editingCoupon.discount_type || "percent",
      discount_value: Number(editingCoupon.discount_value || 0),
      starts_at: editingCoupon.starts_at || new Date().toISOString(),
      ends_at: editingCoupon.ends_at || null,
      active: editingCoupon.active ?? true,
    };
    if (!payload.code || payload.discount_value <= 0) {
      toast.error("Preencha código e valor de desconto");
      return;
    }
    try {
      await api.saveCoupon({ ...payload, id: editingCoupon.id });
      toast.success("Cupom salvo");
      setEditingCoupon(null);
      load();
    } catch {
      toast.error("Erro ao salvar cupom");
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Excluir cupom?")) return;
    try {
      await api.deleteCoupon(id);
      toast.success("Excluído");
      load();
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await api.updateOrderStatus(id, status);
      toast.success("Status atualizado");
      load();
    } catch {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("lumina_token");
    localStorage.removeItem("lumina_user");
    window.dispatchEvent(new Event("lumina-auth-change"));
    navigate({ to: "/" });
  };

  const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editing) return;

  try {
    const formData = new FormData();

    if (editing.id) {
      formData.append("id", editing.id);
    }

    formData.append("name", editing.name || "");
    formData.append("description", editing.description || "");
    formData.append("price", String(editing.price || 0));
    formData.append("category", editing.category || "");
    formData.append("subcategory", editing.subcategory || "");
    formData.append("stock", String(editing.stock || 0));

    if ((editing as any).imageFile) {
      formData.append("image", (editing as any).imageFile);
    }

    await fetch(
      `http://localhost:5000/api/products${editing.id ? `/${editing.id}` : ""}`,
      {
        method: editing.id ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("lumina_token")}`,
        },
        body: formData,
      }
    );

    toast.success("Produto salvo");
    setEditing(null);
    load();
  } catch {
    toast.error("Erro ao salvar produto");
  }
};

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir produto?")) return;
    try {
      await api.deleteProduct(id);
      toast.success("Excluído");
      load();
    } catch {
      toast.error("Erro ao excluir produto");
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-hero">
        <Header />
        <div className="p-12 text-center text-muted-foreground">Verificando acesso…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl">Painel Administrativo</h1>
            <p className="mt-1 text-sm text-muted-foreground">Gerencie produtos e pedidos</p>
          </div>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>

        <div className="mt-6 inline-flex rounded-full bg-card p-1 shadow-soft">
          <button onClick={() => setTab("products")} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${tab === "products" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            <Package className="h-4 w-4" /> Produtos ({products.length})
          </button>
          <button onClick={() => setTab("orders")} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${tab === "orders" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            <ShoppingBag className="h-4 w-4" /> Pedidos ({orders.length})
          </button>
          <button onClick={() => setTab("coupons")} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${tab === "coupons" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            Cupons ({coupons.length})
          </button>
        </div>

        {tab === "products" && (
          <section className="mt-8">
            <button onClick={() => setEditing({ category: "Acessórios", subcategory: "colares", price: 0, stock: 0 })} className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:scale-105 transition-all">
              <Plus className="h-4 w-4" /> Novo produto
            </button>
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
              <table className="w-full text-sm">
                <thead className="bg-blush/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Produto</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3">Preço</th>
                    <th className="px-4 py-3">Estoque</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.category} / {p.subcategory}</td>
                      <td className="px-4 py-3">R$ {Number(p.price).toFixed(2).replace(".", ",")}</td>
                      <td className="px-4 py-3">{p.stock}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setEditing({ id: p.id, name: p.name, description: p.description, price: p.price, category: p.category, subcategory: p.subcategory, image_url: p.imageUrl, stock: p.stock })} className="mr-2 rounded-full p-2 hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(p.id)} className="rounded-full p-2 hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "orders" && (
          <section className="mt-8 space-y-3">
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center text-muted-foreground">Nenhum pedido ainda.</div>
            ) : orders.map((o) => (
              <details key={o.id} className="group rounded-2xl border border-border/60 bg-card p-4">
                <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{o.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{o.customer_email} · {new Date(o.created_at).toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)} className="rounded-full border border-border bg-background px-3 py-1 text-xs" onClick={(e) => e.stopPropagation()}>
                      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span className="font-display text-lg font-semibold">R$ {Number(o.total).toFixed(2).replace(".", ",")}</span>
                  </div>
                </summary>
                <ul className="mt-4 space-y-1 border-t border-border/60 pt-4 text-sm">
                  {o.items.map((it, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>{it.quantity}× {it.name}</span>
                      <span>R$ {(it.price * it.quantity).toFixed(2).replace(".", ",")}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </section>
        )}

        {tab === "coupons" && (
          <section className="mt-8">
            <button onClick={() => setEditingCoupon({ discount_type: "percent", active: true })} className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:scale-105 transition-all">
              <Plus className="h-4 w-4" /> Novo cupom
            </button>
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
              <table className="w-full text-sm">
                <thead className="bg-blush/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Desconto</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {coupons.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                      <td className="px-4 py-3">{c.discount_value}{c.discount_type === "percent" ? "%" : " R$"}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${c.active ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-muted-foreground"}`}>
                          {c.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setEditingCoupon(c)} className="mr-2 rounded-full p-2 hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => deleteCoupon(c.id)} className="rounded-full p-2 hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-elegant">
            <h3 className="mb-4 font-display text-2xl">{editing.id ? "Editar" : "Novo"} produto</h3>
            <div className="space-y-3">
              <Field label="Nome"><input required value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputCls} /></Field>
              <Field label="Descrição"><textarea rows={2} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inputCls} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Preço (R$)"><input type="number" step="0.01" required value={editing.price ?? ""} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} className={inputCls} /></Field>
                <Field label="Estoque"><input type="number" value={editing.stock ?? 0} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} className={inputCls} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Categoria">
                  <select value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value, subcategory: CATEGORIES[e.target.value as CategoryName][0] })} className={inputCls}>
                    {Object.keys(CATEGORIES).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Subcategoria">
                  <select value={editing.subcategory || ""} onChange={(e) => setEditing({ ...editing, subcategory: e.target.value })} className={inputCls}>
                    {(CATEGORIES[(editing.category as CategoryName) || "Acessórios"]).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Imagem do produto">{editing.image_url && <p className="mb-1 text-xs text-muted-foreground">Atual: <span className="font-medium text-foreground">{editing.image_url}</span></p>}<label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-secondary"><span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Selecionar imagem</span><span className="text-muted-foreground">{(editing as any).imageFile?.name || "Nenhuma imagem selecionada"}</span><input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) setEditing({ ...editing, imageFile: file } as any); }} /></label></Field>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-border px-5 py-2 text-sm hover:bg-secondary">Cancelar</button>
              <button type="submit" className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-soft">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
          <form onSubmit={saveCoupon} className="w-full max-w-md rounded-2xl bg-card p-6 shadow-elegant">
            <h3 className="mb-4 font-display text-2xl">{editingCoupon.id ? "Editar" : "Novo"} cupom</h3>
            <div className="space-y-3">
              <Field label="Código"><input required value={editingCoupon.code || ""} onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })} className={inputCls} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tipo">
                  <select value={editingCoupon.discount_type || "percent"} onChange={(e) => setEditingCoupon({ ...editingCoupon, discount_type: e.target.value as "percent" | "fixed" })} className={inputCls}>
                    <option value="percent">Percentual (%)</option>
                    <option value="fixed">Fixo (R$)</option>
                  </select>
                </Field>
                <Field label="Valor"><input type="number" step="0.01" required value={editingCoupon.discount_value ?? ""} onChange={(e) => setEditingCoupon({ ...editingCoupon, discount_value: Number(e.target.value) })} className={inputCls} /></Field>
              </div>
              <Field label="Válido a partir de"><input type="datetime-local" value={editingCoupon.starts_at?.slice(0, 16) || ""} onChange={(e) => setEditingCoupon({ ...editingCoupon, starts_at: new Date(e.target.value).toISOString() })} className={inputCls} /></Field>
              <Field label="Válido até (opcional)"><input type="datetime-local" value={editingCoupon.ends_at?.slice(0, 16) || ""} onChange={(e) => setEditingCoupon({ ...editingCoupon, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })} className={inputCls} /></Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editingCoupon.active ?? true} onChange={(e) => setEditingCoupon({ ...editingCoupon, active: e.target.checked })} />
                Cupom ativo
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setEditingCoupon(null)} className="rounded-full border border-border px-5 py-2 text-sm hover:bg-secondary">Cancelar</button>
              <button type="submit" className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-soft">Salvar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-foreground/70">{label}</span>
      {children}
    </label>
  );
}
