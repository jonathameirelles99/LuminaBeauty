// Frete: fixo R$ 19,90, grátis acima de R$ 199
export const SHIPPING_FEE = 19.9;
export const FREE_SHIPPING_THRESHOLD = 199;

export function calcShipping(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export function shippingLabel(subtotal: number): string {
  const v = calcShipping(subtotal);
  if (v === 0) return subtotal === 0 ? "—" : "Grátis";
  return `R$ ${v.toFixed(2).replace(".", ",")}`;
}

export type ViaCepResult = {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  complemento?: string;
  erro?: boolean;
};

export async function fetchCep(cep: string): Promise<ViaCepResult | null> {
  const clean = cep.replace(/\D/g, "");
  if (clean.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return null;
    return data;
  } catch {
    return null;
  }
}

export function maskCep(value: string): string {
  const v = value.replace(/\D/g, "").slice(0, 8);
  if (v.length > 5) return `${v.slice(0, 5)}-${v.slice(5)}`;
  return v;
}
