import type { Product } from "@/components/ProductCard";

export type LocalUser = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: "customer" | "admin";
};

type StoredUser = LocalUser & { password: string };

export type LocalOrder = {
  id: string;
  created_at: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  shipping_address?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string | null;
  neighborhood?: string;
  city?: string;
  state?: string;
  items: { id?: string; name: string; quantity: number; price: number }[];
  subtotal: number;
  shipping: number;
  discount: number;
  coupon_code: string | null;
  total: number;
  payment_method: string;
  status: string;
};

export type LocalCoupon = {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  starts_at: string;
  ends_at: string | null;
  active: boolean;
  created_at: string;
};

const USERS_KEY = "lumina_users";
const SESSION_KEY = "lumina_session_user_id";
const PRODUCTS_KEY = "lumina_products";
const ORDERS_KEY = "lumina_orders";
const COUPONS_KEY = "lumina_coupons";

const nowIso = () => new Date().toISOString();
const uid = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const seedProducts: (Product & { stock: number; created_at: string })[] = [
  { id: "colar-rose", name: "Colar Rosé Lumina", description: "Banho rosé delicado com ponto de luz central.", price: 129.9, category: "Acessórios", subcategory: "colares", image_url: "colar-rose.jpg", stock: 18, created_at: nowIso() },
  { id: "brincos-perola", name: "Brincos Pérola Aurora", description: "Pérolas sintéticas com acabamento dourado leve.", price: 89.9, category: "Acessórios", subcategory: "brincos", image_url: "brincos-perola.jpg", stock: 24, created_at: nowIso() },
  { id: "anel-ouro", name: "Anel Dourado Essencial", description: "Aro ajustável com brilho sutil para o dia a dia.", price: 79.9, category: "Acessórios", subcategory: "anéis", image_url: "anel-ouro.jpg", stock: 20, created_at: nowIso() },
  { id: "base-pele", name: "Base Skin Glow", description: "Cobertura média com acabamento luminoso.", price: 119.9, category: "Beleza", subcategory: "rosto", image_url: "base-pele.jpg", stock: 30, created_at: nowIso() },
  { id: "paleta-olhos", name: "Paleta Nude Poésie", description: "Tons neutros, acetinados e matte para composições elegantes.", price: 149.9, category: "Beleza", subcategory: "olhos", image_url: "paleta-olhos.jpg", stock: 15, created_at: nowIso() },
  { id: "batom-rose", name: "Batom Rose Velours", description: "Textura confortável com cor rosada sofisticada.", price: 59.9, category: "Beleza", subcategory: "lábios", image_url: "batom-rose.jpg", stock: 34, created_at: nowIso() },
  { id: "pinceis", name: "Kit Pincéis Soft Touch", description: "Kit versátil para pele, olhos e acabamento.", price: 179.9, category: "Beleza", subcategory: "pincéis", image_url: "pinceis.jpg", stock: 12, created_at: nowIso() },
  { id: "limpeza-facial", name: "Gel de Limpeza Floral", description: "Limpeza suave para rotina diária de skincare.", price: 69.9, category: "Skincare", subcategory: "limpeza", image_url: "limpeza-facial.jpg", stock: 28, created_at: nowIso() },
  { id: "hidratante", name: "Hidratante Cloud Cream", description: "Hidratação leve com toque aveludado.", price: 99.9, category: "Skincare", subcategory: "hidratação", image_url: "hidratante.jpg", stock: 22, created_at: nowIso() },
  { id: "mascara-facial", name: "Máscara Facial Radiance", description: "Máscara revitalizante para efeito glow imediato.", price: 49.9, category: "Skincare", subcategory: "máscaras", image_url: "mascara-facial.jpg", stock: 40, created_at: nowIso() },
  { id: "serum", name: "Sérum Vitamina C Lumi", description: "Sérum antioxidante para uniformizar o viço da pele.", price: 139.9, category: "Skincare", subcategory: "séruns", image_url: "serum.jpg", stock: 16, created_at: nowIso() },
  { id: "protetor-solar", name: "Protetor Solar Toque Seco", description: "FPS alto com acabamento invisível e confortável.", price: 84.9, category: "Skincare", subcategory: "proteção solar", image_url: "protetor-solar.jpg", stock: 26, created_at: nowIso() },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value));
}

export function ensureLocalSeed() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(USERS_KEY)) {
    write<StoredUser[]>(USERS_KEY, [{ id: uid(), email: "gerencia@lumina.com.br", password: "Lumina123.", full_name: "Gerência Lumina", phone: "", role: "admin" }]);
  }
  if (!localStorage.getItem(PRODUCTS_KEY)) write(PRODUCTS_KEY, seedProducts);
  if (!localStorage.getItem(ORDERS_KEY)) write<LocalOrder[]>(ORDERS_KEY, []);
  if (!localStorage.getItem(COUPONS_KEY)) write<LocalCoupon[]>(COUPONS_KEY, []);
}

export function getProducts() { ensureLocalSeed(); return read<(Product & { stock: number; created_at: string })[]>(PRODUCTS_KEY, seedProducts); }
export function saveProduct(product: Partial<Product & { stock: number }>) {
  const products = getProducts();
  const saved = { id: product.id || uid(), name: product.name || "", description: product.description || null, price: Number(product.price || 0), category: product.category || "Acessórios", subcategory: product.subcategory || "colares", image_url: product.image_url || null, stock: Number(product.stock || 0), created_at: "created_at" in product ? String(product.created_at) : nowIso() };
  write(PRODUCTS_KEY, product.id ? products.map((p) => p.id === product.id ? { ...p, ...saved } : p) : [saved, ...products]);
}
export function deleteProduct(id: string) { write(PRODUCTS_KEY, getProducts().filter((p) => p.id !== id)); }

export function getCoupons() { ensureLocalSeed(); return read<LocalCoupon[]>(COUPONS_KEY, []); }
export function saveCouponLocal(coupon: Partial<LocalCoupon>) {
  const coupons = getCoupons();
  const saved: LocalCoupon = { id: coupon.id || uid(), code: (coupon.code || "").trim().toUpperCase(), discount_type: coupon.discount_type || "percent", discount_value: Number(coupon.discount_value || 0), starts_at: coupon.starts_at || nowIso(), ends_at: coupon.ends_at || null, active: coupon.active ?? true, created_at: coupon.created_at || nowIso() };
  write(COUPONS_KEY, coupon.id ? coupons.map((c) => c.id === coupon.id ? saved : c) : [saved, ...coupons]);
}
export function deleteCouponLocal(id: string) { write(COUPONS_KEY, getCoupons().filter((c) => c.id !== id)); }

export function getOrders() { ensureLocalSeed(); return read<LocalOrder[]>(ORDERS_KEY, []); }
export function createOrder(order: Omit<LocalOrder, "id" | "created_at" | "status"> & { status?: string }) {
  const saved: LocalOrder = { ...order, id: uid(), created_at: nowIso(), status: order.status || "pendente" };
  write(ORDERS_KEY, [saved, ...getOrders()]);
  return saved;
}
export function updateOrderStatusLocal(id: string, status: string) { write(ORDERS_KEY, getOrders().map((o) => o.id === id ? { ...o, status } : o)); }
export function getOrdersByUser(userId: string) { return getOrders().filter((o) => o.user_id === userId); }

export function getCurrentUser(): LocalUser | null {
  ensureLocalSeed();
  const id = read<string | null>(SESSION_KEY, null);
  return read<StoredUser[]>(USERS_KEY, []).find((u) => u.id === id) ?? null;
}
export function signInLocal(email: string, password: string) {
  ensureLocalSeed();
  const user = read<StoredUser[]>(USERS_KEY, []).find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) throw new Error("E-mail ou senha incorretos");
  write(SESSION_KEY, user.id);
  window.dispatchEvent(new Event("lumina-auth-change"));
  return user as LocalUser;
}
export function signUpLocal(input: { email: string; password: string; full_name: string; phone: string }) {
  ensureLocalSeed();
  const users = read<StoredUser[]>(USERS_KEY, []);
  if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) throw new Error("E-mail já cadastrado");
  const user: StoredUser = { id: uid(), email: input.email, password: input.password, full_name: input.full_name, phone: input.phone, role: "customer" };
  write(USERS_KEY, [...users, user]);
  write(SESSION_KEY, user.id);
  window.dispatchEvent(new Event("lumina-auth-change"));
  return user as LocalUser;
}
export function signOutLocal() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event("lumina-auth-change"));
  }
}
