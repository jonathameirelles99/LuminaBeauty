const BASE = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("lumina_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message ?? "Erro na requisição");
  }
  return res.json() as T;
}

// Converte produto do backend (camelCase) para o formato do frontend (snake_case)
function normalizeProduct(p: any) {
  return {
    ...p,
    image_url: p.image_url ?? p.imageUrl ?? null,
    created_at: p.created_at ?? p.createdAt ?? null,
  };
}

export const api = {
  // Auth
  register: (data: { email: string; password: string; full_name: string; phone: string }) =>
    request<{ token: string; user: any }>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (email: string, password: string) =>
    request<{ token: string; user: any }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  me: () => request<any>("/auth/me"),

  updateProfile: (data: { fullName: string; phone: string }) =>
    request<any>("/auth/me", { method: "PUT", body: JSON.stringify(data) }),

  // Produtos
  getProducts: async (params?: { category?: string; subcategory?: string; search?: string }) => {
    const filtered: Record<string, string> = {};
    if (params?.category) filtered.category = params.category;
    if (params?.subcategory) filtered.subcategory = params.subcategory;
    if (params?.search) filtered.search = params.search;
    const qs = new URLSearchParams(filtered).toString();
    const data = await request<any>(`/products${qs ? `?${qs}` : ""}`);
    const list = Array.isArray(data) ? data : [];
    return list.map(normalizeProduct);
  },

  saveProduct: (data: any) =>
    data.id
      ? request<any>(`/products/${data.id}`, { method: "PUT", body: JSON.stringify(data) })
      : request<any>("/products", { method: "POST", body: JSON.stringify(data) }),

  deleteProduct: (id: string) =>
    request<void>(`/products/${id}`, { method: "DELETE" }),

  // Pedidos
  getOrders: () => request<any[]>("/orders"),
  createOrder: (data: any) => request<any>("/orders", {
    method: "POST",
    body: JSON.stringify({
      CustomerName: data.customer_name,
      CustomerEmail: data.customer_email,
      CustomerPhone: data.customer_phone || null,
      Cep: data.cep,
      Street: data.street,
      Number: data.number,
      Complement: data.complement || null,
      Neighborhood: data.neighborhood,
      City: data.city,
      State: data.state,
      Subtotal: data.subtotal,
      Shipping: data.shipping,
      Discount: data.discount,
      CouponCode: data.coupon_code || null,
      Total: data.total,
      PaymentMethod: data.payment_method,
      Items: data.items.map((i: any) => ({
        Name: i.name,
        Quantity: i.quantity,
        Price: i.price,
      })),
    }),
  }),
  updateOrderStatus: (id: string, status: string) =>
    request<any>(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ Status: status }) }),

  // Cupons
  getCoupons: () => request<any[]>("/coupons"),
  applyCoupon: (code: string) => request<any>(`/coupons/apply?code=${code}`),
  saveCoupon: (data: any) =>
    data.id
      ? request<any>(`/coupons/${data.id}`, { method: "PUT", body: JSON.stringify(data) })
      : request<any>("/coupons", { method: "POST", body: JSON.stringify(data) }),
  deleteCoupon: (id: string) =>
    request<void>(`/coupons/${id}`, { method: "DELETE" }),
};
