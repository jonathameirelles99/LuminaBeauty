import { api } from "@/lib/api";

export type Coupon = {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  starts_at: string;
  ends_at: string | null;
  active: boolean;
};

export async function findCoupon(code: string): Promise<Coupon | null> {
  const c = code.trim().toUpperCase();
  if (!c) return null;
  try {
    const data = await api.applyCoupon(c) as Coupon;
    return data;
  } catch {
    return null;
  }
}

export function calcDiscount(subtotal: number, coupon: Coupon | null): number {
  if (!coupon) return 0;
  if (coupon.discount_type === "percent") {
    return Math.min(subtotal, +(subtotal * (coupon.discount_value / 100)).toFixed(2));
  }
  return Math.min(subtotal, coupon.discount_value);
}
