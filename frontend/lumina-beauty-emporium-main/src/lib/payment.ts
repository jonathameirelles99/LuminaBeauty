// Validações e utilitários de pagamento (simulado)
export type PaymentMethod = "pix" | "credit" | "debit";

export function maskCardNumber(value: string): string {
  const v = value.replace(/\D/g, "").slice(0, 19);
  return v.replace(/(.{4})/g, "$1 ").trim();
}

export function maskExpiry(value: string): string {
  const v = value.replace(/\D/g, "").slice(0, 4);
  if (v.length >= 3) return `${v.slice(0, 2)}/${v.slice(2)}`;
  return v;
}

export function maskCvv(value: string): string {
  return value.replace(/\D/g, "").slice(0, 4);
}

export function validateCardNumber(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 13 && digits.length <= 19;
}

export function validateExpiry(value: string): boolean {
  // Formato obrigatório MM/AA — exatamente 5 chars (com /)
  if (!/^\d{2}\/\d{2}$/.test(value)) return false;
  const [mm, yy] = value.split("/").map((n) => parseInt(n, 10));
  if (mm < 1 || mm > 12) return false;
  // não expirado
  const now = new Date();
  const yearFull = 2000 + yy;
  const lastDay = new Date(yearFull, mm, 0, 23, 59, 59);
  return lastDay >= now;
}

export function validateCvv(value: string): boolean {
  return /^\d{3,4}$/.test(value);
}

// Gera um payload PIX simulado (não é um BR Code real, apenas para UX/demo)
export function generateFakePixPayload(orderId: string, amount: number): string {
  const value = amount.toFixed(2);
  const id = orderId.replace(/-/g, "").slice(0, 25).toUpperCase();
  return `00020126360014BR.GOV.BCB.PIX0114LUMINA-DEMO52040000530398654${value.length.toString().padStart(2, "0")}${value}5802BR5913LUMINA BEAUTY6009SAO PAULO62${(id.length + 4).toString().padStart(2, "0")}05${id.length.toString().padStart(2, "0")}${id}6304ABCD`;
}
