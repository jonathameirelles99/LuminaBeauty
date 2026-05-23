// Cart persisted in localStorage (per requirement)
export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
};

const KEY = "lumina_cart_v1";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("lumina-cart-change"));
}

export function addToCart(item: Omit<CartItem, "quantity">, qty = 1) {
  const items = getCart();
  const existing = items.find((i) => i.id === item.id);
  if (existing) existing.quantity += qty;
  else items.push({ ...item, quantity: qty });
  saveCart(items);
}

export function updateQty(id: string, qty: number) {
  const items = getCart()
    .map((i) => (i.id === id ? { ...i, quantity: Math.max(0, qty) } : i))
    .filter((i) => i.quantity > 0);
  saveCart(items);
}

export function removeFromCart(id: string) {
  saveCart(getCart().filter((i) => i.id !== id));
}

export function clearCart() {
  saveCart([]);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((s, i) => s + i.price * i.quantity, 0);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((s, i) => s + i.quantity, 0);
}
